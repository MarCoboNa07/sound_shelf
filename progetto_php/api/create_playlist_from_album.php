<?php
session_start();
require "connection.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "not_logged"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$album_id = $_POST['album_id'] ?? null;

if (!$album_id) {
    echo json_encode(["success" => false, "error" => "missing_album_id"]);
    exit;
}

/**
 * 🎵 Recupera album da Deezer
 */
function getAlbumFromDeezer($album_id) {
    $url = "https://api.deezer.com/album/" . $album_id;
    $json = file_get_contents($url);

    if (!$json) return null;

    return json_decode($json, true);
}

$data = getAlbumFromDeezer($album_id);

if (!$data || empty($data['tracks']['data'])) {
    echo json_encode(["success" => false, "error" => "no_tracks"]);
    exit;
}

$tracks = $data['tracks']['data'];
$album_title = $data['title'] ?? "Album";

// 🚀 TRANSAZIONE
$conn->begin_transaction();

try {

    // 1️⃣ crea playlist
    $stmt = $conn->prepare("
        INSERT INTO playlist (name, user_id)
        VALUES (?, ?)
    ");
    $stmt->bind_param("si", $album_title, $user_id);
    $stmt->execute();

    $playlist_id = $conn->insert_id;

    // 2️⃣ inserisci tracce
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

    $conn->commit();

    echo json_encode([
        "success" => true,
        "playlist_id" => $playlist_id
    ]);

} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => "db_error"
    ]);
}
?>