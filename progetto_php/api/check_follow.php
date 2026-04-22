<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

// Utente non loggato → non segue nulla
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["followed" => false]);
    exit;
}

$artist_id = $_GET["artist_id"] ?? null;
$user_id = $_SESSION["user_id"];

if (!$artist_id) {
    echo json_encode(["followed" => false]);
    exit;
}

$query = "SELECT id FROM follow WHERE user_id = ? AND artist_id_api = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode([
    "followed" => $result->num_rows > 0
]);
?>