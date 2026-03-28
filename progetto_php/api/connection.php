<?php
// api/connection.php
// file di configurazione della connesione al database

$host = "localhost";
$user = "root";
$password = "";
$db = "sound_shelf";

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
