<?php
// api/search.php
// api per la ricerca di brani, album e artisti tramite deezer

header("Content-Type: application/json");

// input dati
$searchQuery = $_GET["search-query"] ?? "";
$searchQuery = trim($searchQuery);

if ($searchQuery === "") {
    echo json_encode([]);
    exit;
}

// richiesta alle api di deezer per ricerca brani
function search($query, $limit = 15) {
    $url = "https://api.deezer.com/search?q=" . urlencode($query) . "&limit=$limit";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);

    $response = curl_exec($ch);

    if ($response === false) {
        curl_close($ch);
        return [];
    }

    curl_close($ch);

    $data = json_decode($response, true);
    return $data["data"] ?? [];
}

// richiesta alle api di deezer per ricerca artisti
function searchArtist($query) {
    $url = "https://api.deezer.com/search/artist?q=" . urlencode($query) . "&limit=1";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    return $data["data"][0] ?? null;
}

$data = search($searchQuery, 20);
$artistData = searchArtist($searchQuery);

$results = [
    "artist" => null,
    "albums" => [],
    "tracks" => []
];

// artista principale brano o album
if ($artistData) {
    $results["artist"] = [
        "id" => $artistData["id"],
        "name" => $artistData["name"],
        "picture" => $artistData["picture_xl"],
        "link" => $artistData["link"]
    ];
}

// album e brani
$savedAlbums = [];

foreach ($data as $item) {
    // limite tracce
    if (count($results["tracks"]) < 5) {
        $results["tracks"][] = [
            "id" => $item["id"],
            "title" => $item["title"],
            "album" => [
                "id" => $item["album"]["id"],
                "title" => $item["album"]["title"]
            ],
            "cover" => $item["album"]["cover_xl"],
            "link" => $item["link"],
            "explicit" => $item["explicit_lyrics"],
            "artist" => $item["artist"]["name"],
            "duration" => $item["duration"]
        ];
    }

    // limite album con esclusione duplicati
    $albumId = $item["album"]["id"];

    if (!in_array($albumId, $savedAlbums) && count($results["albums"]) < 5) {
        $results["albums"][] = [
            "id" => $albumId,
            "title" => $item["album"]["title"],
            "cover" => $item["album"]["cover_xl"],
            "link" => $item["album"]["link"] ?? null,
            "artist" => $item["artist"]["name"]
        ];

        $savedAlbums[] = $albumId;
    }

    // interrompi il ciclo se raggiunto il limite
    if (count($results["albums"]) >= 5 && count($results["tracks"]) >= 5) {
        break;
    }
}

echo json_encode($results);
?>