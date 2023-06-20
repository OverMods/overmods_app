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
-- Table structure for table `game`
--

DROP TABLE IF EXISTS `game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `logo` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `logo` varchar(64) NOT NULL,
  `author` int NOT NULL,
  `author_title` varchar(64) DEFAULT NULL,
  `uploadedAt` date NOT NULL,
  `description` text NOT NULL,
  `game_version` varchar(16) DEFAULT NULL,
  `instruction` text,
  `downloaded` int unsigned NOT NULL DEFAULT '0',
  `file` varchar(128) NOT NULL,
  `file_size` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mod_game_idx` (`game`),
  KEY `mod_author_idx` (`author`),
  CONSTRAINT `mod_author` FOREIGN KEY (`author`) REFERENCES `user` (`id`),
  CONSTRAINT `mod_game` FOREIGN KEY (`game`) REFERENCES `game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `commentedAt` date DEFAULT NULL,
  `comment` text NOT NULL,
  `rating` int DEFAULT NULL,
  PRIMARY KEY (`id`,`mod`),
  KEY `comment_mod_idx` (`mod`),
  KEY `comment_user_idx` (`user`),
  CONSTRAINT `comment_mod` FOREIGN KEY (`mod`) REFERENCES `mod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comment_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
  PRIMARY KEY (`id`,`mod`),
  KEY `screenshot_mod_idx` (`mod`),
  CONSTRAINT `screenshot_mod` FOREIGN KEY (`mod`) REFERENCES `mod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `avatar` varchar(64) DEFAULT NULL,
  `registeredAt` date NOT NULL,
  `role` enum('ADMIN','MODDER','USER') NOT NULL,
  `site_rating` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-20  7:27:27
