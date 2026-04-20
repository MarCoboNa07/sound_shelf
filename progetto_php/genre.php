<?php
$genre_id = $_GET["genre_id"] ?? null;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./css/style.css" />
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Genere</title>
</head>

<body data-genre-id="<?php echo htmlspecialchars($genre_id); ?>">
    <?php include "./components/navbar.php"; ?>
    <div class="main-content">
        <h1 id="genre-title">Caricamento...</h1>
        <div id="genre-content">
            <!-- Qui inserirai le playlist, album, artisti, tracce -->
        </div>
    </div>
    <script src="./js/script.js"></script>
    <script src="./js/genre.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>
</html>