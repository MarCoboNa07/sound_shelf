<?php
// api/get_followed_artists.php
// api per ottenere la lista degli artisti seguiti dall'utente

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

// input dati
$user_id = $_SESSION["user_id"];

// ottieni gli artisti seguiti dall'utente dal db
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
    $artists[] = $row["artist_id_api"];
}

$stmt->close();

echo json_encode([
    "artists" => $artists
]);
?>