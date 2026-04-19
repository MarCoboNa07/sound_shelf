document.addEventListener("DOMContentLoaded", () => {
    const artistId = document.body.dataset.artistId;
    if (artistId) {
        fetchArtistData(artistId);
    }
});

async function fetchArtistData(id) {
    try {
        // Chiamata al tuo backend che contatta Deezer
        const response = await fetch(`/progetto_php/api/get_artist.php?artist_id=${id}`);
        const data = await response.json();

        renderArtistHeader(data.artist);
        renderTopTracks(data.topTracks);
        renderDiscography(data.albums);
    } catch (error) {
        console.error("Errore nel caricamento artista:", error);
    }
}

function renderArtistHeader(artist) {
    document.getElementById("artist-name").textContent = artist.name;
    document.getElementById("artist-stats").textContent = `${Number(artist.nb_fan).toLocaleString()} ascoltatori mensili`;

    // Imposta la foto come sfondo dell'header
    const header = document.getElementById("artist-header");
    header.style.backgroundImage = `linear-gradient(transparent, rgba(18, 18, 18, 0.9)), url('${artist.picture_xl}')`;
}

function renderTopTracks(tracks) {
    const container = document.getElementById("top-tracks-container");

    // stessa classe della tracklist album
    container.className = "tracklist";
    container.innerHTML = "";

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

            <img src="${track.album.cover_small}" class="track-img" alt="">

            <div class="track-main-info">
                <div class="track-title-wrapper">
                    <a class="track-title" href="/progetto_php/track.php?track_id=${track.id}">
                        ${track.title}
                    </a>
                    <div class="track-artist">
                        ${track.explicit ? `<span class="explicit-label">E</span>` : ""}
                        <a class="artist-link" href="/progetto_php/artist.php?artist_id=${track.artist.id}">
                            ${track.artist.name}
                        </a>
                    </div>
                </div>
            </div>

            <span class="track-rank">${Number(track.rank).toLocaleString()}</span>

            <button class="track-action-btn add-playlist-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
            </button>

            <span class="track-duration">${formatTime(track.duration)}</span>

            <button class="track-action-btn more-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                </svg>
            </button>
        `;

        container.appendChild(trackRow);
    });
}

function renderDiscography(albums) {
    const container = document.getElementById("artist-albums-container");
    container.innerHTML = "";

    albums.forEach(item => {
        const isSingle = item.record_type === "single";

        const link = isSingle
            ? `/progetto_php/track.php?track_id=${item.track_id}`
            : `/progetto_php/album.php?album_id=${item.id}`;

        const card = document.createElement("a");
        card.classList.add("trending-card");
        card.href = link;

        const playButton = `
            <div class="trending-play play-btn"
                data-type="${isSingle ? "song" : "album"}"
                data-id="${isSingle ? item.track_id : item.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </div>
        `;

        card.innerHTML = `
            <div class="trending-cover-wrapper">
                <img src="${item.cover_xl}" alt="${item.title}">
                ${playButton}
            </div>
            <div class="trending-info">
                <a href="${link}" class="trending-title">${item.title}</a>
                <span class="trending-artist">
                    ${new Date(item.release_date).getFullYear()} • ${isSingle ? "Singolo" : "Album"}
                </span>
            </div>
        `;

        // blocca click su play
        const playBtn = card.querySelector(".play-btn");
        playBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        container.appendChild(card);
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
