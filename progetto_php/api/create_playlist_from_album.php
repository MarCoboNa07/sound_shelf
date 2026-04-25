<?php
// api/create_playlist_from_album.php
// api per creare una playlist a partire da un album 

session_start();
require "connection.php";

header('Content-Type: application/json');

// verifica sessione
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "not_logged"]);
    exit;
}

// input dati
$user_id = $_SESSION['user_id'];
$album_id = $_POST['album_id'] ?? null;

if (!$album_id) {
    echo json_encode(["success" => false, "error" => "missing_album_id"]);
    exit;
}

// ottieni gli album dalle api di deezer
$url = "https://api.deezer.com/album/" . $album_id;
$json = file_get_contents($url);
$data = json_decode($json, true);

// controllo validità album
if (!$data || empty($data['tracks']['data'])) {
    echo json_encode(["success" => false, "error" => "no_tracks"]);
    exit;
}

$tracks = $data['tracks']['data'];
$album_title = $data['title'] ?? "Album";

// crea la playlist
$stmt = $conn->prepare("
    INSERT INTO playlist (name, user_id)
    VALUES (?, ?)
");

$stmt->bind_param("si", $album_title, $user_id);
$stmt->execute();

$playlist_id = $conn->insert_id;
$stmt->close();

// aggiungi le tracce alla playlist
$stmt = $conn->prepare("
    INSERT INTO playlist_items (playlist_id, song_id_api, position)
    VALUES (?, ?, ?)
");

$position = 0;

foreach ($tracks as $track) {
    $song_id = $track['id'] ?? null;

    if (!$song_id) continue;

    $stmt->bind_param("iii", $playlist_id, $song_id, $position);
    $stmt->execute();

    $position++;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "playlist_id" => $playlist_id
]);
?>