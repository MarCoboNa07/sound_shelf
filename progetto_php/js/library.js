document.addEventListener("DOMContentLoaded", async () => {
    const openBtn = document.getElementById("create-playlist-btn");
    const modal = document.getElementById("playlist-modal");
    const cancelBtn = document.getElementById("cancel-playlist");
    const saveBtn = document.getElementById("save-playlist");

    await loadPlaylists();
    await loadFollowedArtists();

    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");

        const nameInput = document.getElementById("playlist-name");
        const textarea = document.getElementById("playlist-description");

        nameInput.value = "";
        textarea.value = "";

        nameInput.focus();
    });

    cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    saveBtn.addEventListener("click", async () => {
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
            await loadPlaylists();
        } else {
            errorEl.textContent = "Errore durante la creazione";
        }
    });
});

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

        if (data.success) {
            return true;
        } else {
            alert(data.error || "Errore");
            return false;
        }

    } catch (err) {
        console.error(err);
        return false;
    }
}

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

        data.playlists.forEach(p => addPlaylistToUI(p));

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="empty-state">Errore nel caricamento</p>`;
    }
}

function addPlaylistToUI(playlist) {
    const container = document.getElementById("playlist-list");

    const card = document.createElement("div");
    card.className = "playlist-card";

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

async function loadFollowedArtists() {
    const container = document.getElementById("artist-list");
    if (!container) return;

    try {
        const res = await fetch("/progetto_php/api/get_followed_artists.php");
        const data = await res.json();

        container.innerHTML = "";

        if (!data.artists || data.artists.length === 0) {
            container.innerHTML = `<p class="empty-state">Non segui ancora artisti</p>`;
            return;
        }

        for (const id of data.artists) {
            const artist = await fetchArtistFromAPI(id);
            if (artist) renderArtistCard(artist.artist);
        }

    } catch (err) {
        console.error(err);
    }
}

async function fetchArtistFromAPI(id) {
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

function renderArtistCard(data) {
    const container = document.getElementById("artist-list");

    const artist = data.artist;

    const a = document.createElement("a");
    a.className = "artist-card";
    a.href = `/progetto_php/artist.php?artist_id=${artist.id}`;

    a.innerHTML = `
        <img class="artist-img" src="${artist.picture_xl}" alt="${artist.name}">
        <div class="artist-name">${artist.name}</div>
    `;

    container.appendChild(a);
}
