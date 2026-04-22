<?php
session_start();
require "connection.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT artist_id_api
    FROM follow
    WHERE user_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

$artists = [];

while ($row = $result->fetch_assoc()) {
    $artists[] = $row['artist_id_api'];
}

echo json_encode([
    "artists" => $artists
]);
?>