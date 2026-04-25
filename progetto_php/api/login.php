<?php
// api/login.php
// api per effettuare il login dell'utente

session_start();
require "connection.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

// input dati
$email = trim($_POST["email"] ?? "");
$password = trim($_POST["password"] ?? "");

// verifica campi obbligatori
if (!$email || !$password) {
    $_SESSION["error"] = "Compila tutti i campi";
    header("Location: ../login.php");
    exit;
}

// verifica formato email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION["error"] = "Email non valida";
    header("Location: ../login.php");
    exit;
}

// verifica se l'utente è registrato nel db
$query = "SELECT id, username, email, password FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

// utente non trovato
if ($result->num_rows === 0) {
    $_SESSION["error"] = "Utente non registrato";
    header("Location: ../login.php");
    exit;
}

// dati utente
$user = $result->fetch_assoc();

// verifica password
if (!password_verify($password, $user["password"])) {
    $_SESSION["error"] = "Password errata";
    header("Location: ../login.php");
    exit;
}

// login effettuato, crea sessioni
$_SESSION["user_id"] = $user["id"];
$_SESSION["email"] = $user["email"];
$_SESSION["username"] = $user["username"];
$_SESSION["success"] = "Login effettuato";

header("Location: ../home.php");
exit;
?>