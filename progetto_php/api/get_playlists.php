<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica login
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit;
}

$user_id = $_SESSION["user_id"];

$query = "SELECT id, name, description, created_at 
          FROM playlist 
          WHERE user_id = ?
          ORDER BY created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

$playlists = [];

while ($row = $result->fetch_assoc()) {
    $playlists[] = $row;
}

echo json_encode([
    "playlists" => $playlists
]);
?>