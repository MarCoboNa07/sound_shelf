<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

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

// queue
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

// posizione max
$stmt = $conn->prepare("SELECT MAX(position) as max_pos FROM queue_items WHERE queue_id = ?");
$stmt->bind_param("i", $queue_id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

$position = ($row["max_pos"] !== null) ? $row["max_pos"] + 1 : 0;

// prepared
$insert = $conn->prepare("
    INSERT IGNORE INTO queue_items (queue_id, song_id_api, position)
    VALUES (?, ?, ?)
");

$check = $conn->prepare("
    SELECT 1 FROM queue_items WHERE queue_id = ? AND song_id_api = ?
");

foreach ($tracks as $track) {
    $song_id = $track["id"];

    // evita duplicati
    $check->bind_param("ii", $queue_id, $song_id);
    $check->execute();
    $exists = $check->get_result()->num_rows > 0;

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