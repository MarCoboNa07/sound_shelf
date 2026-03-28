<?php
session_start();
require_once "../db.php";

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
$stmt->execute([$user_id]);
$queue = $stmt->fetch();

if (!$queue) {
    // crea queue se non esiste
    $stmt = $conn->prepare("
        INSERT INTO queue (user_id, current_position)
        VALUES (?, 0)
    ");
    $stmt->execute([$user_id]);

    $queue_id = $conn->insert_id;
} else {
    $queue_id = $queue["id"];
}

// 2. trova ultima posizione
$stmt = $conn->prepare("
    SELECT MAX(position) as max_pos 
    FROM queue_items 
    WHERE queue_id = ?
");
$stmt->execute([$queue_id]);
$result = $stmt->fetch();

$next_position = ($result["max_pos"] !== null)
    ? $result["max_pos"] + 1
    : 0;

// 3. inserisci brano in fondo
$stmt = $conn->prepare("
    INSERT INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, ?)
");
$stmt->execute([$queue_id, $song_id, $next_position]);

echo json_encode([
    "success" => true,
    "queue_id" => $queue_id,
    "position" => $next_position
]);
?>
