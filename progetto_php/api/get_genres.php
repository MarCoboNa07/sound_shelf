<?php
// api/get_genres.php
// api per ottenre i generi musicali dalle api di Deezer

header("Content-Type: application/json"); // risposta in fomato json

// funzione per ottenre i generi dall'api di Deezer
function getGenres() {
    $url = "https://api.deezer.com/genre"; // endpoint di Deezer per ottenere i generi

    // effettua una richiesta http verso un'api
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // risposta del server di Deezer
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true); // converti i dati da json ad array
    return $data['data'] ?? [];
}

$genres = getGenres();
$results = [];

// ciclo foreach per scorrere l'array dei generi
foreach ($genres as $genre) {
    // Deezer ha un genere "All" con id 0 che spesso si ignora
    if ($genre['id'] == 0) {
        continue;
    }

    // array dei risultati
    $results[] = [
        'id' => $genre['id'],
        'name' => $genre['name'],
        'picture' => str_replace("http://", "https://", $genre['picture_medium']),
        'picture_big' => str_replace("http://", "https://", $genre['picture_big']),
        'link' => $genre['type']
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT); // restituisci i dati in formato json
?>
