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

// 🔒 sicurezza: verifica che la playlist appartenga all'utente
$stmt = $conn->prepare("SELECT id FROM playlist WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $playlist_id, $user_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["error" => "not_owner"]);
    exit;
}

// ❌ evita duplicati
$stmt = $conn->prepare("
    SELECT id FROM playlist_items 
    WHERE playlist_id = ? AND song_id_api = ?
");
$stmt->bind_param("ii", $playlist_id, $song_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["error" => "already_added"]);
    exit;
}

// 📌 posizione (ultimo)
$stmt = $conn->prepare("
    SELECT MAX(position) as max_pos 
    FROM playlist_items 
    WHERE playlist_id = ?
");
$stmt->bind_param("i", $playlist_id);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

$position = ($result['max_pos'] ?? -1) + 1;

// ➕ inserimento
$stmt = $conn->prepare("
    INSERT INTO playlist_items (playlist_id, song_id_api, position)
    VALUES (?, ?, ?)
");
$stmt->bind_param("iii", $playlist_id, $song_id, $position);
$stmt->execute();

echo json_encode(["success" => true]);
?>