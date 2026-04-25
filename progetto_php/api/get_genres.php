<?php
// api/get_genres.php
// api per ottenere i generi musicali

header("Content-Type: application/json");

// richiesra alle api di deezer per ottenere i generi
$url = "https://api.deezer.com/genre";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

// converte risposta json in array php
$data = json_decode($response, true);
$genres = $data["data"] ?? [];

$results = [];

foreach ($genres as $genre) {

    // deezer include "all" (id = 0), lo ignoriamo
    if ($genre["id"] == 0) continue;

    // normalizzazione immagini ad alta risoluzione
    $picture = str_replace("http://", "https://", $genre["picture_medium"]);
    $picture_big = str_replace("http://", "https://", $genre["picture_big"]);

    $results[] = [
        "id" => $genre["id"],
        "name" => $genre["name"],
        "picture" => $picture,
        "picture_big" => $picture_big,
        "type" => $genre["type"]
    ];
}

echo json_encode($results);
?>