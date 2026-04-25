// js/navbar.js
// file js gestire menu mobile, ricerca e trigger player

// elementi UI ricerca
const resultsBox = document.querySelector("#search-results");
const songsBox = document.querySelector("#songs-results");

let searchController = null; // stato per gestire la barra di ricerca

// gestione menu mobile
function toggleMobileMenu() {
    const openMenu = document.querySelector("#open-menu");
    const closeMenu = document.querySelector("#close-menu");
    const mobileMenu = document.querySelector("#mobile-menu");

    if (!openMenu || !closeMenu || !mobileMenu) return;

    openMenu.addEventListener("click", () => {
        mobileMenu.classList.add("menu-active");
    });

    closeMenu.addEventListener("click", () => {
        mobileMenu.classList.remove("menu-active");
    });
}

// gestione ricerca
function search() {
    const input = document.querySelector('input[name="search-query"]');
    if (!input) return;

    input.addEventListener("input", async () => {
        const query = input.value.trim();

        if (query.length < 2) {
            resultsBox?.classList.add("hidden-results");
            clearResults();
            return;
        }

        resultsBox?.classList.remove("hidden-results");

        // abort richiesta precedente
        if (searchController) searchController.abort();
        searchController = new AbortController();

        try {
            // cerca nel db
            const res = await fetch(
                `/progetto_php/api/search.php?search-query=${encodeURIComponent(query)}`,
                { signal: searchController.signal }
            );

            const data = await res.json();
            renderResults(data);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Search error:", err);
            }
        }
    });
}

// renderizza i risultati di ricerca
function renderResults(data) {
    if (!songsBox) return;
    songsBox.innerHTML = "";

    const addItems = (items, type) => {
        items.forEach(item => {
            const title = item.title || item.name;
            const artist = item.artist || item.name || "";
            const cover = item.cover || item.picture || "";
            const duration = item.duration || 0;

            let link = "#";

            if (type === "song") {
                link = `/progetto_php/track.php?track_id=${item.id}`;
            } else if (type === "album") {
                link = `/progetto_php/album.php?album_id=${item.id}`;
            } else if (type === "artist") {
                link = `/progetto_php/artist.php?artist_id=${item.id}`;
            }

            const div = document.createElement("div");
            div.className = "search-item";

            if (type === "artist") div.classList.add("artist-item");

            div.innerHTML = `
                <div class="cover-wrapper">
                    <img src="${cover}" class="${type === "artist" ? "artist-cover" : ""}">
                    <div class="cover-overlay play-btn"
                        data-type="${type}"
                        data-id="${item.id}"
                        data-title="${title}"
                        data-artist="${artist}"
                        data-cover="${cover}"
                        data-duration="${duration}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill play-icon" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                        </svg>
                    </div>
                </div>

                <div class="search-item-content">
                    <a href="${link}" class="item-title">${title}</a>
                    <div class="item-bottom">
                        <span class="item-type">
                            ${type === "artist" ? "Artista" : type === "album" ? "Album" : "Brano"}
                        </span>
                        <span class="separator">•</span>
                        <span class="item-artist">${artist}</span>
                    </div>
                </div>
            `;

            songsBox.appendChild(div);
        });
    };

    if (data.tracks) addItems(data.tracks, "song");
    if (data.albums) addItems(data.albums, "album");
    if (data.artist) addItems([data.artist], "artist");
}

// metti in play e attiva il player
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;

    e.preventDefault();

    // verifica la sessione
    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const type = btn.dataset.type;

    // brano
    if (type === "song") {
        window.startQueue?.({
            id: btn.dataset.id,
            title: btn.dataset.title,
            artist: btn.dataset.artist,
            cover: btn.dataset.cover,
            duration: parseInt(btn.dataset.duration)
        });
    }

    // album
    if (type === "album") {
        window.startAlbumQueue?.(btn.dataset.id);
    }

    // artista
    if (type === "artist") {
        window.startArtistQueue?.(btn.dataset.id);
    }
});

// nascondi i risultati di ricerca se si clicca al di fuori di essi
document.addEventListener("click", (e) => {
    const input = document.querySelector('input[name="search-query"]');

    if (
        resultsBox &&
        input &&
        !resultsBox.contains(e.target) &&
        !input.contains(e.target)
    ) {
        resultsBox.classList.add("hidden-results");
    }
});

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    toggleMobileMenu();
    search();
});