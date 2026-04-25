<?php
// api/get_related_tracks.php
// api per ottenere brani correlati a una traccia

session_start();
header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

// input dati
$song_id = $_GET["song_id"] ?? null;

if (!$song_id) {
    echo json_encode(["error" => "missing song_id"]);
    exit;
}

// ottieni i dati del brano principale dalle api di deezer
$ch = curl_init("https://api.deezer.com/track/$song_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$track = json_decode($response, true);

// traccia non valida
if (!$track || isset($track["error"])) {
    echo json_encode(["error" => "song not found"]);
    exit;
}

// struttura dati
$relatedTracks = [];
$addedIds = []; // evita duplicati
$fallbackCover = $track["album"]["cover_xl"] ?? "";

// ottieni i brani dello stesso album dalle api di deezer
if (!empty($track["album"]["id"])) {
    $album_id = $track["album"]["id"];

    $ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $albumRes = curl_exec($ch);
    curl_close($ch);

    $albumTracks = json_decode($albumRes, true)["data"] ?? [];

    foreach ($albumTracks as $t) {
        if ($t["id"] == $track["id"]) continue;
        if (in_array($t["id"], $addedIds)) continue;

        $relatedTracks[] = [
            "id" => $t["id"],
            "title" => $t["title"],
            "artist" => $t["artist"]["name"],
            "cover" => $t["album"]["cover_xl"] ?? $fallbackCover,
            "duration" => $t["duration"]
        ];

        $addedIds[] = $t["id"];
    }
}

// ottieni i brani dello stesso artista dalle api di deezer
if (!empty($track["artist"]["id"])) {
    $artist_id = $track["artist"]["id"];

    $ch = curl_init("https://api.deezer.com/artist/$artist_id/top?limit=20");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $artistRes = curl_exec($ch);
    curl_close($ch);

    $artistTracks = json_decode($artistRes, true)["data"] ?? [];

    foreach ($artistTracks as $t) {
        if ($t["id"] == $track["id"]) continue;
        if (in_array($t["id"], $addedIds)) continue;

        $relatedTracks[] = [
            "id" => $t["id"],
            "title" => $t["title"],
            "artist" => $t["artist"]["name"],
            "cover" => $t["album"]["cover_xl"] ?? $fallbackCover,
            "duration" => $t["duration"]
        ];

        $addedIds[] = $t["id"];
    }
}

// ottieni i brani dello stesso genere dalle api di deezer
if (!empty($track["genre_id"])) {
    $genre_id = $track["genre_id"];

    // ottieni artisti del genere dalle api di deezer
    $ch = curl_init("https://api.deezer.com/genre/$genre_id/artists");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $genreRes = curl_exec($ch);
    curl_close($ch);

    $genreArtists = json_decode($genreRes, true)["data"] ?? [];

    foreach ($genreArtists as $artist) {
        $artist_id = $artist["id"];

        // top 5 per artista
        $ch = curl_init("https://api.deezer.com/artist/$artist_id/top?limit=5");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $topRes = curl_exec($ch);
        curl_close($ch);

        $topTracks = json_decode($topRes, true)["data"] ?? [];

        foreach ($topTracks as $t) {
            if (in_array($t["id"], $addedIds)) continue;

            $relatedTracks[] = [
                "id" => $t["id"],
                "title" => $t["title"],
                "artist" => $t["artist"]["name"],
                "cover" => $t["album"]["cover_xl"] ?? $fallbackCover,
                "duration" => $t["duration"]
            ];

            $addedIds[] = $t["id"];
        }
    }
}

// random per mischiare la coda e limite a 20 tracce
shuffle($relatedTracks);
$relatedTracks = array_slice($relatedTracks, 0, 20);

echo json_encode([
    "related" => $relatedTracks
]);
?>