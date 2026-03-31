<?php
session_start();
require "connection.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "not logged"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$single = $_GET["single"] ?? null;

// recupera queue
$stmt = $conn->prepare("SELECT * FROM queue WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
$queue = $res->fetch_assoc();
$stmt->close();

if (!$queue) {
    echo json_encode(["items" => [], "current_position" => 0]);
    exit;
}

$queue_id = $queue["id"];
$items = [];

function fetchTrack($id) {
    $res = @file_get_contents("https://api.deezer.com/track/$id");
    $track = $res ? json_decode($res, true) : null;

    if (!$track || isset($track["error"])) return null;

    return [
        "song_id_api" => $id,
        "title" => $track["title"],
        "artist" => $track["artist"]["name"],
        "cover" => $track["album"]["cover_xl"],
        "duration" => $track["duration"]
    ];
}

// SINGLE TRACK
if ($single) {
    $track = fetchTrack($single);
    if ($track) $items[] = $track;
} else {
    $stmt = $conn->prepare("
        SELECT song_id_api 
        FROM queue_items 
        WHERE queue_id = ? 
        ORDER BY position ASC
    ");
    $stmt->bind_param("i", $queue_id);
    $stmt->execute();
    $res = $stmt->get_result();

    while ($row = $res->fetch_assoc()) {
        $track = fetchTrack($row["song_id_api"]);
        if ($track) $items[] = $track;
    }

    $stmt->close();
}

echo json_encode([
    "items" => $items,
    "current_position" => (int)$queue["current_position"],
    "current_time" => (int)$queue["current_song_time"]
]);
?>