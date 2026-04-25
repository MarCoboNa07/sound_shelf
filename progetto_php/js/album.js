// js/album.js
// file js per gestione pagina album

// carica i dati nel body della pagina
document.addEventListener("DOMContentLoaded", async () => {
    const albumId = document.body.dataset.albumId;
    if (!albumId) return;

    await loadAlbum(albumId);
});

// ottieni i dati dell'album dal db
async function loadAlbum(albumId) {
    try {
        const res = await fetch(`/progetto_php/api/get_album_tracks.php?album_id=${albumId}`);
        const data = await res.json();

        if (!data?.tracks?.length) return;

        renderAlbum(data);
        setupAlbumEvents(data);
    } catch (err) {
        console.error("Errore load album:", err);
    }
}

// renderizza l'album
function renderAlbum(data) {
    const { album_title, album_year, album_cover, tracks } = data;

    const tracksContainer = document.querySelector("#tracks-container");
    const albumTitle = document.querySelector("#album-title");
    const albumCover = document.querySelector("#album-cover");
    const albumMeta = document.querySelector("#album-meta");

    if (!tracksContainer) return;

    // header
    albumTitle.textContent = album_title || "Album";
    albumCover.src = album_cover;
    albumCover.crossOrigin = "Anonymous";

    albumCover.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(albumCover);
        window.applyAlbumGradient(color);
    };

    const artistName = tracks[0]?.artist || "Artista sconosciuto";
    const artistId = tracks[0]?.artist_id || "#";
    const year = album_year || "—";

    const totalSeconds = tracks.reduce((sum, t) => sum + (parseInt(t.duration) || 0), 0);

    albumMeta.innerHTML = `
        <a href="/progetto_php/artist.php?artist_id=${artistId}" class="artist-link">
            ${artistName}
        </a>
        • ${year}
        • ${tracks.length} brani • ${window.formatDuration(totalSeconds)}
    `;

    // tracklist
    tracksContainer.innerHTML = "";
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
                        <a href="/progetto_php/artist.php?artist_id=${artistId}" class="artist-link">${track.artist}</a>
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
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
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

            const song = {
                id: track.id,
                title: track.title,
                artist: track.artist,
                cover: track.cover,
                duration: parseInt(track.duration)
            };
            await window.startQueue?.(song);
        });

        tracksContainer.appendChild(row);
    });
}

// inizializza gli eventi dell'album
function setupAlbumEvents(data) {
    const playBtn = document.querySelector(".main-play");

    if (playBtn) {
        playBtn.addEventListener("click", async () => {
            if (!window.isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            await window.startAlbumQueue?.(playBtn.dataset.id);
        });
    }
}

// play principale dell'album
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-playlist-btn");
    if (!btn) return;

    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    window.openPlaylistModal?.(btn.dataset.id);
});

// aggiungi l'album alla libreria
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-to-playlist-main");
    if (!btn) return;

    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const albumId = document.body.dataset.albumId;
    if (!albumId) return;

    try {
        btn.disabled = true;

        const res = await fetch("/progetto_php/api/create_playlist_from_album.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `album_id=${albumId}`
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Errore creazione playlist");
        }

        btn.style.transform = "scale(1.1)";
        setTimeout(() => (btn.style.transform = ""), 150);
    } catch (err) {
        console.error(err);
    } finally {
        btn.disabled = false;
    }
});

const albumTitle = document.getElementById("album-title");

// observer per ridimensionare il titolo in base al container
if (albumTitle) {
    const observer = new ResizeObserver(() => {
        if (window.innerWidth > 768) {
            window.fitTitleToContainer?.(albumTitle, 140, 24);
        }
    });

    observer.observe(albumTitle.parentElement);
}