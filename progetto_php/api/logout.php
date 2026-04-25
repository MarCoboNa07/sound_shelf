<?php 
// api/logout.php
// api per effettuare il logout dell'utente
session_start();

$_SESSION = []; // svuola l'array globale delle sessioni
session_destroy(); // distruggi la sessione

header("Location: ../login.php");
exit;
?>
