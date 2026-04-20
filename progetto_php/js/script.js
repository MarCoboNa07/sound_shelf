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

async function loadQueueFromDB() {
    const res = await fetch("/progetto_php/api/get_queue.php");
    const data = await res.json();

    if (!data.items || !data.items.length) return;

    queue = data.items.map(item => ({
        id: item.song_id_api,
        title: item.title,
        artist: item.artist,
        cover: item.cover,
        duration: item.duration
    }));

    currentIndex = Math.min(data.current_position || 0, queue.length - 1);

    showPlayer();
    loadCurrentSong();
}

function fitTitleToContainer(element, maxSize = 148, minSize = 24) {
    let size = maxSize;

    element.style.whiteSpace = "nowrap";
    element.style.display = "inline-block";

    const parent = element.parentElement;

    while (size > minSize) {
        element.style.fontSize = size + "px";

        const isOverflowing =
            element.scrollWidth > parent.clientWidth;

        if (!isOverflowing) break;

        size -= 2;
    }

    element.style.fontSize = size + "px";
}

// script.js (o il tuo file JS globale)
function initCarousel(sectionId, type) {
    const carousel = document.querySelector(`#${sectionId} .trending-carousel`);
    const nextBtn = document.querySelector(`#${sectionId} .next-${type}`);
    const prevBtn = document.querySelector(`#${sectionId} .prev-${type}`);

    if (!carousel || !nextBtn || !prevBtn) return;

    nextBtn.addEventListener("click", () => {
        const card = carousel.querySelector(".trending-card");
        if (!card) return;
        const scrollAmount = card.offsetWidth + 18;
        carousel.scrollBy({ left: scrollAmount * 3, behavior: "smooth" });
    });

    prevBtn.addEventListener("click", () => {
        const card = carousel.querySelector(".trending-card");
        if (!card) return;
        const scrollAmount = card.offsetWidth + 18;
        carousel.scrollBy({ left: -scrollAmount * 3, behavior: "smooth" });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await checkSession();
    toggleMobileMenu();
    initProgressBarControls();
    search();

    if (isLogged) {
        loadQueueFromDB();
    }

    const form = document.querySelector("#search-form");
    form.addEventListener("submit", e => e.preventDefault());
});
