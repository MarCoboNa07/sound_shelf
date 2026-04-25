// js/genre.js
// file js per gestione pagina genere

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    loadGenreData();
});

// carica i generi
async function loadGenreData() {
    const genreId = document.body.dataset.genreId;
    if (!genreId) return;

    try {
        const res = await fetch(`/progetto_php/api/get_genre_data.php?genre_id=${genreId}`);
        const data = await res.json();

        renderGenreBanner(data);

        renderTrending("songs", data.tracks || []);
        renderTrending("artists", data.artists || []);
        renderTrending("albums", data.albums || []);

        initTrendingCarousel("songs");
        initTrendingCarousel("artists");
        initTrendingCarousel("albums");
    } catch (err) {
        console.error("Errore loadGenreData:", err);
    }
}

// renderizza il banner del genere
function renderGenreBanner(data) {
    const banner = document.getElementById("genre-banner");
    if (!banner) return;

    banner.innerHTML = `
        <div class="genre-banner-content">
            <img src="${data.genre_picture}" alt="${data.genre_name}">
            <h1>${data.genre_name}</h1>
        </div>
    `;
}