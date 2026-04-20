// js/genre.js

async function loadGenreData() {
    try {
        const genreId = document.body.dataset.genreId;

        const response = await fetch(`/progetto_php/api/get_genre_data.php?genre_id=${genreId}`);
        const data = await response.json();

        // Banner
        renderGenreBanner(data);

        // Riusa le stesse funzioni della home
        renderTrendingSongs(data.tracks || []);
        renderTrendingArtists(data.artists || []);
        renderTrendingAlbums(data.albums || []);

        // Inizializza caroselli
        initTrendingCarousel("songs");
        initTrendingCarousel("artists");
        initTrendingCarousel("albums");

    } catch (err) {
        console.error(err);
    }
}

// Banner del genere
function renderGenreBanner(data) {
    const banner = document.querySelector("#genre-banner");

    banner.innerHTML = `
        <div class="genre-banner-content">
            <img src="${data.genre_picture}" alt="${data.genre_name}">
            <h1>${data.genre_name}</h1>
        </div>
    `;
}

// IMPORTANTE: queste funzioni NON le riscrivi
// 👉 includi home.js anche in genre.php
// oppure copiale identiche

document.addEventListener("DOMContentLoaded", () => {
    loadGenreData();
});
