<?php
// api/unfollow_artist.php
// api per rimuovere il follow di un artista

session_start();
require "connection.php";

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

// input dati
$artist_id = $_POST["artist_id"] ?? null;
$user_id = $_SESSION["user_id"];

// validazione input
if (!$artist_id) {
    http_response_code(400);
    echo json_encode(["error" => "missing_artist_id"]);
    exit;
}

// rimuovi il follow all'artista dal db
$query = "DELETE FROM follow WHERE user_id = ? AND artist_id_api = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();

echo json_encode([
    "success" => true,
    "message" => "Follow rimosso"
]);
?>