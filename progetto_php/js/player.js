// js/player.js
// file javascript per il player

// button play/pausa sul player
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");

// collegamento dei button play/pausa alle relative funzioni
playIcon.addEventListener("click", togglePlayPause);
pauseIcon.addEventListener("click", togglePlayPause);

// variabili per gestire lo stato del player
let queue = [];
let currentIndex = -1;
let isPlaying = false;
let interval = null;
let currentTime = 0;
let totalDuration = 0;

// button per skippare canzone o tornare indietro
const nextBtn = document.querySelector(".next-icon");
const prevBtn = document.querySelector(".prev-icon");

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// funzione per mostrare il player
function showPlayer() {
    document.querySelector(".player").classList.add("active-player");
    document.body.classList.add("player-open");

    setTimeout(resizeAlbumTitle, 310);
}

// funzioner per nascondere il player
function hidePlayer() {
    document.querySelector(".player").classList.remove("active-player");
    document.body.classList.remove("player-open");

    setTimeout(resizeAlbumTitle, 310);
}

// funzione per inizializzare la progress bar (time line)
function initProgressBarControls() {
    const progressBar = document.querySelector("#progress-bar");
    const dot = document.querySelector("#progress-dot");

    let isDragging = false; // varibile per la gestione del drag (scorrimento)

    // funzione per saltare ad un punto specifico della canzone
    function seek(e) {
        const rect = progressBar.getBoundingClientRect(); // prendi la posizione del mouse
        let x = e.clientX - rect.left; // calcola la posizione sulla barra
        x = Math.max(0, Math.min(x, rect.width)); // limita il valore tra 0 e larghezza della barra

        const percent = x / rect.width; // calcola la percentuale
        currentTime = Math.round(percent * totalDuration); // aggiorna il tempo
        updateProgressUI();
    }

    // salta al punto cliccato sulla barra
    progressBar.addEventListener("click", (e) => {
        seek(e);
    });

    // funzione per trascinare il pallino sulla barra
    dot.addEventListener("mousedown", () => {
        isDragging = true;
        clearInterval(interval);
    });

    // funzione per saltare al punto in cui viene rilasciato il pallino della barra
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        seek(e);
    });

    // funzione per terminare il drag
    document.addEventListener("mouseup", () => {
        if (!isDragging) return;

        isDragging = false;

        if (isPlaying) {
            startPlayback(); // riprendi dal canzone dal nuovo punto
        }
    });
}

// funzione per aggiornare la progress bar
function updateProgressUI() {
    const progress = document.querySelector("#progress");
    const dot = document.querySelector("#progress-dot");
    const currentTimeEl = document.querySelector("#current-time");
    const totalTimeEl = document.querySelector("#total-time");

    const percent = totalDuration ? (currentTime / totalDuration) * 100 : 0; // calcola la percentuale

    // aggiorna la barra sull'interfaccia
    progress.style.width = percent + "%";
    dot.style.left = percent + "%";

    // formatta il nuovo intervallo di tempo in minuti e secondi
    currentTimeEl.textContent = formatDuration(currentTime);
    totalTimeEl.textContent = formatDuration(totalDuration);
}

// funzione per mettere in pausa un brano
function pauseSong() {
    clearInterval(interval); // ripulisci l'intervallo
    interval = null;
    isPlaying = false; // metti in pausa il brano

    // cambia il pulsante in play
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
}


// funzione per riprendere riproduzione di un brano
function resumeSong() {
    if (!queue[currentIndex]) { // verifica se il brano non è in coda
        return;
    }

    isPlaying = true; // metti in riporduzione il brano

    // cambia il pulsante in pausa
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";

    startPlayback(); // avvia la riproduzuone
}

// funzione met mettere in play/pausa la canzone
function togglePlayPause() {
    if (!queue.length) { // nessuna canzone caricata in coda
        return;
    }

    if (isPlaying) {
        pauseSong();
    } else {
        resumeSong();
    }
}

// funzione saltare al brano successivo
async function nextSong() {
    if (currentIndex < queue.length - 1) { // verifica se esiste un brano in coda
        currentIndex++; // passa al brano successivo

         // 🔥 sync DB
        await fetch("/progetto_php/api/update_queue_position.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `position=${currentIndex}`
        });

        loadCurrentSong(); // carica il brano
        startPlayback(); // riproduci il brano
    } else {
        pauseSong(); // metti in pausa il brano
        currentIndex = queue.length ? queue.length - 1 : -1; // resta sull'ultima canzone se presente
        hidePlayer(); // nascondi il player
    }
}

// funzione per tornare al brano precedente
async function prevSong() {
    if (currentIndex > 0) { // verifica se esiste un brano prima
        currentIndex--; // passa la brano precedente

        // 🔥 sync DB
        await fetch("/progetto_php/api/update_queue_position.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `position=${currentIndex}`
        });

        loadCurrentSong(); // carica il brano
        startPlayback(); // riporduci il brano
    } else {
        currentTime = 0;
        updateProgressUI();
    }
}

function resizeAlbumTitle() {
    const title =
        document.querySelector("#album-title") ||
        document.querySelector("#track-title");

    if (title) {
        fitTitleToContainer(title, 148, 24);
    }
}
