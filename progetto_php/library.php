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
    <link rel="stylesheet" href="./css/library.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Sound Shelf | Libreria</title>
</head>

<body>
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div class="library-container">
                <div class="library-header">
                    <h1>La tua libreria</h1>
                    <button id="create-playlist-btn" class="create-btn">
                        + Crea playlist
                    </button>
                </div>
                <div class="library-section">
                    <h2>Playlist</h2>
                    <div id="playlist-list" class="playlist-list"></div>
                </div>

                <div class="library-section">
                    <h2>Artisti che segui</h2>
                    <div id="artist-list" class="artist-list"></div>
                </div>
            </div>

            <div id="playlist-modal" class="modal hidden">
                <div class="modal-content">
                    <h2>Crea nuova playlist</h2>
                    <input
                        type="text"
                        id="playlist-name"
                        placeholder="Nome playlist">

                    <textarea
                        id="playlist-description"
                        placeholder="Descrizione (opzionale)"
                        maxlength="256">
                    </textarea>
                    <span id="playlist-error" class="form-error"></span>

                    <div class="modal-actions">
                        <button id="cancel-playlist">Annulla</button>
                        <button id="save-playlist" class="primary">Crea</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/library.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>

</html>