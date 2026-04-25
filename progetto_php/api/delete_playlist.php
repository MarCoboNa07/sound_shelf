<?php
// api/delete_playlist.php
// api per eliminare una playlist

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
$playlist_id = $_POST["playlist_id"] ?? null;
$user_id = $_SESSION["user_id"];

// 4validazione dati
if (!$playlist_id) {
    echo json_encode(["error" => "missing_id"]);
    exit;
}

// elimina la playlist dal db
$stmt = $conn->prepare("
    DELETE FROM playlist 
    WHERE id = ? AND user_id = ?
");

$stmt->bind_param("ii", $playlist_id, $user_id);
$stmt->execute();

$affected = $stmt->affected_rows;
$stmt->close();

if ($affected > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "not_found"]);
}
?>