// js/track.js
// file js per gestione pagina singolo

// carica i dati nel body della pagina
document.addEventListener("DOMContentLoaded", async () => {
    const trackId = document.body.dataset.trackId;
    if (!trackId) return;

    await loadTrack(trackId);
});

// ottieni i dati del brano dal db
async function loadTrack(trackId) {
    try {
        const res = await fetch(`/progetto_php/api/get_track.php?track_id=${trackId}`);
        const track = await res.json();

        if (!track?.id) return;

        renderTrack(track);
    } catch (err) {
        console.error("Errore load track:", err);
    }
}

// renderizza il brano
function renderTrack(track) {
    const container = document.querySelector("#single-track-container");
    const title = document.querySelector("#track-title");
    const cover = document.querySelector("#track-cover");
    const meta = document.querySelector("#track-meta");

    if (!container || !title || !cover || !meta) return;

    // header
    title.textContent = track.title;
    cover.src = track.cover;
    cover.crossOrigin = "Anonymous";

    cover.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(cover);

        window.applyAlbumGradient?.(color);
    };

    const year = track.release_date?.split("-")[0] || "—";

    meta.innerHTML = `
        <a href="/progetto_php/artist.php?artist_id=${track.artist_id}" class="artist-link">
            ${track.artist}
        </a>
        • ${year}
        • 1 brano • ${window.formatDuration(track.duration)}
    `;

    // track row
    container.innerHTML = "";
    const row = document.createElement("div");
    row.className = "track-row";

    row.innerHTML = `
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
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
            </svg>
        </button>
    `;

    container.appendChild(row);

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

    // play principale del singolo
    document.querySelector(".main-play")?.addEventListener("click", async () => {
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
}

// gestione apertura modal playlist
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-playlist-btn, .add-to-playlist-main");
    if (!btn) return;

    e.stopPropagation();

    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const trackId = document.body.dataset.trackId;
    window.openPlaylistModal?.(trackId);
});

// chiusura modal cliccando fuori
document.addEventListener("click", (e) => {
    const modal = document.getElementById("playlist-select-modal");
    if (!modal || modal.classList.contains("hidden")) return;

    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

const trackTitle = document.getElementById("track-title");

// observer per ridimensionare il titolo in base al container
if (trackTitle) {
    const observer = new ResizeObserver(() => {
        if (window.innerWidth > 768) {
            window.fitTitleToContainer?.(trackTitle, 140, 24);
        }
    });

    observer.observe(trackTitle.parentElement);
}