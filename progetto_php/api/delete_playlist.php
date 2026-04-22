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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

$playlist_id = $_POST["playlist_id"] ?? null;
$user_id = $_SESSION["user_id"];

if (!$playlist_id) {
    http_response_code(400);
    echo json_encode(["error" => "ID mancante"]);
    exit;
}

// 🔒 sicurezza: elimina solo playlist dell’utente
$query = "DELETE FROM playlist WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $playlist_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore eliminazione"]);
}
?>