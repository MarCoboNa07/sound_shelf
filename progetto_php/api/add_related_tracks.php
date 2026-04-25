<?php
// api/add_related_tracks.php
// api aggiungere alla queue una lista di tracce correlate evitando duplicati

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];

$tracks = json_decode($_POST["tracks"] ?? "[]", true);

if (!$tracks || !is_array($tracks)) {
    echo json_encode(["error" => "invalid tracks"]);
    exit;
}

// ottieni la coda dal db
$stmt = $conn->prepare("SELECT id FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$res = $stmt->get_result();
$queue = $res->fetch_assoc();
$stmt->close();

if (!$queue) {
    echo json_encode(["error" => "queue not found"]);
    exit;
}

$queue_id = $queue["id"];

// ottieni l'ultimo elemento della coda
$stmt = $conn->prepare("
    SELECT MAX(position) as max_pos 
    FROM queue_items 
    WHERE queue_id = ?
");

$stmt->bind_param("i", $queue_id);
$stmt->execute();

$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

// prossima posizione disponibile
$position = ($row["max_pos"] !== null) ? $row["max_pos"] + 1 : 0;

// inserimento brani in coda
$insert = $conn->prepare("
    INSERT INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, ?)
");

// controllo duplicati
$check = $conn->prepare("
    SELECT 1 
    FROM queue_items 
    WHERE queue_id = ? AND song_id_api = ?
");

foreach ($tracks as $track) {
    $song_id = $track["id"];

    // verifica se il brano è già in queue
    $check->bind_param("ii", $queue_id, $song_id);
    $check->execute();

    $exists = $check->get_result()->num_rows > 0;

    // inserisce solo se non esiste già
    if (!$exists) {
        $insert->bind_param("iii", $queue_id, $song_id, $position);
        $insert->execute();
        $position++;
    }
}

$insert->close();
$check->close();

echo json_encode(["success" => true]);
?>