// js/player.js
// file js per la gestione del player

// gestione stati
let queue = [];
let currentIndex = -1;
let isPlaying = false;
let interval = null;
let currentTime = 0;
let totalDuration = 0;

// elementi html del player
const player = document.querySelector(".player");
const playBtn = document.querySelector(".play-icon");
const pauseBtn = document.querySelector(".pause-icon");
const nextBtn = document.querySelector(".next-icon");
const prevBtn = document.querySelector(".prev-icon");

// inizializza gli eventi del player
function initPlayer() {
    playBtn.addEventListener("click", togglePlayPause);
    pauseBtn.addEventListener("click", togglePlayPause);
    nextBtn.addEventListener("click", nextSong);
    prevBtn.addEventListener("click", prevSong);
}

// mostra il player
function showPlayer() {
    player.classList.add("active-player");
    document.body.classList.add("player-open");
}

// nascondi il player
function hidePlayer() {
    player.classList.remove("active-player");
    document.body.classList.remove("player-open");
}

// carica il brano in riporduzione
function loadCurrentSong() {
    const song = queue[currentIndex];
    if (!song) return;

    const cover = document.querySelector(".song img");
    const title = document.querySelector(".song-title");
    const artist = document.querySelector(".song-artist");

    if (cover) cover.src = song.cover || "";
    if (title) title.textContent = song.title || "";
    if (artist) artist.textContent = song.artist || "";

    totalDuration = song.duration || 0;
    currentTime = 0;

    updateProgressUI();
}

// playback del brano
function startPlayback() {
    stopPlayback();

    if (!queue[currentIndex]) return;

    isPlaying = true;
    togglePlayUI(true);

    // verifica ogni secondo se il brano è terminato
    interval = setInterval(() => {
        if (currentTime < totalDuration) {
            currentTime++;
            updateProgressUI();
        } else {
            nextSong();
        }
    }, 1000);
}

// termina il playback
function stopPlayback() {
    clearInterval(interval);
    interval = null;
}

// play del brano
function togglePlayPause() {
    if (!queue.length) return;

    if (isPlaying) {
        pauseSong();
    } else {
        resumeSong();
    }
}

// pausa del brano
function pauseSong() {
    isPlaying = false;
    stopPlayback();
    togglePlayUI(false);
}

// riprendi la riproduzione dal punto di interruzione
function resumeSong() {
    if (currentIndex < 0) return;

    isPlaying = true;
    togglePlayUI(true);
    startPlayback();
}

// cambia il button da play a pausa e viceversa
function togglePlayUI(state) {
    playBtn.style.display = state ? "none" : "block";
    pauseBtn.style.display = state ? "block" : "none";
}

// skip al brano successivo
async function nextSong() {
    if (currentIndex < queue.length - 1) {
        currentIndex++;

        await syncQueuePosition(currentIndex);

        loadCurrentSong();
        startPlayback();
    } else {
        pauseSong();
        hidePlayer();
    }
}

// torna al brano precedente
async function prevSong() {
    if (currentIndex > 0) {
        currentIndex--;

        await syncQueuePosition(currentIndex);

        loadCurrentSong();
        startPlayback();
    } else {
        currentTime = 0;
        updateProgressUI();
    }
}

// sincronizza la coda del client con la coda nel db
async function syncQueuePosition(position) {
    try {
        await fetch("/progetto_php/api/update_queue_position.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `position=${position}`
        });
    } catch (err) {
        console.error("Errore sync queue position:", err);
    }
}

// avvia la coda di riproduzione dei brani
async function startQueue(song) {
    try {
        await fetch("/progetto_php/api/add_to_queue.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `song_id=${song.id}`
        });

        queue = [song];
        currentIndex = 0;

        showPlayer();
        loadCurrentSong();
        startPlayback();
        prefetchRelatedTracks(song.id);
    } catch (err) {
        console.error("Errore startQueue:", err);
    }
}

// avvia la coda di riproduzione degli album
async function startAlbumQueue(albumId) {
    try {
        const res = await fetch(`/progetto_php/api/get_album_tracks.php?album_id=${albumId}`);
        const data = await res.json();

        if (!data.tracks?.length) return;

        await fetch("/progetto_php/api/add_to_queue.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `song_id=${data.tracks[0].id}`
        });

        queue = data.tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            cover: t.cover,
            duration: t.duration
        }));

        currentIndex = 0;

        showPlayer();
        loadCurrentSong();
        startPlayback();
    } catch (err) {
        console.error("Errore album queue:", err);
    }
}

// avvia la coda di riproduzione degli artisti
async function startArtistQueue(artistId) {
    try {
        const res = await fetch(`/progetto_php/api/get_artist.php?artist_id=${artistId}`);
        const data = await res.json();

        const tracks = data.topTracks || [];
        if (!tracks.length) return;

        queue = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist.name,
            cover: t.album.cover_medium,
            duration: t.duration
        }));

        currentIndex = 0;

        showPlayer();
        loadCurrentSong();
        startPlayback();
    } catch (err) {
        console.error("Errore artist queue:", err);
    }
}

// ottieni i brani correlati
async function prefetchRelatedTracks(songId) {
    try {
        const res = await fetch(`/progetto_php/api/get_related_tracks.php?song_id=${songId}`);
        const data = await res.json();

        if (!data.related?.length) return;

        // verifica se sono stati trovati brani correlatie e aggiungili in coda
        const existing = new Set(queue.map(s => s.id));
        const newTracks = data.related
            .filter(t => !existing.has(t.id))
            .map(t => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                duration: t.duration
            }));
        queue.push(...newTracks);

        await fetch("/progetto_php/api/add_related_tracks.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "tracks=" + encodeURIComponent(JSON.stringify(newTracks))
        });
    } catch (err) {
        console.error("Errore prefetch:", err);
    }
}

// aggiorna la progressbar sul player
function updateProgressUI() {
    const percent = totalDuration ? (currentTime / totalDuration) * 100 : 0;

    document.querySelector("#progress").style.width = percent + "%";
    document.querySelector("#progress-dot").style.left = percent + "%";

    document.querySelector("#current-time").textContent = formatDuration(currentTime);
    document.querySelector("#total-time").textContent = formatDuration(totalDuration);

    const mobile = document.querySelector("#mobile-progress");
    if (mobile) mobile.style.width = percent + "%";
}

// inizializza la progressbar
function initProgressBarControls() {
    const bar = document.querySelector("#progress-bar");
    const dot = document.querySelector("#progress-dot");

    let dragging = false;

    function seek(e) {
        const rect = bar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percent = x / rect.width;
        currentTime = Math.round(percent * totalDuration);

        updateProgressUI();
    }

    bar?.addEventListener("click", seek);

    dot?.addEventListener("mousedown", () => {
        dragging = true;
        stopPlayback();
    });

    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        seek(e);
    });

    document.addEventListener("mouseup", () => {
        if (!dragging) return;

        dragging = false;
        if (isPlaying) startPlayback();
    });
}

// esegui la funzione al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    initPlayer();
    initProgressBarControls();
});

// funzione globale per caricare la coda
window.playerLoadQueue = function (queueData, index = 0) {
    if (!Array.isArray(queueData) || queueData.length === 0) return;

    queue = queueData;
    currentIndex = index;

    const song = queue[currentIndex];
    if (!song) return;

    showPlayer();
    loadCurrentSong();
    startPlayback();
};