// ./js/script.js
// file javascript globale

let isLogged = false; // stato di login dell'utente

// funzione per verificare se l'utente è loggato
async function checkSession() {
    const response = await fetch("/progetto_php/api/check_session.php"); // richiesta all'api php per verificare la sessione
    const data = await response.json();
    isLogged = data.logged;
}

// funzione per formattare la durata di un brano in minuti e secondi
function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await checkSession();
    toggleMobileMenu();
    initProgressBarControls();
    search();

    const form = document.querySelector("#search-form");
    form.addEventListener("submit", e => e.preventDefault());
});
