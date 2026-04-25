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
    <link rel="stylesheet" href="./css/playlist.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <link rel="stylesheet" href="./css/album.css">
    <title>Sound Shelf | Playlist</title>
</head>

<body data-playlist-id="<?php echo htmlspecialchars($playlist_id); ?>">
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div id="playlist-container" class="album-page">
                <header class="album-header">
                    <img id="playlist-cover" class="album-cover" src="" alt="Cover">

                    <div class="album-info">
                        <span class="album-type">Playlist</span>
                        <h1 id="playlist-title" class="album-title">Caricamento...</h1>
                        <p id="playlist-meta" class="album-meta"></p>
                    </div>
                </header>

                <div class="album-actions">
                    <button class="play-btn main-play" data-id="<?php echo $playlist_id; ?>">
                        <svg viewBox="0 0 16 16" width="16" height="16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                        </svg>
                    </button>

                    <button class="delete-playlist-btn" id="delete-playlist-btn">Elimina</button>

                    <button class="album-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots more-icon" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                        </svg>
                    </button>
                </div>

                <div class="tracklist">
                    <div class="tracklist-header">
                        <span class="col-number">#</span>
                        <span class="col-title">Titolo</span>
                        <span class="col-rank">Ascolti</span>
                        <span></span>
                        <span class="col-duration">Durata</span>
                        <span></span>
                    </div>
                    <hr class="divider">
                    <div id="playlist-track-container" class="tracks-container"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="delete-modal" class="modal hidden">
        <div class="modal-content">
            <h3>Eliminare la playlist?</h3>
            <p>Questa azione è irreversibile.</p>

            <div class="modal-actions">
                <button id="cancel-delete">Annulla</button>
                <button id="confirm-delete" class="danger">Elimina</button>
            </div>
        </div>
    </div>

    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/album.js"></script>
    <script src="./js/playlist.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js"></script>
</body>

</html>