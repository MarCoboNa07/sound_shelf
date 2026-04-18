<?php
// api/search.php
// api per effettuare la ricerca di brani, album e artisti tramite le api di Deezer

header("Content-Type: application/json"); // risposta in fomato json

// leggi la query di ricerca
$searchQuery = $_GET["search-query"] ?? "";
$searchQuery = trim($searchQuery);

// verifica se la query è vuota
if ($searchQuery === "") {
    echo json_encode([]);
    exit;
}

// funzione per effettuare la ricerca tramite l'api di Deezer
function search($query, $limit = 15)
{
    $url = "https://api.deezer.com/search?q=" . urlencode($query) . "&limit=$limit"; // endpoint di Deezer per la ricerca

    // effettua una richiesta http verso un'api
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);

    // risposta del server di Deezer
    $response = curl_exec($ch);

    if ($response === false) {
        curl_close($ch);
        return [];
    }

    curl_close($ch);

    $data = json_decode($response, true); // converti i dati da json ad array
    return $data['data'] ?? [];
}

// funzione per cercare gli artisti
function searchArtist($query)
{
    $url = "https://api.deezer.com/search/artist?q=" . urlencode($query) . "&limit=1"; // endpoint di Deezer per la ricerca degli artisti

    // effettua una richiesta http verso un'api
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // risposta del server di Deezer
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true); // converti i dati da json ad array
    return $data['data'][0] ?? null;
}

$data = search($searchQuery, 20); // effettua la ricerca
$artistData = searchArtist($searchQuery); // effettua la ricerca degli artisti
$results = [ // array per salvare i risultati della ricerca
    'artist' => null,
    'albums' => [],
    'tracks' => []
];

// verifica se è stato trovato un artista
if ($artistData) {
    $results["artist"] = [ // salva l'artista nell'array dei risultati
        "id" => $artistData["id"],
        "name" => $artistData["name"],
        "picture" => $artistData["picture_xl"],
        "link" => $artistData["link"]
    ];
}

$savedAlbums = []; // array per tracciare album già salvati

// ciclo foreach per scorrere l'array dei dati restituiti
foreach ($data as $item) {
    if (count($results["tracks"]) < 5) { // verifica se sono stati trovati meno di 5 brani
        $results["tracks"][] = [ // salva il brano nell'array dei risultati
            "id" => $item["id"],
            "title" => $item["title"],
            "album" => [
                "id"    => $item["album"]["id"],
                "title" => $item["album"]["title"]
            ],
            "cover" => $item["album"]["cover_xl"],
            "link" => $item["link"],
            "explicit" => $item["explicit_lyrics"],
            "artist" => $item["artist"]["name"],
            "duration" => $item["duration"]
        ];
    }

    $albumId = $item["album"]["id"];
    if (!in_array($albumId, $savedAlbums) && count($results["albums"]) < 5) { // verifica se sono stati trovati meno di 5 album
        $results["albums"][] = [ // salva l'album nell'array dei risultati
            "id" => $item["album"]["id"],
            "title" => $item["album"]["title"],
            "cover" => $item["album"]["cover_xl"],
            "link" => $item["album"]["link"] ?? null,
            "artist" => $item["artist"]["name"]
        ];
        $savedAlbums[] = $albumId;
    }

    // se sono stati salvati almeno 5 brani e 5 album interrompi il ciclo
    if (count($results["albums"]) >= 5 && count($results["tracks"]) >= 5) {
        break;
    }
}

echo json_encode($results, JSON_PRETTY_PRINT); // restituisci i dati in formato json
?>