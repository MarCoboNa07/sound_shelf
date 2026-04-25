<?php
// api/add_to_queue.php
// api per inizializzare la coda dell'utente con un nuovo brano

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];

// input dati
$song_id = $_POST["song_id"] ?? null;

if (!$song_id) {
    echo json_encode(["error" => "missing song_id"]);
    exit;
}

// ottieni la coda dal db
$stmt = $conn->prepare("SELECT id FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$res = $stmt->get_result();
$queue = $res->fetch_assoc();
$stmt->close();

// verifica se la coda esiste
if ($queue) {
    $queue_id = $queue["id"];
} else {
    // crea una nuova coda
    $stmt = $conn->prepare("
        INSERT INTO queue (user_id, current_position, current_song_time, current_song_id_api)
        VALUES (?, 0, 0, ?)
    ");

    $stmt->bind_param("ii", $user_id, $song_id);
    $stmt->execute();

    $queue_id = $conn->insert_id;
    $stmt->close();
}
// resetta la coda
$stmt = $conn->prepare("DELETE FROM queue_items WHERE queue_id = ?");
$stmt->bind_param("i", $queue_id);
$stmt->execute();
$stmt->close();

// inserisci il primo brano in coda
$stmt = $conn->prepare("
    INSERT INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, 0)
");

$stmt->bind_param("ii", $queue_id, $song_id);
$stmt->execute();
$stmt->close();

// aggiorna lo stato della coda
$stmt = $conn->prepare("
    UPDATE queue 
    SET current_position = 0,
        current_song_time = 0,
        current_song_id_api = ?
    WHERE id = ?
");

$stmt->bind_param("ii", $song_id, $queue_id);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>