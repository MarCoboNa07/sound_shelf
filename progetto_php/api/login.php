<?php 
// api/login.php
// api per effettuare il login dell'utente

session_start(); // crea una sessione
require "connection.php"; // importa la logica di connessione al database

// verifica che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // leggi i dati dal form
    $email = trim($_POST["email"] ?? "");
    $password = trim($_POST["password"] ?? "");

    // verifica l'inserimento di tutti i dati
    if (!$email || !$password) {
        $_SESSION["error"] = "Compila tutti i campi";
        header("Location: ../login.php");
        exit;
    }

    // verifica l'inserimento di un'email valida
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION["error"] = "Email non valida";
        header("Location: ../login.php");
        exit;
    }

    // verifica se l'utente esiste nel db
    $query = "SELECT id, username, email, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // verifica se il numero di righe restituite dalla query è 0 (utente non esiste nel db)
    if ($result->num_rows === 0) {
        $_SESSION["error"] = "Utente non registrato";
        header("Location: ../login.php");
        exit;
    }

    $user = $result->fetch_assoc(); // trasforma in array la riga del db contenente i dati dell'utente

    // verifica se la password inserita dall'utente è corretta
    if (!password_verify($password, $user["password"])) {
        $_SESSION["error"] = "Password errata";
        header("Location: ../login.php");
        exit;
    }

    // crea le sessioni con i dati dell'utente
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["email"] = $user["email"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["success"] = "Login effettuato";
    
    header("Location: ../home.php"); // reindirizza l'utente alla home
    exit;
}
?>
