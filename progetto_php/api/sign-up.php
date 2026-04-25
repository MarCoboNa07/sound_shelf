<?php
// api/sign-up.php
// api per la registrazione dell'utente

session_start();
require "connection.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

// input dati
$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = trim($_POST["password"] ?? "");
$confirm_password = trim($_POST["confirm_password"] ?? "");

// campi obbligatori
if (!$username || !$email || !$password || !$confirm_password) {
    $_SESSION["error"] = "Compila tutti i campi";
    header("Location: ../sign-up.php");
    exit;
}

// verifica formato email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION["error"] = "Email non valida";
    header("Location: ../sign-up.php");
    exit;
}

// verifica che le password siano uguali
if ($password !== $confirm_password) {
    $_SESSION["error"] = "Le password devono essere uguali";
    header("Location: ../sign-up.php");
    exit;
}

// verifica lunghezza password
if (strlen($password) < 8) {
    $_SESSION["error"] = "La password deve essere di almeno 8 caratteri";
    header("Location: ../sign-up.php");
    exit;
}

// verifica se l'utente è già registrato nel db
$query = "SELECT id FROM users WHERE username = ? OR email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $username, $email);
$stmt->execute();

$result = $stmt->get_result();

// utente già registrato
if ($result->num_rows > 0) {
    $_SESSION["error"] = "Email o nome utente già registrati";
    header("Location: ../sign-up.php");
    exit;
}

// hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// inserisci i dati dell'utente nel db
$query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("sss", $username, $email, $hashed_password);
$stmt->execute();

$user_id = $conn->insert_id;

// effettua il login e crea le sessioni
$_SESSION["user_id"] = $user_id;
$_SESSION["email"] = $email;
$_SESSION["username"] = $username;
$_SESSION["success"] = "Registrazione effettuata";

header("Location: ../home.php");
exit;
?>