<div class="navbar">
    <div class="nav-links">
        <a href="./home.php" class="<?= ($current_page == "home.php") ? "active-nav-link" : "" ?>">Home</a>
        <a href="./explore.php" class="<?= ($current_page == "explore.php") ? "active-nav-link" : "" ?>">Esplora</a>
        <a href="./library.php" class="<?= ($current_page == "library.php") ? "active-nav-link" : "" ?>">Libreria</a>
    </div>
    <div class="menu-mobile-icon" id="open-menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
        </svg>
    </div>

    <div class="mobile-menu" id="mobile-menu">
        <div class="mobile-menu-header" id="close-menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
        </div>
        <nav class="mobile-nav-links">
            <a href="./home.php">Home</a>
            <a href="./explore.php">Esplora</a>
            <a href="./library.php">Libreria</a>
            <?php if (isset($_SESSION["username"])): ?>
                <a href="/progetto_php/profile.php">Profilo</a>
            <?php else: ?>
                <a href="./login.php" class="menu-mobile-login-link">Accedi</a>
                <a href="./sign-up.php" class="menu-mobile-sign-up-link">Registrati</a>
            <?php endif; ?>
        </nav>
    </div>

    <form class="search-bar" id="search-form">
        <div class="nav-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search search-icon" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
            <input type="text" name="search-query" placeholder="Cerca" autocomplete="off">
            <div class="search-results hidden-results" id="search-results">
                <h3 class="search-section-title">Risultati</h3>
                <div id="songs-results"></div>
            </div>
        </div>
    </form>

    <div class="auth-links">
        <?php if (isset($_SESSION["username"])): ?>
            <a href="/progetto_php/profile.php" class="nav-username">Ciao, <?= $_SESSION["username"] ?></a>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
            </svg>
        <?php else: ?>
            <a href="./login.php" class="nav-login-link">Accedi</a>
            <a href="./sign-up.php" class="nav-sign-up-link">Registrati</a>
        <?php endif; ?>
    </div>
</div>