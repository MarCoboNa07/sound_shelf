document.addEventListener("DOMContentLoaded", async () => {
    const genreId = document.body.dataset.genreId;
    if (!genreId) {
        console.error("No genre id");
        return;
    }
    console.log("Chiamo API per genre_id:", genreId);
    try {
        const response = await fetch(`/progetto_php/api/get_genre_data.php?genre_id=${genreId}`);
        const data = await response.json();

        console.log("Risposta API:", data);

        if (data.error) {
            document.getElementById("genre-title").textContent = "Errore nel caricamento del genere";
            return;
        }

        // Mostra il nome del genere
        document.getElementById("genre-title").textContent = data.genre_name;

        const container = document.getElementById("genre-content");
        container.innerHTML = `
            <h2>Artisti</h2>
            <ul>
                ${data.artists.map(artist => `<li>${artist.name}</li>`).join('')}
            </ul>
            <h2>Album</h2>
            <div class="albums">
                ${data.albums.map(album => `
                    <div class="album-card">
                        <img src="${album.cover}" alt="${album.title}">
                        <p>${album.title} - ${album.artist}</p>
                    </div>
                `).join('')}
            </div>
            <h2>Tracce Popolari</h2>
            <ul>
                ${data.tracks.map(track => `<li>${track.title}</li>`).join('')}
            </ul>
        `;

    } catch (error) {
        console.error("Errore nel caricamento del genere:", error);
    }
});
