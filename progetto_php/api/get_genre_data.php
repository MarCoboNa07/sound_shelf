<?php
// api/get_genre_data.php
// api per ottenere dati di un genere (info + tracks + artists + albums)

header("Content-Type: application/json");

// input dati
$genre_id = $_GET["genre_id"] ?? null;

if (!$genre_id || !is_numeric($genre_id)) {
    echo json_encode(["error" => "invalid_genre_id"]);
    exit;
}

// ottieni le info del genere dalle api di deezer
$ch = curl_init("https://api.deezer.com/genre/$genre_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$genreRes = curl_exec($ch);
curl_close($ch);

$genreData = json_decode($genreRes, true);

$genreName = $genreData["name"] ?? "unknown_genre";
$genrePicture = $genreData["picture_xl"] ?? "";

$searchGenre = $genreName;

// gestione generi con nome particolare tipo "Hip-Hop/Rap"
if (strpos($searchGenre, "/") !== false) {
    $searchGenre = explode("/", $searchGenre)[0];
}

// pulizia caratteri
$searchGenre = str_replace("&", "", $searchGenre);
$searchGenre = trim($searchGenre);

// ottieni i brani dalle api di deezer
$ch = curl_init("https://api.deezer.com/search?q=$searchGenre&limit=25");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resTracks = curl_exec($ch);
curl_close($ch);

$tracksRaw = json_decode($resTracks, true)["data"] ?? [];

// fallback se vuoto
if (empty($tracksRaw)) {
    $ch = curl_init("https://api.deezer.com/search?q=" . urlencode($genreName) . "&limit=25");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resTracks = curl_exec($ch);
    curl_close($ch);

    $tracksRaw = json_decode($resTracks, true)["data"] ?? [];
}

// limite finale
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
        "explicit" => $track["explicit_lyrics"] ?? false
    ];
}

// ottieni gli artisti dalle api di deezer
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

echo json_encode([
    "genre_name" => $genreName,
    "genre_picture" => $genrePicture,
    "tracks" => $tracks,
    "artists" => $artists,
    "albums" => $albums
]);
?>