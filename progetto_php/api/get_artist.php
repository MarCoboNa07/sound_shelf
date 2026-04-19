<?php
header("Content-Type: application/json");
$artistId = $_GET["artist_id"] ?? null;

if (!$artistId) {
    echo json_encode(["error" => "ID mancante"]);
    exit;
}

function fetchDeezer($endpoint) {
    $ch = curl_init("https://api.deezer.com/" . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

// 1. Info Artista
$artist = fetchDeezer("artist/$artistId");
// 2. Top 10 Canzoni
$topTracks = fetchDeezer("artist/$artistId/top?limit=10");
// 3. Discografia
$albumsData = fetchDeezer("artist/$artistId/albums");

function getHighRes($url) {
    if (!$url) return "";
    return str_replace(['/250x250/', '/500x500/', '/small/', '/medium/', '/big/'], '/1000x1000/', $url);
}

// Potenziamento immagini Artista
$artist['picture_best'] = $artist['picture_xl'] ?? getHighRes($artist['picture'] ?? '');

// Pulizia immagini Top Tracks
$tracks = $topTracks['data'] ?? [];
foreach ($tracks as &$track) {
    $track['album']['cover_best'] = getHighRes($track['album']['cover_xl'] ?? $track['album']['cover']);
    $track['explicit'] = (bool)($track['explicit_lyrics'] ?? false);
}

// Gestione e ordinamento Discografia
$albums = $albumsData['data'] ?? [];

// --- LOGICA DI ORDINAMENTO ---
usort($albums, function($a, $b) {
    // strtotime converte la data "YYYY-MM-DD" in un timestamp numerico
    // Confrontiamo $b con $a per avere l'ordine decrescente (dal più recente)
    return strtotime($b['release_date']) <=> strtotime($a['release_date']);
});

foreach ($albums as &$album) {
    $album['cover_best'] = getHighRes($album['cover_xl'] ?? $album['cover']);

    // Se è un singolo → recupera la prima traccia
    if (($album['record_type'] ?? '') === 'single') {
        $tracksData = fetchDeezer("album/" . $album['id'] . "/tracks");

        if (!empty($tracksData['data'][0])) {
            $album['track_id'] = $tracksData['data'][0]['id'];
        } else {
            $album['track_id'] = null;
        }
    }
}

echo json_encode([
    "artist" => $artist,
    "topTracks" => $tracks,
    "albums" => $albums
], JSON_PRETTY_PRINT);
?>