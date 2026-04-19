<?php
session_start();
$artist_id = $_GET["artist_id"] ?? null;
?>

<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/artist.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Artista</title>
</head>

<body data-artist-id="<?php echo htmlspecialchars($artist_id); ?>">
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <header id="artist-header" class="artist-header">
                <div class="artist-header-content">
                    <span class="verified-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#3d91f4">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6.4 13l1.5-1.5 2.2 2.2 4.8-4.8 1.5 1.5-6.3 6.3z" />
                        </svg>
                        Artista verificato
                    </span>
                    <h1 id="artist-name">Caricamento...</h1>
                    <p id="artist-stats" class="artist-stats"></p>
                </div>
            </header>

            <div class="artist-body">
                <div class="artist-actions">
                    <button class="play-btn main-play" data-type="album" data-id="<?php echo $album_id; ?>">
                        <svg viewBox="0 0 16 16" width="16" height="16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                        </svg>
                    </button>
                    
                    <button class="btn-outline">Segui</button>

                    <button class="album-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots more-icon" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                        </svg>
                    </button>
                </div>

                <section class="artist-section">
                    <h2>Popolari</h2>
                    <div id="top-tracks-container" class="tracks-container">
                    </div>
                </section>

                <section class="artist-section">
                    <h2>Discografia</h2>
                    <div class="discography-grid" id="artist-albums-container">
                    </div>
                </section>
            </div>
        </div>
    </div>

    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/artist.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js"></script>
</body>
</html>