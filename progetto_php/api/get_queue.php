<?php 
// api/get_queue.php
// api per ottenere la coda di riproduzione

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica login
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];


// 1. recupera la queue dell'utente
$query = "SELECT id, current_position FROM queue WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$queue = $result->fetch_assoc();

// se non esiste una queue
if (!$queue) {
    echo json_encode([
        "items" => [],
        "current_position" => 0
    ]);
    exit;
}

$queue_id = $queue["id"];


// 2. recupera i brani della queue
$query = "
    SELECT song_id_api, position
    FROM queue_items
    WHERE queue_id = ?
    ORDER BY position ASC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $queue_id);
$stmt->execute();

$result = $stmt->get_result();
$items = $result->fetch_all(MYSQLI_ASSOC);


// 3. arricchisci i dati tramite API (Deezer)
$queue_items = [];

foreach ($items as $item) {
    $song_id = $item["song_id_api"];

    // chiamata API
    $response = @file_get_contents("https://api.deezer.com/track/$song_id");

    if (!$response) continue;

    $track = json_decode($response, true);

    if (!$track || isset($track["error"])) continue;

    $queue_items[] = [
        "song_id_api" => $song_id,
        "title" => $track["title"],
        "artist" => $track["artist"]["name"],
        "cover" => $track["album"]["cover_medium"],
        "duration" => $track["duration"]
    ];
}


// 4. risposta finale
echo json_encode([
    "items" => $queue_items,
    "current_position" => (int)$queue["current_position"]
]);
?>
