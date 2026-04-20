<?php
session_start();
$genre_id = $_GET["genre_id"] ?? null;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./css/style.css" />
    <link rel="stylesheet" href="./css/genre.css">
    <link rel="stylesheet" href="./css/navbar.css" />
    <link rel="stylesheet" href="./css//player.css">
    <link rel="stylesheet" href="./css/home.css" />
    <title>Genere</title>
</head>

<body data-genre-id="<?php echo htmlspecialchars($genre_id); ?>">
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div id="genre-banner" class="genre-banner">Caricamento...</div>

            <div class="trending-container" id="genre-section">
                <div class="trending-section">
                    <div class="section-header">
                        <h2>🔥 Brani</h2>
                        <div class="carousel-controls">
                            <button class="carousel-btn prev-trending-songs">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
                                </svg>
                            </button>
                            <button class="carousel-btn next-trending-songs">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="trending-carousel" id="trending-carousel-songs"></div>
                </div>

                <div class="trending-section">
                    <div class="section-header">
                        <h2>🎤 Artisti</h2>
                        <div class="carousel-controls">
                            <button class="carousel-btn prev-trending-artists">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
                                </svg>
                            </button>
                            <button class="carousel-btn next-trending-artists">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="trending-carousel" id="trending-carousel-artists"></div>
                </div>

                <div class="trending-section">
                    <div class="section-header">
                        <h2>💿 Album</h2>
                        <div class="carousel-controls">
                            <button class="carousel-btn prev-trending-albums">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
                                </svg>
                            </button>
                            <button class="carousel-btn next-trending-albums">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="trending-carousel" id="trending-carousel-albums"></div>
                </div>
            </div>
        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/home.js"></script>
    <script src="./js/genre.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>
</html>