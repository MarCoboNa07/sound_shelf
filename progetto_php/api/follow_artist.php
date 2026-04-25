<?php
// api/follow_artist.php
// api che permette all'utente di seguire un artista

session_start();
require "connection.php";

header("Content-Type: application/json");

// verifica sessione
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not_logged"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["error" => "invalid_method"]);
    exit;
}

// input dati
$user_id = $_SESSION["user_id"];
$artist_id = $_POST["artist_id"] ?? null;

// validazione dati
if (!$artist_id) {
    echo json_encode(["error" => "missing_artist_id"]);
    exit;
}

// verifica se l'utente segue già l'artista
$stmt = $conn->prepare("
    SELECT id 
    FROM follow 
    WHERE user_id = ? AND artist_id_api = ?
");

$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();

$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["error" => "already_following"]);
    exit;
}

$stmt->close();

// aggiungi il follow
$stmt = $conn->prepare("
    INSERT INTO follow (user_id, artist_id_api)
    VALUES (?, ?)
");

$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();

$stmt->close();

echo json_encode([
    "success" => true
]);
?>