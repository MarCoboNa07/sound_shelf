<?php 
// api/logout.php
// api per terminare la sessione dell'utente
session_start(); // avvia una sessione

$_SESSION = []; // svuola l'array globale delle sessioni
session_destroy(); // distruggi la sessione

header("Location: ../login.php"); // reindirizza l'utente alla pagina di login
exit;
?>
