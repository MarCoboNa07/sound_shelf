<?php
// api/remove_from_playlist.php
// api per rimuovere un brano da una playlist

session_start();
require "connection.php";

header('Content-Type: application/json');

// verifica sessione
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

// input dati
$user_id = $_SESSION['user_id'];
$playlist_id = $_POST['playlist_id'] ?? null;
$song_id = $_POST['song_id'] ?? null;

// validazione input
if (!$playlist_id || !$song_id) {
    echo json_encode(["error" => "missing_params"]);
    exit;
}

// verifica che la playlist appartenga all'utente con una query
$stmt = $conn->prepare("
    SELECT id 
    FROM playlist 
    WHERE id = ? AND user_id = ?
");

$stmt->bind_param("ii", $playlist_id, $user_id);
$stmt->execute();

$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["error" => "not_owner"]);
    exit;
}

// elimina il brano dalla playlist nel db
$stmt = $conn->prepare("
    DELETE FROM playlist_items 
    WHERE playlist_id = ? AND song_id_api = ?
");

$stmt->bind_param("ii", $playlist_id, $song_id);
$stmt->execute();

echo json_encode(["success" => true]);
?>