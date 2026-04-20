// js/explore.js
// file javascript per la pagina esplora

// funzione per ottenere i generi musicali
async function getGenres() {
    const genresContainer = document.querySelector("#genres-container");

    // palette di colori per i vari generi
    const genreColors = {
        "pop": "#ff477e",
        "rap/hip hop": "#ff9f1c",
        "reggaeton": "#ff006e",
        "rock": "#6a4c93",
        "dance": "#06d6a0",
        "r&b": "#8338ec",
        "alternative": "#8d99ae",
        "electro": "#00f5d4",
        "folk": "#bc6c25",
        "reggae": "#2ec4b6",
        "jazz": "#118ab2",
        "country": "#bc6c25",
        "salsa": "#ff006e",
        "classica": "#8d99ae",
        "film/videogiochi": "#4361ee",
        "metal": "#3a0ca3",
        "soul & funk": "#8338ec",
        "bambini": "#ffbe0b",
        "blues": "#073b4c",
        "cumbia": "#fb5607",
        "musica africana": "#2a9d8f",
        "musica asiatica": "#f72585",
        "musica brasiliana": "#38b000",
        "musica indiana": "#ff5400",
        "musica latina": "#ff006e"
    };

    try {
        const response = await fetch("/progetto_php/api/get_genres.php"); // richiesta all'api php per ottenere i generi
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // verifica se la risposta dà un errore

        const genres = await response.json();

        // verifica se non sono stati trovai generi
        if (!genres || genres.length === 0) {
            genresContainer.textContent = "Nessun genere disponibile.";
            return;
        }

        // ciclo foreach per scorrere l'array dei generi
        // ciclo foreach per scorrere l'array dei generi
        genres.forEach(genre => {
            const link = document.createElement("a");
            link.classList.add("genre-card");
            // Imposta l'href alla pagina del genere, ad esempio: genre.php?genre_id=ID
            link.href = `genre.php?genre_id=${genre.id}`;

            const genreName = genre.name.toLowerCase().trim();
            const color = genreColors[genreName] || genreColors["default"] || "#444444"; // assegna il colore al genere

            link.style.backgroundColor = color;

            const title = document.createElement("div");
            title.classList.add("genre-name");
            title.textContent = genre.name;

            const img = document.createElement("img");
            img.classList.add("genre-image");
            img.src = genre.picture;
            img.alt = genre.name;

            link.appendChild(title);
            link.appendChild(img);

            genresContainer.appendChild(link);
        });
    } catch (error) {
        console.error("Errore nel caricamento dei generi:", error);
        genresContainer.textContent = "Impossibile caricare i generi.";
    }
}

document.addEventListener("DOMContentLoaded", getGenres);
