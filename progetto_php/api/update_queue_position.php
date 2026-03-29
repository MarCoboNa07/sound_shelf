<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$position = $_POST["position"] ?? 0;

// trova queue
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

// update
$stmt = $conn->prepare("
    UPDATE queue 
    SET current_position = ?
    WHERE id = ?
");
$stmt->bind_param("ii", $position, $queue["id"]);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>