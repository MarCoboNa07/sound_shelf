// js/artist.jsS
// file js per gestione pagina artista

// carica i dati nel body della pagina
document.addEventListener("DOMContentLoaded", () => {
    const artistId = document.body.dataset.artistId;
    if (!artistId) return;

    loadArtist(artistId);
});

// ottieni i dati dell'artista dal db
async function loadArtist(artistId) {
    try {
        const res = await fetch(`/progetto_php/api/get_artist.php?artist_id=${artistId}`);
        const data = await res.json();

        if (!data?.artist) return;

        renderArtistHeader(data.artist, data.topTracks);
        renderTopTracks(data.topTracks);
        renderDiscography(data.albums);
        initFollowButton(artistId);
    } catch (err) {
        console.error("Errore load artist:", err);
    }
}

// renderizza l'artista
function renderArtistHeader(artist, topTracks) {
    const nameEl = document.getElementById("artist-name");
    const statsEl = document.getElementById("artist-stats");
    const header = document.getElementById("artist-header");

    if (!nameEl || !statsEl || !header) return;

    // nome e stats
    nameEl.textContent = artist.name;
    statsEl.textContent = `${Number(artist.nb_fan).toLocaleString()} ascoltatori mensili`;

    // immagine header e overlay
    header.style.backgroundImage = `
        linear-gradient(transparent, rgba(18,18,18,0.9)),
        url('${artist.picture_xl}')
    `;

    // colore gradient dinamico
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = artist.picture_xl;

    img.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(img);

        window.applyAlbumGradient?.(color);
    };

    // play principale
    const playBtn = document.getElementById("play-artist-main");

    if (playBtn) {
        playBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (!window.isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            if (topTracks?.length > 0) {
                playArtistTopTracks(topTracks);
            }
        });
    }
}

// renderizza la top 10 brani
function renderTopTracks(tracks = []) {
    const container = document.getElementById("top-tracks-container");
    if (!container) return;

    container.className = "tracklist";
    container.innerHTML = "";

    // cicla i brani
    tracks.forEach((track, index) => {
        const row = document.createElement("div");
        row.className = "track-row";

        row.innerHTML = `
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

            <span class="track-rank">${window.formatPlays(track.rank)}</span>

            <button class="track-action-btn add-playlist-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
            </button>

            <span class="track-duration">
                ${window.formatDuration(track.duration)}
            </span>

            <button class="track-action-btn more-btn" data-id="${track.id}">
                <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                </svg>
            </button>
        `;

        // play del brano
        row.addEventListener("click", async (e) => {
            if (e.target.closest(".track-action-btn, .play-btn")) return;

            if (!window.isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            await window.startQueue?.({
                id: track.id,
                title: track.title,
                artist: track.artist.name,
                cover: track.album.cover_medium,
                duration: track.duration
            });
        });

        container.appendChild(row);
    });
}

// renderizza la discografia
function renderDiscography(albums = []) {
    const container = document.getElementById("artist-albums-container");
    if (!container) return;

    container.innerHTML = "";

    // cicla gli album
    albums.forEach(item => {
        // verifica se si tratta di un album o di un singolo
        const isSingle = item.record_type === "single";

        const link = isSingle
            ? `/progetto_php/track.php?track_id=${item.track_id}`
            : `/progetto_php/album.php?album_id=${item.id}`;

        const card = document.createElement("a");
        card.className = "trending-card";
        card.href = link;

        card.innerHTML = `
            <div class="trending-cover-wrapper">
                <img src="${item.cover_xl}" alt="${item.title}">
                <div class="trending-play play-btn"
                    data-type="${isSingle ? "song" : "album"}"
                    data-id="${isSingle ? item.track_id : item.id}">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                </div>
            </div>

            <div class="trending-info">
                <a href="${link}" class="trending-title">${item.title}</a>
                <span class="trending-artist">
                    ${new Date(item.release_date).getFullYear()} • ${isSingle ? "Singolo" : "Album"}
                </span>
            </div>
        `;

        // evita click su play che apra il link
        card.querySelector(".play-btn")?.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!window.isLogged) {
                window.location.href = "/progetto_php/login.php";
                return;
            }

            try {
                // singolo
                if (isSingle) {
                    const res = await fetch(`/progetto_php/api/get_track.php?track_id=${item.track_id}`);
                    const track = await res.json();

                    await window.startQueue?.({
                        id: track.id,
                        title: track.title,
                        artist: track.artist,
                        cover: track.cover,
                        duration: track.duration
                    });
                    return;
                }

                // album
                await window.startAlbumQueue?.(item.id);
            } catch (err) {
                console.error("Errore play discografia:", err);
            }
        });

        container.appendChild(card);
    });
}

// play per la top 10 brani
async function playArtistTopTracks(tracks) {
    if (!window.isLogged) {
        window.location.href = "/progetto_php/login.php";
        return;
    }

    const formatted = tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist.name,
        cover: t.album.cover_medium,
        duration: t.duration
    }));

    const first = formatted[0];
    const rest = formatted.slice(1);

    // reset coda + prima traccia
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
}

// inzializza il button segui
async function initFollowButton(artistId) {
    const btn = document.querySelector(".btn-outline");
    if (!btn) return;

    let isFollowing = false;

    try {
        // verifica se l'utente segue l'artista
        const res = await fetch(`/progetto_php/api/check_follow.php?artist_id=${artistId}`);
        const data = await res.json();

        isFollowing = data.followed;
        updateBtn();
    } catch (err) {
        console.error(err);
    }

    // toggle follow
    btn.addEventListener("click", async () => {
        if (!window.isLogged) {
            window.location.href = "/progetto_php/login.php";
            return;
        }

        const url = isFollowing
            ? "/progetto_php/api/unfollow_artist.php" // url api unfollow
            : "/progetto_php/api/follow_artist.php";  // url api follow

        try {
            // richiesta all'api opportuna
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
                updateBtn();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // aggiorna il button
    function updateBtn() {
        if (isFollowing) {
            btn.textContent = "Non seguire";
            btn.classList.add("active");
        } else {
            btn.textContent = "Segui";
            btn.classList.remove("active");
        }
    }
}