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

// funzione per ottenere i risultati principali
function pickMainResult(data, query) {
    const q = query.toLowerCase();

    // verifica se sono stati trovati brani
    if (data.tracks && data.tracks.length) {
        const exactTrack = data.tracks.find(t => t.title.toLowerCase() === q);
        if (exactTrack) {
            return { ...exactTrack, result_type: "song" };
        }
    }

    // verifica se sono stati trovati album
    if (data.albums && data.albums.length) {
        const exactAlbum = data.albums.find(a => a.title.toLowerCase() === q);
        if (exactAlbum) {
            return { ...exactAlbum, result_type: "album" };
        }
    }

    // verifica se sono stati trovati artisti
    if (data.artist && data.artist.name.toLowerCase() === q) {
        return { ...data.artist, result_type: "artist" };
    }

    // se non sono stati trovati dati corrispondenti alla query precisa aggiungi i primi risultati disponibili
    if (data.tracks && data.tracks.length) return { ...data.tracks[0], result_type: "song" };
    if (data.albums && data.albums.length) return { ...data.albums[0], result_type: "album" };
    if (data.artist) return { ...data.artist, result_type: "artist" };

    return null;
}

// funzione per renderizzare i risultati di ricerca
function renderResults(data) {
    songsBox.innerHTML = "";

    // funzione per creare il risultato di ricerca e renderizzarlo sulla pagina
    function addItems(items, type) {
        items.forEach(item => { // ciclo forech per scorrere l'array dei risultati di ricerca
            const title = item.title || item.name;
            const artist = item.artist || item.name || "";
            const cover = item.cover || item.picture || "";
            const duration = item.duration || 0;

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
                <a href="#" class="item-title">${title}</a>
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

            <div class="search-item-actions">
                ${type === "artist" ?
                    `<button class="follow-btn">Segui</button>`
                    : 
                    `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle playlist-icon" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                    ${type === "song" ? `<span class="song-duration">${formatDuration(duration)}</span>` : ""}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots more-icon" viewBox="0 0 16 16">
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                    </svg>`
                }
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

async function loadQueueFromServer() {
    const res = await fetch("/progetto_php/api/get_queue.php");
    const data = await res.json();

    // ricostruisci queue lato JS
    queue = data.items.map(item => ({
        id: item.song_id_api,
        title: item.title,
        artist: item.artist,
        cover: item.cover,
        duration: item.duration
    }));

    currentIndex = data.current_position;

    showPlayer();
    loadCurrentSong();
    startPlayback();
}

async function startQueue(song) {
    // usa add_to_queue (che crea la queue se non esiste)
    await fetch("/progetto_php/api/add_to_queue.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `song_id=${song.id}`
    });

    // ricarica queue dal server
    await loadQueueFromServer();
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

    if (!playBtn) {
        return;
    }

    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const song = {
        id: playBtn.dataset.id,
        title: playBtn.dataset.title,
        artist: playBtn.dataset.artist,
        cover: playBtn.dataset.cover,
        duration: parseInt(playBtn.dataset.duration)
    };
    startQueue(song);
});

// funzione per nascondere i risultati di ricerca se si clicca al di fuori di essi
document.addEventListener("click", function (e) {
    const resultsBox = document.querySelector("#search-results");
    const input = document.querySelector('input[name="search-query"]');

    if (!resultsBox.contains(e.target) && !input.contains(e.target)) {
        resultsBox.classList.add("hidden-results");
    }
});
