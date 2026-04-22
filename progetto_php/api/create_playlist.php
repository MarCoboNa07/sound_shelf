<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

// 1. Verifica login
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit;
}

// 2. Metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

// 3. Dati
$name = trim($_POST["name"] ?? "");
$description = trim($_POST["description"] ?? "");
$user_id = $_SESSION["user_id"];

// 4. Validazione
if (!$name) {
    http_response_code(400);
    echo json_encode(["error" => "Nome obbligatorio"]);
    exit;
}

// limita descrizione lato server
if (strlen($description) > 256) {
    $description = substr($description, 0, 256);
}

// 5. Insert
$query = "INSERT INTO playlist (name, description, user_id) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssi", $name, $description, $user_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "playlist_id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore creazione playlist"]);
}
?>