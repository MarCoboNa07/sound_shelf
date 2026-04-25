<?php
// api/add_to_playlist.php
// api per aggiungere un brano a una playlist dell'utente

session_start();
require "connection.php";

header('Content-Type: application/json');

// verifica sessione
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// input dati
$playlist_id = $_POST['playlist_id'] ?? null;
$song_id = $_POST['song_id'] ?? null;

if (!$playlist_id || !$song_id) {
    echo json_encode(["error" => "missing_params"]);
    exit;
}

// cerca la playlist nel db
$stmt = $conn->prepare("
    SELECT id 
    FROM playlist 
    WHERE id = ? AND user_id = ?
");

$stmt->bind_param("ii", $playlist_id, $user_id);
$stmt->execute();

$res = $stmt->get_result();

// verifica se la playlist esiste per l'utente
if ($res->num_rows === 0) {
    echo json_encode(["error" => "not_owner"]);
    exit;
}

// verifica duplicati
$stmt = $conn->prepare("
    SELECT id 
    FROM playlist_items 
    WHERE playlist_id = ? AND song_id_api = ?
");

$stmt->bind_param("ii", $playlist_id, $song_id);
$stmt->execute();

$res = $stmt->get_result();

// brano già presente nella playlist
if ($res->num_rows > 0) {
    echo json_encode(["error" => "already_added"]);
    exit;
}

// calcola la posizione in cui inserire il brano
$stmt = $conn->prepare("
    SELECT MAX(position) as max_pos 
    FROM playlist_items 
    WHERE playlist_id = ?
");

$stmt->bind_param("i", $playlist_id);
$stmt->execute();

$result = $stmt->get_result()->fetch_assoc();

// prossima posizione disponibile
$position = ($result['max_pos'] ?? -1) + 1;

// inserisci il brano nella playlist
$stmt = $conn->prepare("
    INSERT INTO playlist_items (playlist_id, song_id_api, position)
    VALUES (?, ?, ?)
");

$stmt->bind_param("iii", $playlist_id, $song_id, $position);
$stmt->execute();

echo json_encode(["success" => true]);
?>