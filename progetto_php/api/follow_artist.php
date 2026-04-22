<?php
session_start();
require "connection.php";

// 1. Verifica login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit;
}

// 2. Verifica metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

// 3. Recupera artist_id (da Deezer)
$artist_id = $_POST["artist_id"] ?? null;

if (!$artist_id) {
    http_response_code(400);
    echo json_encode(["error" => "Artist ID mancante"]);
    exit;
}

$user_id = $_SESSION["user_id"];

// 4. Controlla se già seguito
$checkQuery = "SELECT id FROM follow WHERE user_id = ? AND artist_id_api = ?";
$stmt = $conn->prepare($checkQuery);
$stmt->bind_param("ii", $user_id, $artist_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["message" => "Artista già seguito"]);
    exit;
}

// 5. Inserisci follow
$insertQuery = "INSERT INTO follow (user_id, artist_id_api) VALUES (?, ?)";
$stmt = $conn->prepare($insertQuery);
$stmt->bind_param("ii", $user_id, $artist_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Artista seguito"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore durante il follow"]);
}
?>