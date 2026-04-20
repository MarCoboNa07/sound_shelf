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
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div class="content">
                <h1>Esplora generi musicali</h1>
                <div id="genres-container" class="genres-container"></div>
            </div>
        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/explore.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>

</html>