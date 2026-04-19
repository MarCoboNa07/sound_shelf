<?php
session_start();
$track_id = $_GET["track_id"] ?? null;
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/track.css">
    <link rel="stylesheet" href="./css/album.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Brano</title>
</head>

<body data-track-id="<?php echo htmlspecialchars($track_id); ?>">
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div id="track-page-container" class="album-page">
                <header class="album-header">
                    <img id="track-cover" class="album-cover" src="" alt="Cover">
                    <div class="album-info">
                        <span class="album-type">Singolo</span>
                        <h1 id="track-title">Caricamento...</h1>
                        <p id="track-meta" class="album-meta"></p>
                    </div>
                </header>

                <div class="album-actions">
                    <button class="play-btn main-play" id="main-play-track">
                        <svg viewBox="0 0 16 16" width="16" height="16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                        </svg>
                    </button>

                    <button class="album-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle playlist-icon" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                        </svg>
                    </button>

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
                    <div id="single-track-container" class="tracks-container"></div>
                </div>
            </div>
        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/album.js"></script>
    <script src="./js/track.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js"></script>
</body>
</html>
