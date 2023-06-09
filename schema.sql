-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: overmods
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ban`
--

DROP TABLE IF EXISTS `ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ban` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `banned_by` int NOT NULL,
  `banned_at` datetime NOT NULL,
  `reason` text NOT NULL,
  `restrict_login` tinyint NOT NULL DEFAULT '0',
  `restrict_comment` tinyint NOT NULL DEFAULT '0',
  `restrict_posting` tinyint NOT NULL DEFAULT '0',
  `restrict_modding` tinyint NOT NULL DEFAULT '0',
  `restrict_download` tinyint NOT NULL DEFAULT '0',
  `can_appeal` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `ban_user_idx` (`user`),
  KEY `ban_banned_by_idx` (`banned_by`),
  CONSTRAINT `ban_banned_by` FOREIGN KEY (`banned_by`) REFERENCES `user` (`id`),
  CONSTRAINT `ban_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game`
--

DROP TABLE IF EXISTS `game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `short_name` varchar(32) NOT NULL,
  `logo` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mod`
--

DROP TABLE IF EXISTS `mod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `game` int NOT NULL,
  `title` varchar(64) NOT NULL,
  `logo` varchar(64) DEFAULT NULL,
  `author` int NOT NULL,
  `author_title` varchar(64) DEFAULT NULL,
  `rating` float NOT NULL DEFAULT '0',
  `uploaded_at` datetime NOT NULL,
  `description` text NOT NULL,
  `game_version` varchar(16) DEFAULT NULL,
  `mod_version` varchar(16) DEFAULT NULL,
  `instruction` text,
  `downloaded` int unsigned DEFAULT '0',
  `file` varchar(128) DEFAULT NULL,
  `file_size` int unsigned DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `mod_game_idx` (`game`),
  KEY `mod_author_idx` (`author`),
  CONSTRAINT `mod_author` FOREIGN KEY (`author`) REFERENCES `user` (`id`),
  CONSTRAINT `mod_game` FOREIGN KEY (`game`) REFERENCES `game` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mod_comments`
--

DROP TABLE IF EXISTS `mod_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mod_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mod` int NOT NULL,
  `user` int NOT NULL,
  `commented_at` datetime DEFAULT NULL,
  `comment` text NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`,`mod`),
  KEY `comment_mod_idx` (`mod`),
  KEY `comment_user_idx` (`user`),
  CONSTRAINT `comment_mod` FOREIGN KEY (`mod`) REFERENCES `mod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comment_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mod_ratings`
--

DROP TABLE IF EXISTS `mod_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mod_ratings` (
  `mod` int NOT NULL,
  `user` int NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  PRIMARY KEY (`mod`,`user`),
  KEY `rating_user_idx` (`user`),
  CONSTRAINT `rating_mod` FOREIGN KEY (`mod`) REFERENCES `mod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rating_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mod_screenshots`
--

DROP TABLE IF EXISTS `mod_screenshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mod_screenshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mod` int NOT NULL,
  `screenshot` varchar(64) NOT NULL,
  `title` varchar(64) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`,`mod`),
  KEY `screenshot_mod_idx` (`mod`),
  CONSTRAINT `screenshot_mod` FOREIGN KEY (`mod`) REFERENCES `mod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `request_role`
--

DROP TABLE IF EXISTS `request_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requested_by` int NOT NULL,
  `requested_at` datetime NOT NULL,
  `request_text` text,
  `new_role` enum('ADMIN','MODDER','USER') NOT NULL,
  `considered_by` int DEFAULT NULL,
  `considered_at` datetime DEFAULT NULL,
  `status` enum('PENDING','APPROVED','DECLINED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `request_role_requested_by_idx` (`requested_by`),
  KEY `request_role_approved_by_idx` (`considered_by`),
  CONSTRAINT `request_role_considered_by` FOREIGN KEY (`considered_by`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `request_role_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `email` varchar(64) DEFAULT NULL,
  `password` varchar(64) NOT NULL,
  `color` char(6) NOT NULL,
  `avatar` varchar(64) DEFAULT NULL,
  `registered_at` datetime NOT NULL,
  `role` enum('ADMIN','MODDER','USER') NOT NULL,
  `site_rating` tinyint DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL,
  `password_changed` datetime NOT NULL,
  `banned` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-07 19:13:30
