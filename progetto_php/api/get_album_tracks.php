<?php
session_start();
header("Content-Type: application/json");

$album_id = $_GET["album_id"] ?? null;
if (!$album_id) {
    echo json_encode(["error" => "missing album_id"]);
    exit;
}

// 1️⃣ fetch dati album (per cover)
$ch = curl_init("https://api.deezer.com/album/$album_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$albumRes = curl_exec($ch);
curl_close($ch);

$album = json_decode($albumRes, true);
$fallbackCover = $album["cover_medium"] ?? "";

// 2️⃣ fetch tracce album
$ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$tracks = json_decode($response, true)["data"] ?? [];

$albumTracks = [];
foreach ($tracks as $t) {
    $albumTracks[] = [
        "id" => $t["id"],
        "title" => $t["title"],
        "artist" => $t["artist"]["name"] ?? "",
        "cover" => $t["album"]["cover_medium"] ?? $fallbackCover, // fallback se non presente
        "duration" => $t["duration"] ?? 0
    ];
}

echo json_encode(["tracks" => $albumTracks]);
?>