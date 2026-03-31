document.addEventListener("DOMContentLoaded", async () => {
    const albumId = document.body.dataset.albumId;
    if (!albumId) return;

    try {
        const response = await fetch(`/progetto_php/api/get_album_tracks.php?album_id=${albumId}`);
        const data = await response.json();

        if (data.tracks && data.tracks.length > 0) {
            renderAlbumPage(data.tracks);
        }
    } catch (error) {
        console.error("Errore nel caricamento album:", error);
    }
});

function renderAlbumPage(tracks) {
    const tracksContainer = document.querySelector("#tracks-container");
    const albumTitle = document.querySelector("#album-title");
    const albumCover = document.querySelector("#album-cover");
    const albumMeta = document.querySelector("#album-meta");

    // Impostiamo i dati dell'intestazione (usando i dati della prima traccia)
    albumTitle.textContent = "Album"; // Nota: la tua API attuale non restituisce il nome album, solo tracce
    albumCover.src = tracks[0].cover;
    albumMeta.textContent = `${tracks[0].artist} • ${tracks.length} brani`;

    tracksContainer.innerHTML = "";

    tracks.forEach((track, index) => {
        const trackRow = document.createElement("div");
        trackRow.classList.add("track-row");
        
        // Usiamo la logica esistente: aggiungiamo .play-btn e i data-attributes
        trackRow.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-main-info">
                <div class="track-title-wrapper">
                    <span class="track-title">${track.title}</span>
                    <span class="track-artist">${track.artist}</span>
                </div>
            </div>
            <div class="track-actions">
                <button class="play-btn" 
                    data-type="song" 
                    data-id="${track.id}" 
                    data-title="${track.title}" 
                    data-artist="${track.artist}" 
                    data-cover="${track.cover}" 
                    data-duration="${track.duration}">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                </button>
                <span class="track-duration">${formatDuration(track.duration)}</span>
            </div>
        `;
        tracksContainer.appendChild(trackRow);
    });
}
