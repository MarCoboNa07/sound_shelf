<?php
header("Content-Type: application/json");

// Validazione input
$genre_id = $_GET["genre_id"] ?? null;

if (!$genre_id || !is_numeric($genre_id)) {
    echo json_encode(["error" => "invalid genre_id"]);
    exit;
}

// 1. INFO GENERE
$ch = curl_init("https://api.deezer.com/genre/$genre_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$genreRes = curl_exec($ch);
curl_close($ch);

$genreData = json_decode($genreRes, true);

$genreName = $genreData["name"] ?? "Genere sconosciuto";
$genrePicture = $genreData["picture_xl"] ?? "";


// 🔥 NORMALIZZAZIONE GENERE (FIX PRINCIPALE)
$searchGenre = $genreName;

// Caso: Hip-Hop/Rap → Hip-Hop
if (strpos($searchGenre, "/") !== false) {
    $searchGenre = explode("/", $searchGenre)[0];
}

// Rimuove caratteri problematici
$searchGenre = str_replace("&", "", $searchGenre);
$searchGenre = trim($searchGenre);


// 2. TRACCE (più robuste)
$ch = curl_init("https://api.deezer.com/search?q=$searchGenre&limit=25");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resTracks = curl_exec($ch);
curl_close($ch);

$tracksRaw = json_decode($resTracks, true)["data"] ?? [];

// Fallback se vuoto
if (empty($tracksRaw)) {
    $ch = curl_init("https://api.deezer.com/search?q=" . urlencode($genreName) . "&limit=25");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resTracks = curl_exec($ch);
    curl_close($ch);

    $tracksRaw = json_decode($resTracks, true)["data"] ?? [];
}

// Limite reale
$tracksRaw = array_slice($tracksRaw, 0, 10);

$tracks = [];

foreach ($tracksRaw as $track) {
    $tracks[] = [
        "id" => $track["id"],
        "title" => $track["title"],
        "artist" => $track["artist"]["name"],
        "artist_id" => $track["artist"]["id"],
        "cover" => $track["album"]["cover_xl"],
        "duration" => $track["duration"],
        "explicit" => $track["explicit_lyrics"]
    ];
}


// 3. ARTISTI
$ch = curl_init("https://api.deezer.com/search/artist?q=$searchGenre&limit=25");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resArtists = curl_exec($ch);
curl_close($ch);

$artistsRaw = json_decode($resArtists, true)["data"] ?? [];
$artistsRaw = array_slice($artistsRaw, 0, 10);

$artists = [];

foreach ($artistsRaw as $artist) {
    $artists[] = [
        "id" => $artist["id"],
        "name" => $artist["name"],
        "picture" => $artist["picture_xl"]
    ];
}


// 4. ALBUM (derivati dalle tracce)
$albumsMap = [];

foreach ($tracksRaw as $track) {
    $album = $track["album"];

    $albumsMap[$album["id"]] = [
        "id" => $album["id"],
        "title" => $album["title"],
        "cover" => $album["cover_xl"],
        "artist" => $track["artist"]["name"],
        "artist_id" => $track["artist"]["id"]
    ];
}

$albums = array_values($albumsMap);
$albums = array_slice($albums, 0, 10);


// RISPOSTA FINALE
echo json_encode([
    "genre_name" => $genreName,
    "genre_picture" => $genrePicture,
    "tracks" => $tracks,
    "artists" => $artists,
    "albums" => $albums
]);
?>