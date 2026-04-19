// js/navbar.js
// file javascript per la navbar

// seleziona gli elementi html per mostrare i risultati di ricerca
const resultsBox = document.querySelector("#search-results");
const songsBox = document.querySelector("#songs-results");

// funzione per apertura e chiusura del menu mobile
function toggleMobileMenu() {
    // seleziona gli elementi per la gestione di apertura e chiusura
    const openMenu = document.querySelector("#open-menu");
    const closeMenu = document.querySelector("#close-menu");
    const mobileMenu = document.querySelector("#mobile-menu");

    // verifica che gli elementi siano tutti disponibili
    if (openMenu && closeMenu && mobileMenu) {
        openMenu.addEventListener("click", () => { // funzione per aprire il menu
            mobileMenu.classList.add("menu-active");
        });

        closeMenu.addEventListener("click", () => { // funzione per chiudere il menu
            mobileMenu.classList.remove("menu-active");
        });
    }
}

// funzione per la ricerca di brani, album e artisti
function search() {
    const input = document.querySelector('input[name="search-query"]'); // leggi la query inserita nell'input
    let controller;

    // funzione che viene eseguita ad ogni variazione della query sull'input
    input.addEventListener("input", async () => {
        const query = input.value.trim();

        // se la query è troppo corta nascondi i risultati
        if (query.length < 2) {
            resultsBox.classList.add("hidden-results");
            clearResults();
            return;
        }

        resultsBox.classList.remove("hidden-results"); // mostra i risultati

        // verifica se nella richiesta c'è un controller per interromperlo
        if (controller) {
            controller.abort();
        };
        controller = new AbortController(); // istanzia un oggetto AbortController() per interrompere una richiesta fetch

        try {
            const response = await fetch( // richiesta all'api php di ricerca
                `/progetto_php/api/search.php?search-query=${encodeURIComponent(query)}`,
                { signal: controller.signal }
            );

            const data = await response.json();
            renderResults(data); // renderizza i risultati di ricerca
        } catch {
            console.log("Fetch aborted");
        }
    });
}

// funzione per renderizzare i risultati di ricerca
function renderResults(data) {
    songsBox.innerHTML = "";

    function addItems(items, type) {
        items.forEach(item => {
            const title = item.title || item.name;
            const artist = item.artist || item.name || "";
            const cover = item.cover || item.picture || "";
            const duration = item.duration || 0;

            // --- NUOVA LOGICA PER IL LINK ---
            let destinationUrl = "#";

            if (type === "song") {
                // Se l'API ci restituisce una canzone, mandiamo l'utente SEMPRE alla pagina track
                // Indipendentemente dal fatto che faccia parte di un album o sia un singolo
                destinationUrl = `/progetto_php/track.php?track_id=${item.id}`;
            } else if (type === "album") {
                // Solo se l'utente clicca su un risultato della categoria Album va alla pagina album
                destinationUrl = `/progetto_php/album.php?album_id=${item.id}`;
            } else if (type === "artist") {
                destinationUrl = `/progetto_php/artist.php?artist_id=${item.id}`;
            }
            // --------------------------------

            const div = document.createElement("div");
            div.classList.add("search-item");

            if (type === "artist") {
                div.classList.add("artist-item");
            }

            div.innerHTML = `
            <div class="cover-wrapper">
                <img src="${cover}" class="${type === "artist" ? "artist-cover" : ""}">
                <div 
                    class="cover-overlay play-btn"
                    data-id="${item.id}"
                    data-type="${type}"
                    data-title="${title}"
                    data-artist="${artist}"
                    data-cover="${cover}"
                    data-duration="${duration}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill play-icon" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                </div>
            </div>

            <div class="search-item-content">
                <a href="${destinationUrl}" class="item-title">${title}</a>
                <div class="item-bottom">
                    ${type === "artist" ?
                    `<span class="item-type">Artista</span>`
                    : type === "song" ?
                        `${item.explicit ? `<span class="explicit-label">E</span>` : ""}
                        <span class="item-type">Brano</span>
                        <span class="separator">•</span>
                        <a href="#" class="item-artist">${artist}</a>`
                        : type === "album" ?
                            `<span class="item-type">Album</span>
                        <span class="separator">•</span>
                        <a href="#" class="item-artist">${artist}</a>`
                            : ""
                }
                </div>
            </div>
            `;

            songsBox.appendChild(div);
        });
    }

    // crea il corretto elemento html in base tipo di dato restituito
    if (data.tracks) addItems(data.tracks, "song");
    if (data.albums) addItems(data.albums, "album");
    if (data.artist) addItems([data.artist], "artist");
}

// fetch del brano appena cliccato (play immediato)
async function fetchTrackNow(songId) {
    const res = await fetch(`/progetto_php/api/get_queue.php?single=${songId}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return {
        id: data.items[0].song_id_api,
        title: data.items[0].title,
        artist: data.items[0].artist,
        cover: data.items[0].cover,
        duration: data.items[0].duration
    };
}

// prefetch dei prossimi brani senza bloccare la riproduzione
async function prefetchRelatedTracks(currentSongId) {
    const res = await fetch(`/progetto_php/api/get_related_tracks.php?song_id=${currentSongId}`);
    const data = await res.json();

    if (!data.related || !data.related.length) return;

    const existingIds = new Set(queue.map(s => s.id));
    const newTracks = [];

    data.related.forEach(track => {
        if (!existingIds.has(track.id)) {
            newTracks.push({
                id: track.id,
                title: track.title,
                artist: track.artist,
                cover: track.cover,
                duration: track.duration
            });
        }
    });

    // 👉 salva prima nel DB
    if (newTracks.length > 0) {
        await fetch("/progetto_php/api/add_related_tracks.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "tracks=" + encodeURIComponent(JSON.stringify(newTracks))
        });

        // 👉 SOLO DOPO aggiorni la queue locale
        queue.push(...newTracks);
    }
}

async function startQueue(song) {
    // 1. aggiungi il brano al DB
    await fetch("/progetto_php/api/add_to_queue.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `song_id=${song.id}`
    });

    // 2. fetch immediato del brano cliccato
    const track = await fetchTrackNow(song.id);
    if (!track) return;

    queue = [track];       // inizializza la coda con il primo brano
    currentIndex = 0;

    showPlayer();
    loadCurrentSong();
    startPlayback();

    // 3. fetch in background dei brani correlati
    prefetchRelatedTracks(track.id); // non await, così non blocca la riproduzione
}

// funzione per avviare la riproduzione di un album
async function startAlbumQueue(albumId) {
    const res = await fetch(`/progetto_php/api/get_album_tracks.php?album_id=${albumId}`);
    const data = await res.json();

    if (!data.tracks || data.tracks.length === 0) return;

    // 🔥 1. reset DB con PRIMA traccia
    await fetch("/progetto_php/api/add_to_queue.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `song_id=${data.tracks[0].id}`
    });

    // 🔥 2. aggiungi resto album al DB
    await fetch("/progetto_php/api/add_related_tracks.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "tracks=" + encodeURIComponent(JSON.stringify(data.tracks.slice(1)))
    });

    // 🔥 3. frontend queue
    queue = data.tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        cover: t.cover,
        duration: t.duration
    }));

    currentIndex = 0;

    showPlayer();
    loadCurrentSong();
    startPlayback();
}

// funzione per caricare la canzone nel player
function loadCurrentSong() {
    const song = queue[currentIndex]; // ottieni i dati del brano dalla coda
    if (!song) return;

    // mostra i dati del brano sul player
    document.querySelector(".song img").src = song.cover;
    document.querySelector(".song-title").textContent = song.title;
    document.querySelector(".song-artist").textContent = song.artist;

    // aggiorna l'interfaccia impostando il tempo corretto
    totalDuration = song.duration;
    currentTime = 0;
    updateProgressUI();
}

// funzione per simulare la riproduzione del brano
function startPlayback() {
    clearInterval(interval); // ripulisci l'intervallo di tempo
    isPlaying = true;

    // aggiorna il pulsante play/pausa
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";

    interval = setInterval(() => {
        // verifica se il brano non è ancora terminato
        if (currentTime < totalDuration) {
            currentTime++; // aggiorna il tempo sull'interfaccia
            updateProgressUI();
        } else {
            nextSong(); // quando il brano finisce passa al successivo
        }
    }, 1000);
}

// funzione per riprodurre il brano al click del pulsante play
document.addEventListener("click", function (e) {
    const playBtn = e.target.closest(".play-btn");

    if (!playBtn) return;

    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const type = playBtn.dataset.type;
    if (type === "song") {
        const song = {
            id: playBtn.dataset.id,
            title: playBtn.dataset.title,
            artist: playBtn.dataset.artist,
            cover: playBtn.dataset.cover,
            duration: parseInt(playBtn.dataset.duration)
        };
        startQueue(song);
    } else if (type === "album") {
        const albumId = playBtn.dataset.id;
        startAlbumQueue(albumId);
    }
});

// funzione per nascondere i risultati di ricerca se si clicca al di fuori di essi
document.addEventListener("click", function (e) {
    const resultsBox = document.querySelector("#search-results");
    const input = document.querySelector('input[name="search-query"]');

    if (!resultsBox.contains(e.target) && !input.contains(e.target)) {
        resultsBox.classList.add("hidden-results");
    }
});
