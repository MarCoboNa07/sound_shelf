-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Apr 22, 2026 alle 16:40
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sound_shelf`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `follow`
--

CREATE TABLE `follow` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `artist_id_api` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `follow`
--

INSERT INTO `follow` (`id`, `user_id`, `artist_id_api`) VALUES
(3, 1, 7371074);

-- --------------------------------------------------------

--
-- Struttura della tabella `playlist`
--

CREATE TABLE `playlist` (
  `id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `playlist`
--

INSERT INTO `playlist` (`id`, `name`, `description`, `created_at`, `user_id`) VALUES
(1, 'playlist prova', 'provaaaaaaaaaaa', '2026-04-22 08:02:38', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `playlist_items`
--

CREATE TABLE `playlist_items` (
  `id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `playlist_id` int(11) NOT NULL,
  `song_id_api` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `playlist_items`
--

INSERT INTO `playlist_items` (`id`, `position`, `added_at`, `playlist_id`, `song_id_api`) VALUES
(1, 0, '2026-04-22 11:45:47', 1, 1825879897),
(2, 1, '2026-04-22 14:37:38', 1, 137233860);

-- --------------------------------------------------------

--
-- Struttura della tabella `queue`
--

CREATE TABLE `queue` (
  `id` int(11) NOT NULL,
  `current_position` int(11) NOT NULL,
  `current_song_time` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) NOT NULL,
  `current_song_id_api` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `queue`
--

INSERT INTO `queue` (`id`, `current_position`, `current_song_time`, `created_at`, `user_id`, `current_song_id_api`) VALUES
(10, 25, 0, '2026-04-21 18:20:06', 1, 3358964681);

-- --------------------------------------------------------

--
-- Struttura della tabella `queue_items`
--

CREATE TABLE `queue_items` (
  `id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `queue_id` int(11) NOT NULL,
  `song_id_api` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `queue_items`
--

INSERT INTO `queue_items` (`id`, `position`, `queue_id`, `song_id_api`) VALUES
(1025, 0, 10, 3358964681),
(1026, 1, 10, 3358964731),
(1027, 2, 10, 3740119662),
(1028, 3, 10, 3792168942),
(1029, 4, 10, 2280661767),
(1030, 5, 10, 3792168902),
(1031, 6, 10, 3792168822),
(1032, 7, 10, 3358964791),
(1033, 8, 10, 3358964741),
(1034, 9, 10, 2846483322),
(1035, 10, 10, 3358964721),
(1036, 11, 10, 3358964781),
(1037, 12, 10, 3642746062),
(1038, 13, 10, 3792168892),
(1039, 14, 10, 3358964701),
(1040, 15, 10, 3924212751),
(1041, 16, 10, 3309718011),
(1042, 17, 10, 3792168832),
(1043, 18, 10, 2846524902),
(1044, 19, 10, 3792168972),
(1045, 20, 10, 3358964691),
(1046, 21, 10, 3358964711),
(1047, 22, 10, 3358964761),
(1048, 23, 10, 3348909631),
(1049, 24, 10, 3358964771),
(1050, 25, 10, 3740119682);

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`) VALUES
(1, 'utente_prova', 'prova@gmail.com', '$2y$10$eEmpcKxTZbUhhLvroh8hr.fE/J2OeXx7UiieF6xn41yfV6uapPG3C');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `playlist_items`
--
ALTER TABLE `playlist_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `playlistId` (`playlist_id`);

--
-- Indici per le tabelle `queue`
--
ALTER TABLE `queue`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `queue_items`
--
ALTER TABLE `queue_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_queue_song` (`queue_id`,`song_id_api`),
  ADD KEY `queue_id` (`queue_id`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `follow`
--
ALTER TABLE `follow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `playlist_items`
--
ALTER TABLE `playlist_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `queue`
--
ALTER TABLE `queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `queue_items`
--
ALTER TABLE `queue_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1051;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `follow_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `playlist`
--
ALTER TABLE `playlist`
  ADD CONSTRAINT `playlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `playlist_items`
--
ALTER TABLE `playlist_items`
  ADD CONSTRAINT `playlist_items_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `playlist` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `queue`
--
ALTER TABLE `queue`
  ADD CONSTRAINT `queue_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `queue_items`
--
ALTER TABLE `queue_items`
  ADD CONSTRAINT `queue_items_ibfk_1` FOREIGN KEY (`queue_id`) REFERENCES `queue` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
