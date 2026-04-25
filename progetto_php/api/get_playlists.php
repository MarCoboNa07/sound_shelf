<?php
// api/get_playlists.php
// api per ottenere tutte le playlist dell'utente

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit;
}

// input dati
$user_id = $_SESSION["user_id"];

// ottieni le playlist dell'utente dal db
$query = "
    SELECT id, name, description, created_at 
    FROM playlist 
    WHERE user_id = ?
    ORDER BY created_at DESC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$stmt->close();


$playlists = [];

while ($row = $result->fetch_assoc()) {
    $playlists[] = $row;
}

echo json_encode([
    "playlists" => $playlists
]);
?>