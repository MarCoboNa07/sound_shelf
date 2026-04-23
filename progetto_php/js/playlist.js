document.addEventListener("DOMContentLoaded", async () => {
    const playlistId = document.body.dataset.playlistId;
    if (!playlistId) return;

    try {
        const res = await fetch(`/progetto_php/api/get_playlist.php?playlist_id=${playlistId}`);
        const data = await res.json();

        renderPlaylist(data);

    } catch (err) {
        console.error(err);
    }
});

function renderPlaylist(data) {
    const { playlist_name, tracks } = data;

    const title = document.querySelector("#playlist-title");
    const meta = document.querySelector("#playlist-meta");
    const container = document.querySelector("#playlist-track-container");
    const cover = document.querySelector("#playlist-cover");

    title.textContent = playlist_name || "Playlist";
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

    const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    meta.textContent = `${tracks.length} brani • ${formatDuration(totalSeconds)}`;

    container.innerHTML = "";

    if (tracks.length > 0) {
        cover.crossOrigin = "Anonymous";

        cover.onload = () => {
            const colorThief = new ColorThief();
            const color = colorThief.getColor(cover);
            applyAlbumGradient(color);
        };

        cover.src = tracks[0].cover;
    }

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </button>
        `;
        container.appendChild(row);

        row.querySelector(".track-hover-play").addEventListener("click", async (e) => {
            e.stopPropagation();

            if (!isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            await startQueue(track);
        });
    });
}

async function startPlaylistQueue(playlistId) {
    try {
        const res = await fetch(`/progetto_php/api/get_playlist.php?playlist_id=${playlistId}`);
        const data = await res.json();

        if (!data.tracks || !data.tracks.length) return;

        queue = data.tracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: parseInt(track.duration)
        }));

        currentIndex = 0;

        showPlayer();
        loadCurrentSong();

    } catch (err) {
        console.error(err);
    }
}

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

const deleteBtn = document.getElementById("delete-playlist-btn");
const modal = document.getElementById("delete-modal");
const cancelBtn = document.getElementById("cancel-delete");
const confirmBtn = document.getElementById("confirm-delete");

if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        if (!isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        modal.classList.remove("hidden");
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}

if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
        const playlistId = document.body.dataset.playlistId;

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

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".more-btn");
    if (!btn) return;

    if (!isLogged) {
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
            row.style.transition = "opacity 0.2s ease";
            row.style.opacity = "0";

            setTimeout(() => {
                row.remove();
            }, 200);

        } else {
            console.error(data.error);
        }

    } catch (err) {
        console.error(err);
    }
});

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".main-play");
    if (!btn) return;

    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const playlistId = document.body.dataset.playlistId;

    await startPlaylistQueue(playlistId);
});
