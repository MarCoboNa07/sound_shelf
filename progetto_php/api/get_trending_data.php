<?php
// api/get_trending_data.php
// api per ottenere artisti, album e brani in tendenza su deezer

header("Content-Type: application/json");

// richiesta alle api di deezer per ottenere le tendenze in italia
$url = "https://api.deezer.com/chart/IT";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

// conversione da json ad array php
$data = json_decode($response, true);
$results = [
    "artists" => [],
    "albums" => [],
    "tracks" => []
];

// artisti in tendenza
if (!empty($data["artists"]["data"])) {
    foreach (array_slice($data["artists"]["data"], 0, 10) as $artist) {
        $results["artists"][] = [
            "id" => $artist["id"],
            "name" => $artist["name"],
            "picture" => $artist["picture_medium"],
            "link" => $artist["link"]
        ];
    }
}

// album in tendenza
if (!empty($data["albums"]["data"])) {
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

// singoli in tendenza
if (!empty($data["tracks"]["data"])) {
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

echo json_encode($results);
?>