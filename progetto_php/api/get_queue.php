<?php
// api/get_queue.php
// api per ottenere la coda di riproduzione dell'utente

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

// input dati
$user_id = $_SESSION["user_id"];
$single = $_GET["single"] ?? null;

// ottieni i dati dell'utente dal db
$stmt = $conn->prepare("SELECT * FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$res = $stmt->get_result();
$queue = $res->fetch_assoc();
$stmt->close();

// nessuna coda trovata
if (!$queue) {
    echo json_encode([
        "items" => [],
        "current_position" => 0,
        "current_time" => 0
    ]);
    exit;
}

$queue_id = $queue["id"];
$items = [];

// se il brano è un singolo mettilo in play
if ($single) {
    // ottieni i dati del brano dalle api di deezer
    $res = @file_get_contents("https://api.deezer.com/track/$single");

    if ($res) {
        $track = json_decode($res, true);
        if ($track && !isset($track["error"])) {
            $items[] = [
                "song_id_api" => $single,
                "title" => $track["title"],
                "artist" => $track["artist"]["name"],
                "cover" => $track["album"]["cover_xl"],
                "duration" => $track["duration"]
            ];
        }
    }
} else {
    // ottieni la coda dal db
    $stmt = $conn->prepare("
        SELECT song_id_api 
        FROM queue_items 
        WHERE queue_id = ? 
        ORDER BY position ASC
    ");

    $stmt->bind_param("i", $queue_id);
    $stmt->execute();

    $res = $stmt->get_result();
    $stmt->close();

    // richiesta alle api di deezer per ottenere i dati dei brani in coda
    while ($row = $res->fetch_assoc()) {

        $song_id = $row["song_id_api"];

        // ottieni i dati di ogni traccia dalle api di deezer
        $response = @file_get_contents("https://api.deezer.com/track/$song_id");

        if (!$response) continue;

        $track = json_decode($response, true);

        if (!$track || isset($track["error"])) continue;

        $items[] = [
            "song_id_api" => $song_id,
            "title" => $track["title"],
            "artist" => $track["artist"]["name"],
            "cover" => $track["album"]["cover_xl"],
            "duration" => $track["duration"]
        ];
    }
}

echo json_encode([
    "items" => $items,
    "current_position" => (int)$queue["current_position"],
    "current_time" => (int)$queue["current_song_time"]
]);
?>