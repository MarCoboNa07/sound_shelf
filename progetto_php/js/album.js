document.addEventListener("DOMContentLoaded", async () => {
    const albumId = document.body.dataset.albumId;
    if (!albumId) return;

    try {
        const response = await fetch(`/progetto_php/api/get_album_tracks.php?album_id=${albumId}`);
        const data = await response.json();

        if (data.tracks && data.tracks.length > 0) {
            renderAlbumPage(data);
        }
    } catch (error) {
        console.error("Errore nel caricamento album:", error);
    }
});

function renderAlbumPage(data) {
    const { album_title, album_year, album_cover, tracks } = data;

    const tracksContainer = document.querySelector("#tracks-container");
    const albumTitle = document.querySelector("#album-title");
    const albumCover = document.querySelector("#album-cover");
    const albumMeta = document.querySelector("#album-meta");

    albumCover.crossOrigin = "Anonymous";
    albumCover.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(albumCover);

        applyAlbumGradient(color);
    };

    if (!tracks || tracks.length === 0) return;

    albumTitle.textContent = album_title || "Album";
    albumCover.src = album_cover;
    const artistName = tracks[0].artist || "Artista sconosciuto";
    const artistId = tracks[0].artist_id || "#";
    const year = album_year || "—";
    const trackCount = tracks.length;

    setTimeout(() => {
        if (window.innerWidth > 768) {
            fitTitleToContainer(albumTitle, 148, 24);
        } else {
            albumTitle.style.fontSize = "28px";
        }
    }, 0);

    const totalSeconds = tracks.reduce((sum, track) => {
        return sum + (parseInt(track.duration) || 0);
    }, 0);
    const totalDuration = formatDuration(totalSeconds);

    albumMeta.innerHTML = `<a href="/progetto_php/artist.php?artist_id=${artistId}" class="artist-link">${artistName}</a> • ${year} • ${trackCount} brani, ${totalDuration}`;
    tracksContainer.innerHTML = "";

    tracks.forEach((track, index) => {
        const trackRow = document.createElement("div");
        trackRow.className = "track-row";

        trackRow.innerHTML = `
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

        tracksContainer.appendChild(trackRow);

        trackRow.addEventListener("click", async (e) => {
            if (e.target.closest(".track-action-btn")) return;

            if (!isLogged) {
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

            await startQueue(song);
        });
    });

    document.querySelector(".main-play").addEventListener("click", async (e) => {
        const albumId = e.currentTarget.dataset.id;

        if (!albumId) return;
        await startAlbumQueue(albumId);
    });
}

function applyAlbumGradient([r, g, b]) {
    // calcolo luminanza (per capire se è chiaro)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let safeR = r;
    let safeG = g;
    let safeB = b;

    // se troppo chiaro → scurisci
    if (luminance > 0.6) {
        safeR *= 0.5;
        safeG *= 0.5;
        safeB *= 0.5;
    }

    // clamp valori
    safeR = Math.floor(Math.min(255, safeR));
    safeG = Math.floor(Math.min(255, safeG));
    safeB = Math.floor(Math.min(255, safeB));

    const darker = `rgb(${Math.floor(safeR * 0.5)}, ${Math.floor(safeG * 0.5)}, ${Math.floor(safeB * 0.5)})`;

    const container = document.querySelector(".main-content");

    container.style.background = `
        linear-gradient(
            to bottom,
            rgb(${safeR}, ${safeG}, ${safeB}) 0%,
            ${darker} 40%,
            #121212 100%
        )
    `;
}

function formatPlays(num) {
    if (!num) return "—";

    return num.toLocaleString("it-IT");
}
