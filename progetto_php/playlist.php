<?php
session_start();
$playlist_id = $_GET["playlist_id"] ?? null;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Document</title>
</head>
<body data-playlist-id="<?php echo htmlspecialchars($playlist_id); ?>">
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">

        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>
</html>