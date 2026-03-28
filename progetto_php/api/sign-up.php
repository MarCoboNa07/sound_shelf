<?php 
// api/sign-up.php
// api per effettuare la registrazione dell'utente

session_start(); // crea una sessione
require "connection.php"; // importa la logica di connessione al database

// verifica che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // leggi i dati dal form
    $username = trim($_POST["username"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $password = trim($_POST["password"]);
    $confirm_password = trim($_POST["confirm_password"]);

    // verifica l'inserimento di tutti i dati
    if (!$username || !$email || !$password || !$confirm_password) {
        $_SESSION["error"] = "Compila tutti i campi";
        header("Location: ../sign-up.php");
        exit;
    }

    // verifica l'inserimento di un'email valida
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION["error"] = "Email non valida";
        header("Location: ../sign-up.php");
        exit;
    }

    // verifica che le due passwod siano uguali
    if ($password !== $confirm_password) {
        $_SESSION["error"] = "Le password devono essere uguali";
        header("Location: ../sign-up.php");
        exit;
    }

    // verifica la lunghezza minima della password
    if (strlen($password) < 8) {
        $_SESSION["error"] = "La password deve essere di almeno 8 caratteri";
        header("Location: ../sign-up.php");
        exit;
    }

    // verifica se l'utente esiste già nel db
    $query = "SELECT id FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // verifica se il numero di righe restituite dalla query è maggiore di 0 (utente già registrato)
    if ($result->num_rows > 0) {
        $_SESSION["error"] = "Email o nome utente già registrati";
        header("Location: ../sign-up.php");
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT); // hash della password

    // inserisci i dati dell'utente nel db
    $query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $username, $email, $hashed_password);
    $stmt->execute();

    $user_id = $conn->insert_id; // il DBMS inserisci l'id dell'utente incrementando quello precedente

    // crea le sessioni con i dati dell'utente
    $_SESSION["user_id"] = $user_id;
    $_SESSION["email"] = $email;
    $_SESSION["username"] = $username;
    $_SESSION["success"] = "Registrazione effettuata";

    header("Location: ../home.php"); // reindirizza l'utente alla home
    exit;
}
?>
