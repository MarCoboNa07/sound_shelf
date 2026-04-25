<?php
// api/get_user_playlists_with_track.php
// api per ottenere tutte le playlist dell'utente con la tracklist e verificare se una traccia è già presente

session_start();
require "connection.php";

header('Content-Type: application/json');

// verifica sessione
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

// input dati
$user_id = $_SESSION['user_id'];
$song_id = $_GET['song_id'] ?? null;

// verifica se la playlist esiste nel db
$stmt = $conn->prepare("
    SELECT 
        p.id, 
        p.name,
        EXISTS (
            SELECT 1 
            FROM playlist_items pi 
            WHERE pi.playlist_id = p.id 
            AND pi.song_id_api = ?
        ) as contains
    FROM playlist p
    WHERE p.user_id = ?
");

$stmt->bind_param("ii", $song_id, $user_id);
$stmt->execute();

$result = $stmt->get_result();
$playlists = [];

while ($row = $result->fetch_assoc()) {
    $playlists[] = [
        "id" => $row["id"],
        "name" => $row["name"],
        "contains" => (bool)$row["contains"]
    ];
}

echo json_encode([
    "playlists" => $playlists
]);
?>