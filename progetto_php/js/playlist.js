// js/playlist.js
// file js per gestione pagina playlist

// carica i dati nel body della pagina
document.addEventListener("DOMContentLoaded", () => {
    const playlistId = document.body.dataset.playlistId;
    if (!playlistId) return;

    loadPlaylist(playlistId);
});

// ottieni i dati della playlist dal db
async function loadPlaylist(playlistId) {
    try {
        const res = await fetch(`/progetto_php/api/get_playlist.php?playlist_id=${playlistId}`);
        const data = await res.json();

        if (!data) return;

        renderPlaylist(data);
        initDeleteModal(playlistId);
        initMainPlay(playlistId);

    } catch (err) {
        console.error("Errore load playlist:", err);
    }
}

// renderizza la playlist
function renderPlaylist(data) {
    const { playlist_name, tracks = [] } = data;

    const title = document.querySelector("#playlist-title");
    const meta = document.querySelector("#playlist-meta");
    const container = document.querySelector("#playlist-track-container");
    const cover = document.querySelector("#playlist-cover");

    if (!title || !meta || !container || !cover) return;

    title.textContent = playlist_name || "Playlist";
    const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    meta.textContent = `${tracks.length} brani • ${window.formatDuration(totalSeconds)}`;

    // cover + gradient dinamico
    if (tracks.length > 0) {
        cover.crossOrigin = "Anonymous";
        cover.src = tracks[0].cover;

        cover.onload = () => {
            const colorThief = new ColorThief();
            const color = colorThief.getColor(cover);

            window.applyAlbumGradient?.(color);
        };
    }

    // tracklist
    container.innerHTML = "";
    tracks.forEach((track, index) => {
        const row = document.createElement("div");
        row.className = "track-row";

        row.innerHTML = `
            <div class="track-number">
                <span class="track-index">${index + 1}</span>
                <svg class="track-hover-play" viewBox="0 0 16 16" width="16" height="16">
                    <path fill="currentColor" d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </div>

            <div class="track-main-info">
                <div class="track-title-wrapper">
                    <span class="track-title">${track.title}</span>
                    <span class="track-artist">
                        ${track.explicit ? `<span class="explicit-label">E</span>` : ""}
                        <a href="/progetto_php/artist.php?artist_id=${track.artist_id}" class="artist-link">
                            ${track.artist}
                        </a>
                    </span>
                </div>
            </div>

            <span class="track-rank">${window.formatPlays(track.rank)}</span>

            <button class="track-action-btn add-playlist-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
            </button>

            <span class="track-duration">${window.formatDuration(track.duration)}</span>

            <button class="track-action-btn more-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </button>
        `;

        // play del brano
        row.addEventListener("click", async (e) => {
            if (e.target.closest(".track-action-btn")) return;

            if (!window.isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            await window.startQueue?.({
                id: track.id,
                title: track.title,
                artist: track.artist,
                cover: track.cover,
                duration: track.duration
            });
        });

        container.appendChild(row);
    });
}

// play della playlist
async function startPlaylistQueue(playlistId) {
    try {
        const res = await fetch(`/progetto_php/api/get_playlist.php?playlist_id=${playlistId}`);
        const data = await res.json();

        if (!data.tracks?.length) return;

        const formatted = data.tracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: parseInt(track.duration)
        }));

        const first = formatted[0];
        const rest = formatted.slice(1);

        // reset + prima traccia
        await fetch("/progetto_php/api/add_to_queue.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `song_id=${first.id}`
        });

        // aggiungi il resto della coda
        if (rest.length > 0) {
            await fetch("/progetto_php/api/add_related_tracks.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "tracks=" + encodeURIComponent(JSON.stringify(rest))
            });
        }

        // sincronizza la coda lato client
        queue = formatted;
        currentIndex = 0;

        showPlayer();
        loadCurrentSong();
        startPlayback();
    } catch (err) {
        console.error(err);
    }
}

// inizializza bottone play principale
function initMainPlay(playlistId) {
    document.querySelector(".main-play")?.addEventListener("click", async () => {
        if (!window.isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        await startPlaylistQueue(playlistId);
    });
}

// inizializza modal eliminazione
function initDeleteModal(playlistId) {
    const deleteBtn = document.getElementById("delete-playlist-btn");
    const modal = document.getElementById("delete-modal");
    const cancelBtn = document.getElementById("cancel-delete");
    const confirmBtn = document.getElementById("confirm-delete");

    if (!deleteBtn || !modal) return;

    deleteBtn.addEventListener("click", () => {
        if (!window.isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        modal.classList.remove("hidden");
    });

    cancelBtn?.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // click fuori dal modal per chiudere
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    confirmBtn?.addEventListener("click", async () => {
        const success = await deletePlaylist(playlistId);

        if (success) {
            document.body.style.opacity = "0";
            document.body.style.transition = "opacity 0.2s ease";

            setTimeout(() => {
                window.location.href = "/progetto_php/library.php";
            }, 200);
        }
    });
}

// elimina playlist
async function deletePlaylist(playlistId) {
    try {
        const res = await fetch("/progetto_php/api/delete_playlist.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `playlist_id=${playlistId}`
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Errore eliminazione");
        }

        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}

// rimozione brano dalla playlist
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".more-btn");
    if (!btn) return;

    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const trackId = btn.dataset.id;
    const playlistId = document.body.dataset.playlistId;
    const row = btn.closest(".track-row");

    try {
        const res = await fetch("/progetto_php/api/remove_from_playlist.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `playlist_id=${playlistId}&song_id=${trackId}`
        });

        const data = await res.json();

        if (data.success) {
            row.style.opacity = "0";
            setTimeout(() => row.remove(), 200);
        }

    } catch (err) {
        console.error(err);
    }
});

const playlistTitle = document.getElementById("playlist-title");

// observer per ridimensionare il titolo in base al container
if (playlistTitle) {
    const observer = new ResizeObserver(() => {
        if (window.innerWidth > 768) {
            window.fitTitleToContainer?.(playlistTitle, 140, 24);
        }
    });

    observer.observe(playlistTitle.parentElement);
}