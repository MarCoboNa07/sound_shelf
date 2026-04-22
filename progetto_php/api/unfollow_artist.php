<?php
session_start();
require "connection.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

$artist_id = $_POST["artist_id"] ?? null;
$user_id = $_SESSION["user_id"];

$query = "DELETE FROM follow WHERE user_id = ? AND artist_id_api = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $user_id, $artist_id);

$stmt->execute();

echo json_encode(["success" => true, "message" => "Follow rimosso"]);
?>