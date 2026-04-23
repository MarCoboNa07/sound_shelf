<?php
session_start();
require "connection.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$playlist_id = $_POST['playlist_id'] ?? null;
$song_id = $_POST['song_id'] ?? null;

if (!$playlist_id || !$song_id) {
    echo json_encode(["error" => "missing_params"]);
    exit;
}

// 🔒 verifica ownership playlist
$stmt = $conn->prepare("
    SELECT id FROM playlist 
    WHERE id = ? AND user_id = ?
");
$stmt->bind_param("ii", $playlist_id, $user_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["error" => "not_owner"]);
    exit;
}

// ❌ elimina brano
$stmt = $conn->prepare("
    DELETE FROM playlist_items 
    WHERE playlist_id = ? AND song_id_api = ?
");
$stmt->bind_param("ii", $playlist_id, $song_id);
$stmt->execute();

echo json_encode(["success" => true]);
?>