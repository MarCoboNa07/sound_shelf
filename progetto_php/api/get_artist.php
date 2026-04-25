<?php
// api/get_artist.php
// api per ottenere info artista, top tracks e discografia

header("Content-Type: application/json");

// input dati
$artistId = $_GET["artist_id"] ?? null;

if (!$artistId) {
    echo json_encode(["error" => "missing_artist_id"]);
    exit;
}

// fetch api di deezer
function fetchDeezer($endpoint) {
    $ch = curl_init("https://api.deezer.com/" . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    curl_close($ch);

    return json_decode($res, true);
}

// ottieni le info dell'artista
$artist = fetchDeezer("artist/$artistId");

if (!$artist) {
    echo json_encode(["error" => "artist_not_found"]);
    exit;
}

// ottieni le top tracks
$topTracksData = fetchDeezer("artist/$artistId/top?limit=10");
$tracks = $topTracksData["data"] ?? [];

// ottieni la discografia
$albumsData = fetchDeezer("artist/$artistId/albums");
$albums = $albumsData["data"] ?? [];

// funzione per portare le immagini ad una qualità migliore
function getHighRes($url) {
    if (!$url) return "";

    return str_replace(
        ['/250x250/', '/500x500/', '/small/', '/medium/', '/big/'],
        '/1000x1000/',
        $url
    );
}

$artist["picture_best"] =
    $artist["picture_xl"] ?? getHighRes($artist["picture"] ?? "");


foreach ($tracks as &$track) {
    $track["album"]["cover_best"] =
        getHighRes($track["album"]["cover_xl"] ?? $track["album"]["cover"]);

    $track["explicit"] = (bool)($track["explicit_lyrics"] ?? false);
}

// ordina gli album dal più recente al meno recente
usort($albums, function ($a, $b) {
    return strtotime($b["release_date"]) <=> strtotime($a["release_date"]);
});

foreach ($albums as &$album) {
    $album["cover_best"] =
        getHighRes($album["cover_xl"] ?? $album["cover"]);

    // se è singolo ottieni track id
    if (($album["record_type"] ?? "") === "single") {
        $tracksData = fetchDeezer("album/" . $album["id"] . "/tracks");

        $album["track_id"] =
            $tracksData["data"][0]["id"] ?? null;
    }
}

echo json_encode([
    "artist" => $artist,
    "topTracks" => $tracks,
    "albums" => $albums
]);
?>