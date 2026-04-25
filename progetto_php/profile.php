<?php
session_start();

// verifica la sessione dell'utente
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION["username"];
$email = $_SESSION["email"];
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/profile.css">
    <link rel="stylesheet" href="./css/navbar.css">
    <link rel="stylesheet" href="./css/player.css">
    <title>Sound Shelf | Profilo</title>
</head>

<body>
    <div class="top-container">
        <?php include "./components/navbar.php"; ?>

        <div class="main-content">
            <div class="profile-container">
                <div class="profile-card">
                    <h2>Profilo</h2>

                    <div class="profile-info">
                        <div class="info-group">
                            <span>Username</span>
                            <p><?= htmlspecialchars($username) ?></p>
                        </div>

                        <div class="info-group">
                            <span>Email</span>
                            <p><?= htmlspecialchars($email) ?></p>
                        </div>
                    </div>

                    <form action="./api/logout.php" method="post">
                        <button type="submit" class="logout-btn">Logout</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <?php include "./components/player.php"; ?>

    <script src="./js/script.js"></script>
    <script src="./js/navbar.js"></script>
    <script src="./js/player.js"></script>
</body>

</html>