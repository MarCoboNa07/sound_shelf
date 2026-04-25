// js/library.js
// file js per gestione pagina libreria (playlist + artisti seguiti + creazione playlist)

// carica i dati nel body della pagina
document.addEventListener("DOMContentLoaded", async () => {
    initPlaylistModal();

    await loadPlaylists();
    await loadFollowedArtists();
});

// inizializza il modal per creare la playlist
function initPlaylistModal() {
    const openBtn = document.getElementById("create-playlist-btn");
    const modal = document.getElementById("playlist-modal");
    const cancelBtn = document.getElementById("cancel-playlist");
    const saveBtn = document.getElementById("save-playlist");

    if (!openBtn || !modal) return;

    // apertura modal
    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");

        const nameInput = document.getElementById("playlist-name");
        const descInput = document.getElementById("playlist-description");

        // reset campi
        nameInput.value = "";
        descInput.value = "";

        nameInput.focus();
    });

    // chiusura modal
    cancelBtn?.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // creazione playlist
    saveBtn?.addEventListener("click", async () => {
        const nameInput = document.getElementById("playlist-name");
        const errorEl = document.getElementById("playlist-error");

        const name = nameInput.value.trim();
        const desc = document.getElementById("playlist-description").value.trim();

        // reset errori
        errorEl.textContent = "";
        nameInput.classList.remove("input-error");

        // validazione
        if (!name) {
            errorEl.textContent = "Inserisci un nome per la playlist";
            nameInput.classList.add("input-error");
            return;
        }

        const success = await createPlaylist(name, desc);

        if (success) {
            modal.classList.add("hidden");
            await loadPlaylists(); // refresh lista
        } else {
            errorEl.textContent = "Errore durante la creazione";
        }
    });
}

// crea playlist
async function createPlaylist(name, description) {
    try {
        const res = await fetch("/progetto_php/api/create_playlist.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
        });

        const data = await res.json();
        if (data.success) return true;

        alert(data.error || "Errore");
        return false;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// carica la playlist
async function loadPlaylists() {
    const container = document.getElementById("playlist-list");
    if (!container) return;

    try {
        const res = await fetch("/progetto_php/api/get_playlists.php");
        const data = await res.json();

        container.innerHTML = "";

        // utente non loggato
        if (data.error) {
            container.innerHTML = `<p class="empty-state">Effettua il login per vedere le playlist</p>`;
            return;
        }

        // nessuna playlist
        if (!data.playlists || data.playlists.length === 0) {
            container.innerHTML = `<p class="empty-state">Non hai ancora playlist</p>`;
            return;
        }

        data.playlists.forEach(renderPlaylistCard);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="empty-state">Errore nel caricamento</p>`;
    }
}


// renderizza playlist
function renderPlaylistCard(playlist) {
    const container = document.getElementById("playlist-list");

    const card = document.createElement("a");
    card.className = "playlist-card";
    card.href = `/progetto_php/playlist.php?playlist_id=${playlist.id}`;

    card.innerHTML = `
        <div class="playlist-cover">
            <img src="/progetto_php/src/playlist_icon.png" alt="cover playlist">
        </div>

        <div class="playlist-info">
            <span class="playlist-name">${playlist.name}</span>
            <span class="playlist-meta">Playlist • Tu</span>
        </div>
    `;

    container.appendChild(card);
}

// carica gli artisti seguit
async function loadFollowedArtists() {
    const container = document.getElementById("artist-list");
    if (!container) return;

    try {
        const res = await fetch("/progetto_php/api/get_followed_artists.php");
        const data = await res.json();

        container.innerHTML = "";

        // nessun artista seguito
        if (!data.artists || data.artists.length === 0) {
            container.innerHTML = `<p class="empty-state">Non segui ancora artisti</p>`;
            return;
        }

        for (const id of data.artists) {
            const artistData = await fetchArtist(id);
            if (artistData) renderArtistCard(artistData.artist);
        }

    } catch (err) {
        console.error(err);
    }
}


// ottieni i dati dell'artista
async function fetchArtist(id) {
    try {
        const res = await fetch(`/progetto_php/api/get_artist.php?artist_id=${id}`);
        const data = await res.json();

        if (data.error) return null;

        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// renderizza la card dell'artista
function renderArtistCard(artist) {
    const container = document.getElementById("artist-list");

    const card = document.createElement("a");
    card.className = "artist-card";
    card.href = `/progetto_php/artist.php?artist_id=${artist.id}`;

    card.innerHTML = `
        <img class="artist-img" src="${artist.picture_xl}" alt="${artist.name}">
        <div class="artist-name">${artist.name}</div>
    `;

    container.appendChild(card);
}