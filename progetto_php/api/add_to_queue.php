<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$song_id = $_POST["song_id"] ?? null;

if (!$song_id) {
    echo json_encode(["error" => "missing song_id"]);
    exit;
}

// 1. recupera o crea queue
$stmt = $conn->prepare("SELECT id FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$queue = $res->fetch_assoc();
$stmt->close();

if (!$queue) {
    $stmt = $conn->prepare("
        INSERT INTO queue (user_id, current_position, current_song_time, current_song_id_api)
        VALUES (?, 0, 0, ?)
    ");
    $stmt->bind_param("ii", $user_id, $song_id);
    $stmt->execute();
    $queue_id = $conn->insert_id;
    $stmt->close();
} else {
    $queue_id = $queue["id"];
}

// 2. RESET COMPLETO
$stmt = $conn->prepare("DELETE FROM queue_items WHERE queue_id = ?");
$stmt->bind_param("i", $queue_id);
$stmt->execute();
$stmt->close();

// 3. inserisci primo brano
$stmt = $conn->prepare("
    INSERT INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, 0)
");
$stmt->bind_param("ii", $queue_id, $song_id);
$stmt->execute();
$stmt->close();

// 4. aggiorna stato queue
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