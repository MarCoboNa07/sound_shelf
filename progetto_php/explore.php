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
    <link rel="stylesheet" href="./css/explore.css">
    <title>Sound Shelf | Esplora</title>
</head>
<body>
    <?php include "./components/navbar.php"; ?>
    <div class="content">
        <h1>Esplora generi musicali</h1>
        <div id="genres-container" class="genres-container"></div>
    </div>
    <script src="./js/explore.js"></script>
</body>
</html>
