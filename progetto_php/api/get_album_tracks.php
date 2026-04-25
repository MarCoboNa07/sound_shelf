<?php
// api/get_album_tracks.php
// api per ottenere informazioni album e tracklist

session_start();
header("Content-Type: application/json");

// 1input dati
$album_id = $_GET["album_id"] ?? null;

if (!$album_id) {
    echo json_encode(["error" => "missing_album_id"]);
    exit;
}

// ottieni i dati dell'album dalle api di deezer
$ch = curl_init("https://api.deezer.com/album/$album_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$albumRes = curl_exec($ch);
curl_close($ch);

$albumData = json_decode($albumRes, true);

// fallback sicurezza
if (!$albumData) {
    echo json_encode(["error" => "album_not_found"]);
    exit;
}

$albumTitle = $albumData["title"] ?? "Unknown Album";
$releaseDate = $albumData["release_date"] ?? "";

$releaseYear = !empty($releaseDate)
    ? explode("-", $releaseDate)[0]
    : "N/A";

$fallbackCover = $albumData["cover_xl"] ?? "";

// ottieni la tracklist dell'album dalle api di deezer
$ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$tracks = $data["data"] ?? [];
$albumTracks = [];

foreach ($tracks as $t) {
    $albumTracks[] = [
        "id" => $t["id"],
        "title" => $t["title"],
        "artist" => $t["artist"]["name"] ?? "",
        "artist_id" => $t["artist"]["id"] ?? null,
        "cover" => $t["album"]["cover_xl"] ?? $fallbackCover,
        "duration" => $t["duration"] ?? 0,
        "explicit" => $t["explicit_lyrics"] ?? false,
        "rank" => $t["rank"] ?? 0
    ];
}

echo json_encode([
    "album_title" => $albumTitle,
    "album_year" => $releaseYear,
    "album_cover" => $fallbackCover,
    "tracks" => $albumTracks
]);
?>