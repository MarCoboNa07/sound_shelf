<?php
session_start();
$album_id = $_GET["album_id"] ?? null; // 54852172
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/album.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css//player.css">
    <title>Document</title>
</head>

<body>

    <body data-album-id="<?php echo htmlspecialchars($album_id); ?>">
        <div class="top-container">
            <?php include "./components/navbar.php"; ?>

            <div class="main-content">
                <div id="album-container">
                    <header class="album-header">
                        <img id="album-cover" src="" alt="Cover">
                        <div class="album-info">
                            <span>ALBUM</span>
                            <h1 id="album-title">Caricamento...</h1>
                            <p id="album-meta"></p>
                        </div>
                    </header>

                    <div class="album-actions">
                        <button class="play-btn main-play" data-type="album" data-id="<?php echo $album_id; ?>">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>

                    <div class="tracklist">
                        <div class="tracklist-header">
                            <span>#</span>
                            <span>Titolo</span>
                            <span>Durata</span>
                        </div>
                        <hr>
                        <div id="tracks-container">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php include "./components/player.php"; ?>

        <script src="./js/script.js"></script>
        <script src="./js/album.js"></script>
        <script src="./js/navbar.js"></script>
        <script src="./js/player.js"></script>
    </body>
</body>

</html>