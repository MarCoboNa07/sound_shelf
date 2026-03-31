<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$song_id = $_GET["song_id"] ?? null;
if (!$song_id) {
    echo json_encode(["error" => "missing song_id"]);
    exit;
}

// ============================
// 1️⃣ Recupera i dati del brano principale da Deezer
// ============================
$ch = curl_init("https://api.deezer.com/track/$song_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$track = json_decode($response, true);
if (!$track || isset($track["error"])) {
    echo json_encode(["error" => "song not found"]);
    exit;
}

// ============================
// 2️⃣ Funzione helper per normalizzare i dati delle tracce
// ============================
function normalizeTrack($t, $fallbackCover = "") {
    $cover = $t["album"]["cover_xl"] ?? $fallbackCover ?? "";
    return [
        "id" => $t["id"] ?? 0,
        "title" => $t["title"] ?? "",
        "artist" => $t["artist"]["name"] ?? "",
        "cover" => $cover,
        "duration" => $t["duration"] ?? 0
    ];
}

// ============================
// 3️⃣ Costruisci array dei brani correlati
// ============================
$relatedTracks = [];
$fallbackCover = $track["album"]["cover_xl"] ?? "";
$addedIds = []; // per evitare duplicati

// --- Funzione per aggiungere tracce evitando duplicati ---
function addTracks(&$relatedTracks, $tracks, &$addedIds, $fallbackCover) {
    foreach ($tracks as $t) {
        if (!in_array($t["id"], $addedIds)) {
            $relatedTracks[] = normalizeTrack($t, $fallbackCover);
            $addedIds[] = $t["id"];
        }
    }
}

// --- Stesso album ---
if (!empty($track["album"]["id"])) {
    $album_id = $track["album"]["id"];
    $ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $albumRes = curl_exec($ch);
    curl_close($ch);

    $albumTracks = json_decode($albumRes, true)["data"] ?? [];
    foreach ($albumTracks as $t) {
        if ($t["id"] != $track["id"]) {
            addTracks($relatedTracks, [$t], $addedIds, $fallbackCover);
        }
    }
}

// --- Stesso artista ---
if (!empty($track["artist"]["id"])) {
    $artist_id = $track["artist"]["id"];
    $ch = curl_init("https://api.deezer.com/artist/$artist_id/top?limit=20");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $artistRes = curl_exec($ch);
    curl_close($ch);

    $artistTracks = json_decode($artistRes, true)["data"] ?? [];
    foreach ($artistTracks as $t) {
        if ($t["id"] != $track["id"]) {
            addTracks($relatedTracks, [$t], $addedIds, $fallbackCover);
        }
    }
}

// --- Stesso genere (genre_id) ---
if (!empty($track["genre_id"])) {
    $genre_id = $track["genre_id"];
    $ch = curl_init("https://api.deezer.com/genre/$genre_id/artists");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $genreRes = curl_exec($ch);
    curl_close($ch);

    $genreArtists = json_decode($genreRes, true)["data"] ?? [];
    foreach ($genreArtists as $artist) {
        $artist_id = $artist["id"];
        $ch = curl_init("https://api.deezer.com/artist/$artist_id/top?limit=5"); // top 5 per artista
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $topRes = curl_exec($ch);
        curl_close($ch);

        $topTracks = json_decode($topRes, true)["data"] ?? [];
        addTracks($relatedTracks, $topTracks, $addedIds, $fallbackCover);
    }
}

shuffle($relatedTracks);

// ============================
// 4️⃣ Limita a 20 tracce
// ============================
$relatedTracks = array_slice($relatedTracks, 0, 20);

// ============================
// 5️⃣ Risposta JSON
// ============================
echo json_encode(["related" => $relatedTracks]);
?>