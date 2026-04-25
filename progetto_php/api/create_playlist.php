<?php
// api/create_playlist.php
// api per creare una nuova playlist per l'utente

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
$name = trim($_POST["name"] ?? "");
$description = trim($_POST["description"] ?? "");

// validazione dati
if (!$name) {
    echo json_encode(["error" => "missing_name"]);
    exit;
}

// limite descrizione
if (strlen($description) > 256) {
    $description = substr($description, 0, 256);
}

// crea la playlist
$stmt = $conn->prepare("
    INSERT INTO playlist (name, description, user_id)
    VALUES (?, ?, ?)
");

$stmt->bind_param("ssi", $name, $description, $user_id);
$stmt->execute();

$playlist_id = $stmt->insert_id;
$stmt->close();

echo json_encode([
    "success" => true,
    "playlist_id" => $playlist_id
]);
?>