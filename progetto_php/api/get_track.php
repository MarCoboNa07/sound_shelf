<?php
session_start();
header("Content-Type: application/json");

$track_id = $_GET["track_id"] ?? null;
if (!$track_id) {
    echo json_encode(["error" => "missing track_id"]);
    exit;
}

$ch = curl_init("https://api.deezer.com/track/$track_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
curl_close($ch);

$data = json_decode($res, true);

if (isset($data['error'])) {
    echo json_encode(["error" => "track not found"]);
    exit;
}

// Restituiamo i dati formattati come piace al tuo frontend
echo json_encode([
    "id" => $data["id"],
    "title" => $data["title"],
    "artist" => $data["artist"]["name"],
    "artist_id" => $data["artist"]["id"],
    "album_title" => $data["album"]["title"],
    "cover" => $data["album"]["cover_xl"],
    "duration" => $data["duration"],
    "release_date" => $data["release_date"],
    "explicit" => $data["explicit_lyrics"]
]);
?>