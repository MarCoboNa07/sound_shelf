<?php
// api/add_album_to_queue.php
// api per aggiungere tutte le tracce di un album alla coda dell'utente

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$album_id = $_POST["album_id"] ?? null;

// validazione input
if (!$album_id) {
    echo json_encode(["error" => "missing album_id"]);
    exit;
}

// cerca una coda esistente nel db
$stmt = $conn->prepare("SELECT id FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$queue = $result->fetch_assoc();
$stmt->close();

// verifica se la coda esiste
if ($queue) {
    $queue_id = $queue["id"];
} else {
    // crea nuova coda
    $stmt = $conn->prepare("INSERT INTO queue (user_id, current_position) VALUES (?, 0)");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $queue_id = $conn->insert_id;
    $stmt->close();
}

// ottieni la tracklist dell'album dalle api di deezer
$ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
$tracks = json_decode($response, true)["data"] ?? [];

// errore api o album vuoto
if (empty($tracks)) {
    echo json_encode(["error" => "no tracks found"]);
    exit;
}

// posizione di partenza coda
$stmt = $conn->prepare("SELECT MAX(position) as max_pos FROM queue_items WHERE queue_id = ?");
$stmt->bind_param("i", $queue_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

// prossima posizione disponibile
$next_position = ($row["max_pos"] !== null) ? $row["max_pos"] + 1 : 0;

// inserimento tracce in coda
$stmt = $conn->prepare("
    INSERT INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, ?)
");

// inserisci tutte le tracce dell'album in ordine
foreach ($tracks as $track) {
    $stmt->bind_param("iii", $queue_id, $track["id"], $next_position);
    $stmt->execute();
    $next_position++;
}

$stmt->close();
echo json_encode(["success" => true]);
?>