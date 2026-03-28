<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$album_id = $_POST["album_id"] ?? null;
if (!$album_id) {
    echo json_encode(["error" => "missing album_id"]);
    exit;
}

// 1️⃣ recupera o crea queue
$stmt = $conn->prepare("SELECT id FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$queue = $result->fetch_assoc();
$stmt->close();

if (!$queue) {
    $stmt = $conn->prepare("INSERT INTO queue (user_id, current_position) VALUES (?, 0)");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $queue_id = $conn->insert_id;
    $stmt->close();
} else {
    $queue_id = $queue["id"];
}

// 2️⃣ fetch tracce album da Deezer
$ch = curl_init("https://api.deezer.com/album/$album_id/tracks");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$tracks = json_decode($response, true)["data"] ?? [];

// 3️⃣ trova ultima posizione
$stmt = $conn->prepare("SELECT MAX(position) as max_pos FROM queue_items WHERE queue_id = ?");
$stmt->bind_param("i", $queue_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

$next_position = ($row["max_pos"] !== null) ? $row["max_pos"] + 1 : 0;

// 4️⃣ inserisci tutte le tracce in coda nell'ordine corretto
$stmt = $conn->prepare("INSERT INTO queue_items (queue_id, song_id_api, position) VALUES (?, ?, ?)");
foreach ($tracks as $t) {
    $stmt->bind_param("iii", $queue_id, $t["id"], $next_position);
    $stmt->execute();
    $next_position++;
}
$stmt->close();

echo json_encode(["success" => true]);
?>