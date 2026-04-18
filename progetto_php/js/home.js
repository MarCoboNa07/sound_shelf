// js/home.js
// file javascript per la pagina home

// funzione per caricare i dati musicali di tendenza
async function loadTrending() {
    try {
        const response = await fetch("/progetto_php/api/get_trending_data.php"); // richiesta all'api php per ottenere i dati di tendenza
        const data = await response.json();

        // renderizza i dati sulla pagina
        renderTrendingSongs(data.tracks || []);
        renderTrendingArtists(data.artists || []);
        renderTrendingAlbums(data.albums || []);

        // inizializza i caroselli
        initTrendingCarousel("songs");
        initTrendingCarousel("artists");
        initTrendingCarousel("albums");
    } catch (err) {
        console.error(err);
    }
}

// funzione per renderizzare i brani in tendenza
function renderTrendingSongs(tracks) {
    const container = document.querySelector("#trending-carousel-songs");
    container.innerHTML = "";

    tracks.forEach(item => {
        // Creiamo la card direttamente come elemento <a>
        const card = document.createElement("a");
        card.classList.add("trending-card");
        
        // L'intera card punta alla pagina del brano
        card.href = `/progetto_php/track.php?track_id=${item.id}`;

        let subtitle = `${item.explicit ? '<span class="explicit-label">E</span> ' : ''}${item.artist}`;

        card.innerHTML = `
            <div class="trending-cover-wrapper">
                <img src="${item.cover}" alt="${item.title}">
                
                <div class="trending-play play-btn"
                    data-type="song"
                    data-id="${item.id}"
                    data-title="${item.title}"
                    data-artist="${item.artist}"
                    data-cover="${item.cover}"
                    data-duration="${item.duration}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                </div>
            </div>
            <div class="trending-info">
                <span class="trending-title">${item.title}</span>
                <span class="trending-artist">${subtitle}</span>
            </div>
        `;

        // Impedisce al link della card di attivarsi se clicchi sul pulsante Play
        const playBtn = card.querySelector(".play-btn");
        playBtn.addEventListener("click", (e) => {
            e.preventDefault();  // Blocca la navigazione del tag <a> (la card)
            e.stopPropagation(); // Evita che il click risalga verso l'alto
        });

        container.appendChild(card);
    });
}

// funzione per renderizzare gli artisti in tendenza
function renderTrendingArtists(artists) {
    const container = document.querySelector("#trending-carousel-artists");
    container.innerHTML = "";

    // ciclo foreach per scorrere l'array degli artisti in tendenza
    artists.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("trending-card", "artist");

        let image = item.picture;
        let title = item.name;
        let subtitle = "Artista";

        let playButton = `
            <div class="trending-play">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </div>
        `;

        card.innerHTML = `
            <div class="trending-cover-wrapper">
                <img src="${image}" alt="${title}">
                ${playButton}
            </div>
            <div class="trending-info">
                <a href="#" class="trending-title">${title}</a>
                <a href="#" class="trending-artist">${subtitle}</a>
            </div>
        `;

        container.appendChild(card);
    });
}

// funzione per renderizzare gli album in tendenza
function renderTrendingAlbums(albums) {
    const container = document.querySelector("#trending-carousel-albums");
    container.innerHTML = "";

    // ciclo foreach per scorrere l'array degli album in tendenza
    albums.forEach(item => {
        const card = document.createElement("a");
        card.classList.add("trending-card");
        card.href = `/progetto_php/album.php?album_id=${item.id}`;

        let image = item.cover;
        let title = item.title;
        let subtitle = item.artist;

        let playButton = `
            <div class="trending-play play-btn"
                data-type="album"
                data-id="${item.id}"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </div>
        `;

        card.innerHTML = `
            <div class="trending-cover-wrapper">
                <img src="${image}" alt="${title}">
                ${playButton}
            </div>
            <div class="trending-info">
                <a href=${`/progetto_php/album.php?album_id=${item.id}`} class="trending-title">${title}</a>
                <a href="#" class="trending-artist">${subtitle}</a>
            </div>
        `;

        container.appendChild(card);
    });
}

// funzione per inizializzare i caroselli
function initTrendingCarousel(type) {
    const carousel = document.querySelector(`#trending-carousel-${type}`);
    const next = document.querySelector(`.next-trending-${type}`);
    const prev = document.querySelector(`.prev-trending-${type}`);

    // verifica che gli elementi html richiesti siano disponibili
    if (!carousel || !next || !prev) {
        return;
    }

    // funzione per scorrere in avanti il carosello
    next.addEventListener("click", () => {
        const card = carousel.querySelector(".trending-card");

        // verifica l'esistenza della card del carosello
        if (!card) {
            return;
        }

        const scrollAmount = card.offsetWidth + 18; // quanto si devono spostare le card
        carousel.scrollBy({ // scrolla il carosello
            left: scrollAmount * 3,
            behavior: "smooth"
        });
    });

    // funzione per scorrere indietro il carosello
    prev.addEventListener("click", () => {
        const card = carousel.querySelector(".trending-card");

        // verifica l'esistenza della card del carosello
        if (!card) {
            return;
        }

        const scrollAmount = card.offsetWidth + 18; // quanto si devono spostare le card
        carousel.scrollBy({ // scrolla il carosello
            left: -scrollAmount * 3,
            behavior: "smooth"
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadTrending();
});
