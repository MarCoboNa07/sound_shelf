<?php
// api/get_trending_data.php
// api per ottenere artisti, album e brani in tendenza trami le api di Deezer

header("Content-Type: application/json"); // risposta in fomato json

$url = "https://api.deezer.com/chart/IT"; // endpoint di Deezer per ottenere statistiche sui dati musicali

// effettua una richiesta http verso un'api
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// risposta del server di Deezer
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$results = [
    "artists" => [],
    "albums" => [],
    "tracks" => []
];

// verifica se sono stati trovati artisti in tendenza
if (!empty($data["artists"]["data"])) {
    // scorri l'array degli artisti in tendenza per aggiungerli all'array dei risultati
    foreach (array_slice($data["artists"]["data"], 0, 10) as $artist) {
        $results["artists"][] = [
            "id" => $artist["id"],
            "name" => $artist["name"],
            "picture" => $artist["picture_medium"],
            "link" => $artist["link"]
        ];
    }
}

// verifica se sono stati trovati album in tendenza
if (!empty($data["albums"]["data"])) {
    // scorri l'array degli album in tendenza per aggiungerli all'array dei risultati
    foreach (array_slice($data["albums"]["data"], 0, 10) as $album) {
        $results["albums"][] = [
            "id" => $album["id"],
            "title" => $album["title"],
            "cover" => $album["cover_xl"],
            "artist" => $album["artist"]["name"] ?? "",
            "artist_id" => $album["artist"]["id"],
            "link" => $album["link"]
        ];
    }
}

// verifica se sono stati trovati brani in tendenza
if (!empty($data["tracks"]["data"])) {
    // scorri l'array dei brani in tendenza per aggiungerli all'array dei risultati
    foreach (array_slice($data["tracks"]["data"], 0, 10) as $track) {
        $results["tracks"][] = [
            "id" => $track["id"],
            "title" => $track["title"],
            "artist" => $track["artist"]["name"] ?? "",
            "artist_id" => $track["artist"]["id"],
            "album" => $track["album"]["title"] ?? "",
            "cover" => $track["album"]["cover_xl"] ?? "",
            "duration" => $track["duration"],
            "preview" => $track["preview"],
            "explicit" => $track["explicit_lyrics"]
        ];
    }
}

echo json_encode($results, JSON_PRETTY_PRINT); // restituisci i dati in formato json
?>
