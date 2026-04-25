<?php
// api/check_follow.php
// api per verificare se l'utente segue un determinato artista

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["followed" => false]);
    exit;
}

// input dati
$artist_id = $_GET["artist_id"] ?? null;
$user_id = $_SESSION["user_id"];

if (!$artist_id) {
    echo json_encode(["followed" => false]);
    exit;
}

// verifica se l'utente segue l'artista
$stmt = $conn->prepare("
    SELECT id 
    FROM follow 
    WHERE user_id = ? AND artist_id_api = ?
");

$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();

$result = $stmt->get_result();

echo json_encode([
    "followed" => $result->num_rows > 0
]);
?>