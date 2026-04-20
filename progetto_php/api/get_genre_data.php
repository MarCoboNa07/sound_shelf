<?php
header("Content-Type: application/json");

$genre_id = $_GET["genre_id"] ?? null;
if (!$genre_id) {
    echo json_encode(["error" => "missing genre_id"]);
    exit;
}

// 1. fetch genre info (nome, immagine, ecc.)
$ch = curl_init("https://api.deezer.com/genre/$genre_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$genreRes = curl_exec($ch);
curl_close($ch);
$genreData = json_decode($genreRes, true);
$genreName = $genreData["name"] ?? "Genere sconosciuto";
$genrePicture = $genreData["picture_xl"] ?? "";

// 2. fetch artisti del genere (limitiamo a 10)
$ch = curl_init("https://api.deezer.com/genre/$genre_id/artists");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$responseArtists = curl_exec($ch);
curl_close($ch);
$artistsData = json_decode($responseArtists, true)["data"] ?? [];
$artistsData = array_slice($artistsData, 0, 10);

// 3. fetch album del genere (limitiamo a 10, usando gli artisti)
$albums = [];
foreach ($artistsData as $artist) {
    $artistId = $artist["id"];
    $ch = curl_init("https://api.deezer.com/artist/$artistId/albums");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    curl_close($ch);
    $albumsList = json_decode($res, true)["data"] ?? [];
    // Limitiamo a 10 album totali (non per artista)
    $albumsList = array_slice($albumsList, 0, 10);
    foreach ($albumsList as $album) {
        $albums[] = [
            "id" => $album["id"],
            "title" => $album["title"],
            "cover" => $album["cover_xl"],
            "artist" => $artist["name"]
        ];
    }
}
// Limitiamo i album totali a 10
$albums = array_slice($albums, 0, 10);

// 4. Otteniamo le tracce top di alcuni artisti del genere (limitiamo a 3 artisti)
$top_tracks = [];
$max_artisti_tracce = 3; // Numero di artisti da cui estrarre tracce
foreach ($artistsData as $index => $artist) {
    if ($index >= $max_artisti_tracce) break;
    $artistId = $artist["id"];

    // Otteniamo le top tracce dell'artista
    $ch = curl_init("https://api.deezer.com/artist/$artistId/top?limit=5");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    curl_close($ch);
    $artist_tracks = json_decode($res, true)["data"] ?? [];
    foreach ($artist_tracks as $track) {
        $top_tracks[] = [
            "id" => $track["id"],
            "title" => $track["title"],
            "artist" => $track["artist"]["name"],
            "cover" => $track["album"]["cover_xl"]
        ];
    }
}
// Limitiamo le tracce totali a 10
$top_tracks = array_slice($top_tracks, 0, 10);

// Risposta finale
echo json_encode([
    "genre_name" => $genreName,
    "genre_picture" => $genrePicture,
    "artists" => $artistsData,
    "albums" => $albums,
    "tracks" => $top_tracks
]);
?>