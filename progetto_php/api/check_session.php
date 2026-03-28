<?php
// api/check_session.php
// api per verificare la sessione dell'utente

session_start(); // avvia una sessione
header("Content-Type: application/json"); // risposta in fomato json

// verifica se esiste una sessione chiamata user_id
if (isset($_SESSION["user_id"])) {
    echo json_encode([
        "logged" => true,
        "user_id" => $_SESSION["user_id"]
    ]);
    exit;
} else {
    echo json_encode([
        "logged" => false
    ]);
    exit;
}
?>
