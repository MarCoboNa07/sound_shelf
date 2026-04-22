document.addEventListener("DOMContentLoaded", () => {
    const artistId = document.body.dataset.artistId;
    if (artistId) {
        fetchArtistData(artistId);
    }
});

async function fetchArtistData(id) {
    try {
        const response = await fetch(`/progetto_php/api/get_artist.php?artist_id=${id}`);
        const data = await response.json();

        // Passa anche topTracks qui!
        renderArtistHeader(data.artist, data.topTracks);
        renderTopTracks(data.topTracks);
        renderDiscography(data.albums);

        initFollowButton(id);
    } catch (error) {
        console.error("Errore nel caricamento artista:", error);
    }
}

function renderArtistHeader(artist, topTracks) {
    document.getElementById("artist-name").textContent = artist.name;
    document.getElementById("artist-stats").textContent = `${Number(artist.nb_fan).toLocaleString()} ascoltatori mensili`;

    const header = document.getElementById("artist-header");
    header.style.backgroundImage = `linear-gradient(transparent, rgba(18, 18, 18, 0.9)), url('${artist.picture_xl}')`;

    const mainPlayBtn = document.getElementById("play-artist-main");
    if (mainPlayBtn) {
        // Usiamo addEventListener invece di onclick per maggiore pulizia
        mainPlayBtn.addEventListener("click", (e) => {
            // FONDAMENTALE: impedisce a navbar.js di sentire questo click
            e.stopPropagation();

            if (topTracks && topTracks.length > 0) {
                playArtistTopTracks(topTracks);
            }
        });
    }
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
                <div 
                    class="track-hover-play play-btn"
                    data-type="song"
                    data-id="${track.id}"
                    data-title="${track.title}"
                    data-artist="${track.artist.name}"
                    data-cover="${track.album.cover_medium}"
                    data-duration="${track.duration}"
                >                
                    <svg class="track-hover-play" viewBox="0 0 16 16" width="16" height="16">
                        <path fill="currentColor" d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                </div>
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
        });

        container.appendChild(card);
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

async function playArtistTopTracks(tracks) {
    if (!isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    // Trasformiamo i dati di Deezer nel tuo formato standard
    const formattedTracks = tracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        cover: track.album.cover_medium,
        duration: track.duration
    }));

    const firstTrack = formattedTracks[0];
    const restOfTracks = formattedTracks.slice(1);

    // 1. Reset DB e aggiungi la prima traccia (endpoint add_to_queue)
    await fetch("/progetto_php/api/add_to_queue.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `song_id=${firstTrack.id}`
    });

    // 2. Aggiungi il resto delle top 10 al DB (endpoint add_related_tracks)
    if (restOfTracks.length > 0) {
        await fetch("/progetto_php/api/add_related_tracks.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "tracks=" + encodeURIComponent(JSON.stringify(restOfTracks))
        });
    }

    // 3. Sincronizza lo stato globale di navbar.js
    queue = formattedTracks;
    currentIndex = 0;

    // 4. Avvia la UI e il Playback (funzioni in navbar.js)
    showPlayer();
    loadCurrentSong();
    startPlayback();
}

async function initFollowButton(artistId) {
    const btn = document.querySelector(".btn-outline");
    if (!btn) return;

    let isFollowing = false;

    // 1. Stato iniziale
    try {
        const res = await fetch(`/progetto_php/api/check_follow.php?artist_id=${artistId}`);
        const data = await res.json();

        isFollowing = data.followed;

        updateButton();
    } catch (err) {
        console.error(err);
    }

    // 2. Click toggle
    btn.addEventListener("click", async () => {
        if (!isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        try {
            const url = isFollowing
                ? "/progetto_php/api/unfollow_artist.php"
                : "/progetto_php/api/follow_artist.php";

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `artist_id=${artistId}`
            });

            const data = await res.json();

            if (data.success || data.message) {
                isFollowing = !isFollowing;
                updateButton();
            }

        } catch (err) {
            console.error(err);
        }
    });

    function updateButton() {
        if (isFollowing) {
            btn.textContent = "Non seguire";
            btn.classList.add("active");
        } else {
            btn.textContent = "Segui";
            btn.classList.remove("active");
        }
    }
}
