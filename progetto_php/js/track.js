document.addEventListener("DOMContentLoaded", async () => {
    const trackId = document.body.dataset.trackId;
    if (!trackId) return;

    try {
        const response = await fetch(`/progetto_php/api/get_track.php?track_id=${trackId}`);
        const track = await response.json();

        if (track.id) {
            renderTrackPage(track);
        }
    } catch (error) {
        console.error("Errore nel caricamento brano:", error);
    }
});

function renderTrackPage(track) {
    const container = document.querySelector("#single-track-container");
    const title = document.querySelector("#track-title");
    const cover = document.querySelector("#track-cover");
    const meta = document.querySelector("#track-meta");

    // 1. Setup Header
    cover.crossOrigin = "Anonymous";
    cover.src = track.cover;
    cover.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(cover);
        applyAlbumGradient(color); // Usiamo la funzione già esistente in script.js
    };

    title.textContent = track.title;
    setTimeout(() => {
        const isMobile = window.innerWidth <= 768;

        if (!isMobile) {
            fitTitleToContainer(title, 148, 24);
        } else {
            title.style.fontSize = "28px";
            title.style.whiteSpace = "normal";
            title.style.letterSpacing = "0";
        }
    }, 0);

    const year = track.release_date.split("-")[0];
    meta.innerHTML = `<a href="/progetto_php/artist.php?artist_id=${track.artist_id}" class="artist-link">${track.artist}</a> • ${year} • 1 brano, ${formatDuration(track.duration)}`;

    // 2. Render riga singola (Stesso stile dell'album)
    container.innerHTML = "";
    const trackRow = document.createElement("div");
    trackRow.className = "track-row";

    trackRow.innerHTML = `
        <div class="track-number">
            <span class="track-index">1</span>
            <svg class="track-hover-play" viewBox="0 0 16 16" width="16" height="16">
                <path fill="currentColor" d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
        </div>

        <div class="track-main-info">
            <div class="track-title-wrapper">
                <span class="track-title">${track.title}</span>
                <span class="track-artist">
                    ${track.explicit ? `<span class="explicit-label">E</span>` : ""}
                    <a href="/progetto_php/artist.php?artist_id=${track.artist_id}" class="artist-link">${track.artist}</a>
                </span>
            </div>
        </div>

        <span class="track-rank">${formatPlays(track.rank)}</span>

        <button class="track-action-btn add-playlist-btn" data-id="${track.id}">
            <svg viewBox="0 0 16 16" width="16" height="16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
        </button>

        <span class="track-duration">${formatDuration(track.duration)}</span>

        <button class="track-action-btn more-btn" data-id="${track.id}">
            <svg viewBox="0 0 16 16" width="16" height="16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
            </svg>
        </button>
    `;
    container.appendChild(trackRow);

    trackRow.addEventListener("click", async (e) => {
        // evita click sui bottoni interni
        if (e.target.closest(".track-action-btn")) return;

        if (!isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        await startQueue({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: track.duration
        });
    });

    document.querySelector(".main-play").addEventListener("click", async () => {
        if (!isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        await startQueue({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: track.duration
        });
    });
}

async function openPlaylistModal(songId) {
    const modal = document.getElementById("playlist-select-modal");
    const container = document.getElementById("playlist-select-list");

    modal.classList.remove("hidden");
    container.innerHTML = "Caricamento...";

    try {
        const res = await fetch(`/progetto_php/api/get_user_playlists_with_track.php?song_id=${songId}`);
        const data = await res.json();

        container.innerHTML = "";

        data.playlists.forEach(p => {
            const item = document.createElement("div");
            item.className = "playlist-select-item";
            item.textContent = p.name;

            if (p.contains == 1) {
                item.classList.add("disabled");
            } else {
                item.addEventListener("click", async () => {
                    await addToPlaylist(songId, p.id);
                    modal.classList.add("hidden");
                });
            }

            container.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "Errore";
    }
}

async function addToPlaylist(songId, playlistId) {
    const res = await fetch("/progetto_php/api/add_to_playlist.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `song_id=${songId}&playlist_id=${playlistId}`
    });

    const data = await res.json();

    if (!data.success) {
        alert(data.error);
    }
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-playlist-btn, .add-to-playlist-main");
    if (!btn) return;
    e.stopPropagation();

    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const trackId = document.body.dataset.trackId;
    openPlaylistModal(trackId);
});

document.addEventListener("click", (e) => {
    const modal = document.getElementById("playlist-select-modal");
    if (!modal || modal.classList.contains("hidden")) return;

    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-playlist-btn");
    if (!btn) return;

    e.stopPropagation();

    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const songId = btn.dataset.id;
    openPlaylistModal(songId);
});
