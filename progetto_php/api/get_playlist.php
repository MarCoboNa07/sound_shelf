<?php
session_start();
require "connection.php";

header('Content-Type: application/json');

$playlist_id = $_GET['playlist_id'] ?? null;

if (!$playlist_id) {
    echo json_encode(["error" => "missing_id"]);
    exit;
}

// 🎵 playlist info
$stmt = $conn->prepare("
    SELECT name, description 
    FROM playlist 
    WHERE id = ?
");
$stmt->bind_param("i", $playlist_id);
$stmt->execute();
$playlist = $stmt->get_result()->fetch_assoc();

if (!$playlist) {
    echo json_encode(["error" => "not_found"]);
    exit;
}

// 🎶 tracce
$stmt = $conn->prepare("
    SELECT song_id_api 
    FROM playlist_items 
    WHERE playlist_id = ?
    ORDER BY position ASC
");
$stmt->bind_param("i", $playlist_id);
$stmt->execute();
$result = $stmt->get_result();

$tracks = [];

while ($row = $result->fetch_assoc()) {
    $song_id = $row['song_id_api'];

    // 🔥 chiamata Deezer
    $json = file_get_contents("https://api.deezer.com/track/" . $song_id);
    $track = json_decode($json, true);

    if (!$track) continue;

    $tracks[] = [
        "id" => $track['id'],
        "title" => $track['title'],
        "artist" => $track['artist']['name'],
        "artist_id" => $track['artist']['id'],
        "cover" => $track['album']['cover_medium'],
        "duration" => $track['duration'],
        "rank" => $track['rank']
    ];
}

echo json_encode([
    "playlist_name" => $playlist['name'],
    "description" => $playlist['description'],
    "tracks" => $tracks
]);
?>