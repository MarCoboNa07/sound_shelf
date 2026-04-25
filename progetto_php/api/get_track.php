<?php
// api/get_track.php
// api per ottenere i dettagli di una singola traccia

session_start();
header("Content-Type: application/json");

// input dati
$track_id = $_GET["track_id"] ?? null;

if (!$track_id) {
    echo json_encode(["error" => "missing track_id"]);
    exit;
}

// ottieni i dati del brano dalle api di deezer
$ch = curl_init("https://api.deezer.com/track/$track_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$res = curl_exec($ch);
curl_close($ch);

// conversione da json ad array php
$data = json_decode($res, true);

// traccia non trovata o errore api
if (!$data || isset($data["error"])) {
    echo json_encode(["error" => "track not found"]);
    exit;
}

$response = [
    "id" => $data["id"],
    "title" => $data["title"],
    "artist" => $data["artist"]["name"],
    "artist_id" => $data["artist"]["id"],
    "album_title" => $data["album"]["title"],
    "cover" => $data["album"]["cover_xl"],
    "duration" => $data["duration"],
    "release_date" => $data["release_date"],
    "explicit" => $data["explicit_lyrics"],
    "rank" => $data["rank"] ?? 0
];

echo json_encode($response);
?>