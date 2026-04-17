<?php
session_start();
header("Content-Type: application/json");

$album_id = $_GET["album_id"] ?? null;
if (!$album_id) {
    echo json_encode(["error" => "missing album_id"]);
    exit;
}

// 1️⃣ fetch dati generali album (Titolo, Cover, Data di rilascio)
$ch = curl_init("https://api.deezer.com/album/$album_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$albumRes = curl_exec($ch);
curl_close($ch);

$albumData = json_decode($albumRes, true);

// Estraiamo i nuovi dati richiesti
$albumTitle = $albumData["title"] ?? "Unknown Album";
$releaseDate = $albumData["release_date"] ?? ""; // Formato "YYYY-MM-DD"
$releaseYear = !empty($releaseDate) ? explode("-", $releaseDate)[0] : "N/A";
$fallbackCover = $albumData["cover_xl"] ?? "";

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
        "artist_id" => $t["artist"]["id"] ?? null,
        "cover" => $t["album"]["cover_xl"] ?? $fallbackCover,
        "duration" => $t["duration"] ?? 0,
        "explicit" => $t["explicit_lyrics"]
    ];
}

// 3️⃣ Restituiamo tutto in un unico oggetto
echo json_encode([
    "album_title" => $albumTitle,
    "album_year"  => $releaseYear,
    "album_cover" => $fallbackCover,
    "tracks"      => $albumTracks
]);
?>