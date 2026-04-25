// js/explore.js
// file js per gestione pagina esplora

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    loadGenres();
});

// ottieni i generi musicali
async function loadGenres() {
    const container = document.getElementById("genres-container");
    if (!container) return;

    try {
        const res = await fetch("/progetto_php/api/get_genres.php");

        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }

        const genres = await res.json();
        if (!genres || genres.length === 0) {
            container.innerHTML = `<p class="empty-state">Nessun genere disponibile</p>`;
            return;
        }

        container.innerHTML = "";
        genres.forEach(renderGenreCard);
    } catch (err) {
        console.error("Errore caricamento generi:", err);
        container.innerHTML = `<p class="empty-state">Errore nel caricamento</p>`;
    }
}

// renderizza i generi
function renderGenreCard(genre) {
    const container = document.getElementById("genres-container");

    const card = document.createElement("a");
    card.className = "genre-card";
    card.href = `/progetto_php/genre.php?genre_id=${genre.id}`;

    // colore dinamico per genere
    const color = getGenreColor(genre.name);
    card.style.backgroundColor = color;

    card.innerHTML = `
        <div class="genre-name">${genre.name}</div>
        <img class="genre-image" src="${genre.picture}" alt="${genre.name}">
    `;

    container.appendChild(card);
}

// mappa dei colori per i generi
function getGenreColor(name) {
    const colors = {
        "pop": "#ff477e",
        "rap/hip hop": "#ff9f1c",
        "reggaeton": "#ff006e",
        "rock": "#6a4c93",
        "dance": "#06d6a0",
        "r&b": "#8338ec",
        "alternative": "#8d99ae",
        "electro": "#00f5d4",
        "folk": "#bc6c25",
        "reggae": "#2ec4b6",
        "jazz": "#118ab2",
        "country": "#bc6c25",
        "salsa": "#ff006e",
        "classica": "#8d99ae",
        "film/videogiochi": "#4361ee",
        "metal": "#3a0ca3",
        "soul & funk": "#8338ec",
        "bambini": "#ffbe0b",
        "blues": "#073b4c",
        "cumbia": "#fb5607",
        "musica africana": "#2a9d8f",
        "musica asiatica": "#f72585",
        "musica brasiliana": "#38b000",
        "musica indiana": "#ff5400",
        "musica latina": "#ff006e"
    };

    const key = name.toLowerCase().trim();
    return colors[key] || "#444444"; // fallback colore
}