// js/home.js
// file javascript per la pagina home

// crea elemento in modo sicuro
function createElement(tag, className, html = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
}

// carica brani, album e artisti in tendenza
async function loadTrending() {
    try {
        const res = await fetch("/progetto_php/api/get_trending_data.php");
        const data = await res.json();

        renderTrending("songs", data.tracks);
        renderTrending("artists", data.artists);
        renderTrending("albums", data.albums);

        initCarousels();
    } catch (err) {
        console.error("Errore loadTrending:", err);
    }
}

// funzione per renderizzare brani, album e artisti in tendenza
function renderTrending(type, items = []) {
    const container = document.getElementById(`trending-carousel-${type}`);
    if (!container) return;

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const card = createTrendingCard(type, item);
        fragment.appendChild(card);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
}

// funzione per creare le card per mostrare la musica in tendenza
function createTrendingCard(type, item) {
    const card = document.createElement("a");
    card.className = `trending-card ${type === "artists" ? "artist" : ""}`;

    // configurazione card
    let config = {
        href: "#",
        image: "",
        title: "",
        subtitle: "",
        playData: ""
    };

    // card brano
    if (type === "songs") {
        config = {
            href: `/progetto_php/track.php?track_id=${item.id}`,
            image: item.cover,
            title: item.title,
            subtitle: `${item.explicit ? '<span class="explicit-label">E</span> ' : ''}${item.artist}`,
            playData: `
                data-type="song"
                data-id="${item.id}"
                data-title="${item.title}"
                data-artist="${item.artist}"
                data-cover="${item.cover}"
                data-duration="${item.duration}"
            `
        };
    }

    // card artista
    if (type === "artists") {
        config = {
            href: `/progetto_php/artist.php?artist_id=${item.id}`,
            image: item.picture,
            title: item.name,
            subtitle: "Artista",
            playData: `data-type="artist" data-id="${item.id}"`
        };
    }

    // card album
    if (type === "albums") {
        config = {
            href: `/progetto_php/album.php?album_id=${item.id}`,
            image: item.cover,
            title: item.title,
            subtitle: item.artist,
            playData: `
                data-type="album"
                data-id="${item.id}"
                data-title="${item.title}"
                data-artist="${item.artist}"
                data-cover="${item.cover}"
            `
        };
    }

    card.href = config.href;
    card.innerHTML = `
        <div class="trending-cover-wrapper">
            <img src="${config.image}" alt="${config.title}">
            <div class="trending-play play-btn" ${config.playData}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </div>
        </div>
        <div class="trending-info">
            <span class="trending-title">${config.title}</span>
            <span class="trending-artist">${config.subtitle}</span>
        </div>
    `;
    return card;
}

// funzione per il play
document.addEventListener("click", (e) => {
    const playBtn = e.target.closest(".play-btn");
    if (!playBtn) return;

    e.preventDefault();
    e.stopPropagation();
});

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.dataset.genreId) {
        loadTrending();
    }
});
