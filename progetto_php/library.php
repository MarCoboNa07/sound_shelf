<?php
session_start();
$current_page = basename($_SERVER["PHP_SELF"]);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css//player.css">
    <title>Sound Shelf | Libreria</title>
</head>
<body>
    <?php include "./components/navbar.php"; ?>
    <h1>libreria</h1>
</body>
</html>
