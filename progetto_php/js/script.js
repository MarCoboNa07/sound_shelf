// js/script.js
// file javascript globale

window.isLogged = false; // inizializza stato sessione

// verifica la sessione dell'utente
async function checkSession() {
    try {
        const res = await fetch("/progetto_php/api/check_session.php");
        if (!res.ok) throw new Error("Errore sessione");

        const data = await res.json();
        window.isLogged = data.logged ?? false;

    } catch (err) {
        console.error(err);
        window.isLogged = false;
    }
}

// formatta i secondi in minuti e secondi
function formatDuration(seconds = 0) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}
window.formatDuration = formatDuration;

// carica la coda dal db
async function loadQueueFromDB() {
    try {
        const res = await fetch("/progetto_php/api/get_queue.php");
        if (!res.ok) throw new Error("Errore queue");

        const data = await res.json();
        if (!data?.items?.length) return;

        // crea la coda lato client
        queue = data.items.map(({ song_id_api, title, artist, cover, duration }) => ({
            id: song_id_api,
            title,
            artist,
            cover,
            duration
        }));
        currentIndex = Math.min(data.current_position || 0, queue.length - 1); // calcola l'indice in base alla posizione dei brani nella coda
        window.playerLoadQueue?.(queue, currentIndex);
    } catch (err) {
        console.error(err);
    }
}

// ridimensiona il titolo in base al container
function fitTitleToContainer (el, max = 120, min = 16) {
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const availableWidth = parent.clientWidth;

    let low = min;
    let high = max;

    el.style.fontSize = high + "px";

    while (high - low > 0.5) {
        const mid = (high + low) / 2;
        el.style.fontSize = mid + "px";

        if (el.scrollWidth > availableWidth) {
            high = mid;
        } else {
            low = mid;
        }
    }

    el.style.fontSize = low + "px";
};
window.fitTitleToContainer = fitTitleToContainer;

// applica gradient dinamico alla pagina album
function applyAlbumGradient([r, g, b]) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let safeR = r;
    let safeG = g;
    let safeB = b;

    // se troppo chiaro scurisci
    if (luminance > 0.6) {
        safeR *= 0.5;
        safeG *= 0.5;
        safeB *= 0.5;
    }

    safeR = Math.floor(Math.min(255, safeR));
    safeG = Math.floor(Math.min(255, safeG));
    safeB = Math.floor(Math.min(255, safeB));

    const darker = `rgb(${Math.floor(safeR * 0.5)}, ${Math.floor(safeG * 0.5)}, ${Math.floor(safeB * 0.5)})`;

    const container = document.querySelector(".main-content");

    if (!container) return;

    container.style.background = `
        linear-gradient(
            to bottom,
            rgb(${safeR}, ${safeG}, ${safeB}) 0%,
            ${darker} 40%,
            #121212 100%
        )
    `;
}
window.applyAlbumGradient = applyAlbumGradient;

// formatta il numero di streaming
function formatPlays(num) {
    if (!num) return "—";
    return num.toLocaleString("it-IT");
}
window.formatPlays = formatPlays;

// inizializza i caroselli
function initCarousels() {
    document.querySelectorAll(".trending-section").forEach(section => {
        const carousel = section.querySelector(".trending-carousel");
        const next = section.querySelector(".next-trending-songs, .next-trending-artists, .next-trending-albums");
        const prev = section.querySelector(".prev-trending-songs, .prev-trending-artists, .prev-trending-albums");

        if (!carousel) return;

        // calcola la dimensione dei caroselli
        const scroll = dir => {
            const card = carousel.querySelector(".trending-card");
            if (!card) return;

            const amount = (card.offsetWidth + 20) * 3;
            carousel.scrollBy({
                left: dir * amount,
                behavior: "smooth"
            });
        };

        next?.addEventListener("click", () => scroll(1));
        prev?.addEventListener("click", () => scroll(-1));
    });
}

// apri il modal della playlist
async function openPlaylistModal(songId) {
    const modal = document.getElementById("playlist-select-modal");
    const container = document.getElementById("playlist-select-list");

    if (!modal || !container) return;

    modal.classList.remove("hidden");
    container.textContent = "Caricamento...";

    try {
        const res = await fetch(`/progetto_php/api/get_user_playlists_with_track.php?song_id=${songId}`); // ottieni le playlist dell'utente dal db
        if (!res.ok) throw new Error("Errore playlist");

        const data = await res.json();
        const fragment = document.createDocumentFragment();

        // cicla le playlist dell'utente
        data.playlists.forEach(p => {
            const item = document.createElement("div");
            item.className = "playlist-select-item";
            item.textContent = p.name;

            // verifica se il brano è già in una playlist
            if (p.contains == 1) {
                item.classList.add("disabled");
            } else {
                item.addEventListener("click", async () => {
                    await addToPlaylist(songId, p.id);
                    modal.classList.add("hidden");
                });
            }

            fragment.appendChild(item);
        });

        container.innerHTML = "";
        container.appendChild(fragment);
    } catch (err) {
        console.error(err);
        container.textContent = "Errore";
    }
}

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", async () => {
    await checkSession();

    toggleMobileMenu();
    initProgressBarControls();
    search();

    if (window.isLogged) {
        loadQueueFromDB();
    }

    const form = document.getElementById("search-form");
    form?.addEventListener("submit", e => e.preventDefault());
});