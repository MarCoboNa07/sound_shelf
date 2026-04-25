Bonaventura Marco   5°ainf

### Analisi Schema ER ###
Lo schema ER rappresenta la struttura logica del database dell'applicazione integrando dati salvati sul database locale con dati esterni gestiti tramite le API dell'applicazione musicale Deezer.

Descrizione entità
- User: Rappresenta un utente registrato. Salva i dati di accesso e le informazioni di un utente.

- Playlist: Rappresenta una playlist, ovvero una raccolta di brani, creata da un utente.

- Queue: Rappresenta la sessione di ascolto dell'utente, ovvero la coda dei brani. La coda è unica per ogni utente.

- Artist (API) e Song (API): Sono entità esterne. Non fanno parte fisicamente del database locale, ma l'applicazione memorizza gli ID univoci per ottenere i metadati in tempo reale tramite le API di Deezer.




Relazioni e Cardinalità
- Create (User - Playlist): Cardinalità (0,N) lato User e (1,1) lato Playlist. Un utente può non avere playlist oppure può crearne molte, mentre una playlist appartiene ad un solo utente.

- Linked (User - Queue): Cardinalità (1,1) da entrami i lati. Ogni utente possiede una sola coda di riproduzione, garantendo la persistenza della sessione, infatti una coda appartiene ad un solo utente.

- Follow (User - Artist): Cardinalità (0,N) da entrambi i lati. Un utente può seguire più artisti e un artista può essere seguito da più utenti. Allo stesso tempo un utente può non seguire nessun artista e un artista può essere seguito da nessun utente.

- PlaylistItem (Playlist - Song): Cardinalità (0,N) da entrambi i lati. Una playlist può contenere molti brani, ma anche nessuno (nel momento della creazione è vuota). Un brano può apparire in più playlist, ma anche in nessuna. Gli attributi position e added_at descrivono questa associazione.

- QueueItem (Queue - Song): Cardinalità (,N) lato Queue e (0,N) lato Song. Una coda può non avere ancora nessun brano, mentre un brano può non essere inserito in nessuna coda, ma può essere anche inserito in più code.
La coda è composta da una lista ordinata di brani, gli attributi position e added_at descrivono questa associazione.

- IsPlaying (Queue - Song): Cardinalità (1,1) lato Queue e (0,N) lato Song. Su una coda è in riproduzione un solo brano, mentre un brano può non essere in riproduzione su nessuna coda oppure può esserlo su più code.
L'associazione identifica il brano attualmente in riproduzione nella coda dell'utente.



Scelte di progettazione
- La presenza simultanea di current_song_id_api e current_position introduce una ridondanza controllata, utile per ottimizzare le operazioni di lettura.

- Alcuni vincoli di cardinalità minima (es. Queue con almeno un brano) non sono direttamente esprimibili in SQL standard e vengono quindi delegati alla logica applicativa.

- L’attributo position consente sia ordinamento stabile sia operazioni efficienti di riordino senza dover ricostruire l’intera sequenza.



### Ristrutturazione verso lo Schema Logico ###
Per il passaggio dallo Schema ER allo Schema Logico sono state effettuate le seguenti operazioni di ristrutturazione.

- Eliminazione delle relazioni N:N: Le relazioni PlaylistItem, QueueItem e Follow sono state trasformate in tabelle contenenti le relative foreign key.

- Integrazione delle relazioni 1:1 e 1:N: La relazione Create è stata eliminata inserendo user_id come FK nella tabella Playlist. La relazione Linked è stata eliminata inserendo user_id nella tabella Queue con vincolo di unicità.

- Gestione delle entità esterne: Dato che Song e Artist non sono tabelle nel database locale, le loro primary key sono memorizzate come attributi semplici, nelle tabelle che ne hanno bisogno, senza vincoli di integrità referenziale nel DB.




### Analisi Schema Logico ###
Il database è strutturato nelle seguenti tabelle:

Users (id (PK), username, email, password)
Playlist (id (PK), name, description, created_at, user_id (FK))
Queue (id (PK), current_position, current_song_time, created_at, user_id (FK), current_song_id_api)
Follow (id (PK), user_id (FK), artist_id_api)
PlaylistItems (id (PK), position, added_at, playlist_id (FK), song_id_api)
QueueItems (id (PK), position, added_at, queue_id (FK), song_id_api)

Scelte di progettazione
- "_api": Utilizzato per identificare i campi che fanno riferimento a dati esterni. Inoltre indica che il database dell'applicazione non contiene dati riguardanti a musica e artisti, ma contiene solo un puntatore alle risorse fornite da Deezer.

- Attributo position: Presente sia in PlaylistItems che in QueueItems per permettere l'ordinamento corretto dei brani, permettere l'ordinamento manuale da parte dell'utente e permette di mantenere ordine in generale.

- Tabella Queue: Il campo current_song_id_api memorizza lo stato attuale della riproduzione, mentre current_position tiene traccia dell'indice numerico nella lista QueueItems, facilitando il passaggio al brano successivo o il ritorno al precedente.




### Analisi Database ###
Il database "sound_shelf" è stato implementato per l'applicazione utilizzando il linguaggio SQL.

Scelte di progettazione
- Tipo di dato per collegamento ad API esterne: Per le colonne artist_id_api, song_id_api e current_song_id_api, è stato utilizzato il tipo bigint perchè gli ID generati da piattaforme esterne come Deezer possono superare la dimensione del tipo INT.

- Integrità referenziale: Tutte le relazioni sono state protette con il vincolo ON DELETE CASCADE. Questo garantisce che, alla cancellazione di un utente, il DBMS elimini automaticamente tutte le relative playlist, i seguiti e la coda di riproduzione, evitando dati inutili e garantendo la pulizia del DB.

- Gestione della coda: La tabella Queue contiene la colonna user_id con un vincolo UNIQUE. Questo vincolo implementa fisicamente la cardinalità (1,1) definita nello schema ER, impedendo che un utente possa avere più di una coda di riproduzione attiva contemporaneamente.

- Indicatori di tempo: L'uso di timestamp con DEFAULT current_timestamp() e ON UPDATE current_timestamp() permette di tracciare automaticamente la creazione e l'ultima modifica di playlist.




### Query di esempio ###
- Recuperare brani da una specifica playlist

SELECT position, song_id_api, added_at
FROM playlist_items
WHERE playlist_id = 5
ORDER BY position ASC;

- Visualizzare la coda di riproduzione di un utente

SELECT users.username, queue.current_song_id_api, queue_items.song_id_api, queue_items.position
FROM users
JOIN queue ON users.id = queue.user_id
JOIN queue_items ON queue.id = queue_items.queue_id
WHERE users.id = 1
ORDER BY queue_items.position ASC;

- Contare quanti utenti seguono un determinato artista

SELECT COUNT(user_id) AS total_followers
FROM follow
WHERE artist_id_api = 12345;

### Descrizione Applicazione ###
L'applicazione SoundShelf è un sistema di organizzazione e gestione della libreria musicale basato sul catalogo globale del servizio di streming musicale Deezer.

Obiettivo del progetto
L'obiettivo principale del progetto non è la riproduzione diretta dei brani, operazione limitata dalle policy di copyright e dalle restrizioni delle API di streaming, ma la creazione di un'interfaccia personalizzata per la gestione dei dati musicali. L'utente ha la possibilità di esplorare il catalogo di Deezer per creare la propria esperienza musicale salvando i dati nel database locale di SoundShelf.

Funzionalità principali
- Ricerca ed Esplora: Tramite le API di Deezer, l'utente può cercare brani, album e artisti. L'app riceve i dati in formato JSON e li mostra dinamicamente.

- Gestione playlist: L'utente può creare playlist personalizzate. Il database locale memorizza solo i riferimenti ai dati presenti nel catalogo di Deezer.

- Sistema di following: L'utente ha la possibilità di seguire i suoi artisti preferiti.

- Coda di ascolto: Anche se l'audio non viene riprodotto fisicamente, l'app implementa la logica di riproduzione dei brani, implementando anche la struttura della coda di riproduzione. Questo serve per simulare il comportamento di un player reale, permettendo all'utente di saltare da un brano all'altro o di riordinare la coda nel modo che preferisce.
