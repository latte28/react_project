-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 react_project.commentlikes 구조 내보내기
CREATE TABLE IF NOT EXISTS `commentlikes` (
  `likeId` int NOT NULL AUTO_INCREMENT,
  `commentId` int DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`likeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.commentlikes:~0 rows (대략적) 내보내기

-- 테이블 react_project.comments 구조 내보내기
CREATE TABLE IF NOT EXISTS `comments` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `postId` int DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`commentId`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.comments:~4 rows (대략적) 내보내기
INSERT INTO `comments` (`commentId`, `postId`, `userId`, `content`, `createdAt`, `parentId`) VALUES
	(68, 28, 'test1', '강아지 이쁘네요!', '2025-05-12 16:33:37', NULL),
	(69, 28, 'test2', '@별똥별  그쵸?!?', '2025-05-12 16:33:50', 68),
	(70, 28, 'test2', '@별똥별  아주 이뻐요!!', '2025-05-12 16:37:14', 68),
	(71, 29, 'test2', '귀엽네여!!!', '2025-05-12 18:18:00', NULL);

-- 테이블 react_project.convos 구조 내보내기
CREATE TABLE IF NOT EXISTS `convos` (
  `convoId` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`convoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.convos:~0 rows (대략적) 내보내기

-- 테이블 react_project.convousers 구조 내보내기
CREATE TABLE IF NOT EXISTS `convousers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `convoId` int DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `joinedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.convousers:~0 rows (대략적) 내보내기

-- 테이블 react_project.dm_messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_messages` (
  `messageId` int NOT NULL AUTO_INCREMENT,
  `roomId` int NOT NULL,
  `senderId` varchar(50) DEFAULT NULL,
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `mediaUrl` varchar(255) DEFAULT NULL,
  `mediaType` varchar(20) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `toUserId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`messageId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `dm_messages_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `dm_rooms` (`roomId`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.dm_messages:~63 rows (대략적) 내보내기
INSERT INTO `dm_messages` (`messageId`, `roomId`, `senderId`, `content`, `createdAt`, `mediaUrl`, `mediaType`, `isRead`, `toUserId`) VALUES
	(9, 3, 'test1', '안녕?', '2025-05-14 11:33:07', NULL, NULL, 0, NULL),
	(10, 3, 'test1', '하이?!', '2025-05-14 11:33:50', NULL, NULL, 0, NULL),
	(11, 3, 'test2', '되는거야?!@', '2025-05-14 11:34:00', NULL, NULL, 0, NULL),
	(12, 3, 'test2', '?!', '2025-05-14 11:34:09', NULL, NULL, 0, NULL),
	(13, 3, 'test2', '??', '2025-05-14 11:38:28', NULL, NULL, 0, NULL),
	(14, 3, 'test1', 'ㅗ', '2025-05-14 11:40:59', NULL, NULL, 0, NULL),
	(15, 3, 'test1', '?', '2025-05-14 11:42:50', NULL, NULL, 0, NULL),
	(16, 3, 'test2', '?', '2025-05-14 11:47:39', NULL, NULL, 0, NULL),
	(17, 3, 'test2', '??', '2025-05-14 11:48:32', NULL, NULL, 0, NULL),
	(18, 3, 'test1', '하이', '2025-05-14 11:52:04', NULL, NULL, 0, NULL),
	(19, 3, 'test1', '제발', '2025-05-14 11:56:36', NULL, NULL, 0, NULL),
	(20, 3, 'test2', '된거임?', '2025-05-14 11:56:42', NULL, NULL, 0, NULL),
	(21, 3, 'test2', '오예!!!', '2025-05-14 11:56:49', NULL, NULL, 0, NULL),
	(22, 3, 'test1', '끝??', '2025-05-14 12:05:14', NULL, NULL, 0, NULL),
	(23, 3, 'test2', '??', '2025-05-14 12:05:21', NULL, NULL, 0, NULL),
	(24, 3, 'test1', '??', '2025-05-14 12:05:30', NULL, NULL, 0, NULL),
	(25, 3, 'test2', '아 왜', '2025-05-14 12:05:39', NULL, NULL, 0, NULL),
	(26, 3, 'test2', '안바뀌냐', '2025-05-14 12:05:45', NULL, NULL, 0, NULL),
	(27, 3, 'test1', '아 빨리', '2025-05-14 12:05:56', NULL, NULL, 0, NULL),
	(28, 3, 'test1', '??', '2025-05-14 12:09:42', NULL, NULL, 0, NULL),
	(29, 3, 'test2', '.', '2025-05-14 12:09:51', NULL, NULL, 0, NULL),
	(30, 3, 'test2', '//', '2025-05-14 12:09:57', NULL, NULL, 0, NULL),
	(31, 3, 'test2', 'ㅎㄿ ㅏㄹ ㅍㄴ ㅇㅍ', '2025-05-14 12:10:00', NULL, NULL, 0, NULL),
	(32, 3, 'test1', 'ㅋㅇㄹ', '2025-05-14 12:10:12', NULL, NULL, 0, NULL),
	(33, 3, 'test1', '!!!!', '2025-05-14 12:12:19', NULL, NULL, 0, NULL),
	(34, 3, 'test1', '!!!!!!!!!', '2025-05-14 12:12:23', NULL, NULL, 0, NULL),
	(35, 3, 'test1', '?!?!', '2025-05-14 12:14:53', NULL, NULL, 0, NULL),
	(36, 3, 'test1', '----', '2025-05-14 12:15:03', NULL, NULL, 0, NULL),
	(37, 3, 'test1', 'ㅋㅋㅋ', '2025-05-14 12:15:26', NULL, NULL, 0, NULL),
	(38, 3, 'test1', '22', '2025-05-14 12:17:09', NULL, NULL, 0, NULL),
	(39, 3, 'test1', '11', '2025-05-14 12:17:15', NULL, NULL, 0, NULL),
	(40, 3, 'test1', '11', '2025-05-14 12:17:28', NULL, NULL, 0, NULL),
	(41, 3, 'test1', 'ㅋㅋ', '2025-05-14 12:17:34', NULL, NULL, 0, NULL),
	(42, 3, 'test1', '제발', '2025-05-14 12:20:07', NULL, NULL, 0, NULL),
	(43, 3, 'test1', '됨?', '2025-05-14 12:25:26', NULL, NULL, 0, NULL),
	(44, 3, 'test1', '??', '2025-05-14 12:25:34', NULL, NULL, 0, NULL),
	(45, 3, 'test1', '아니', '2025-05-14 12:25:38', NULL, NULL, 0, NULL),
	(47, 3, 'test2', '돼?', '2025-05-14 12:35:02', NULL, NULL, 0, NULL),
	(49, 3, 'test2', '안돼', '2025-05-14 12:37:27', NULL, NULL, 0, NULL),
	(50, 3, 'test1', '이제 제발', '2025-05-14 12:40:20', NULL, NULL, 0, NULL),
	(51, 3, 'test1', '끝?', '2025-05-14 12:44:59', NULL, NULL, 0, NULL),
	(55, 4, 'test1', '?', '2025-05-14 13:02:18', NULL, NULL, 0, NULL),
	(57, 3, 'test1', '우리집 강쥐임', '2025-05-14 13:30:03', '/uploads/1747197003017-______1_jpg', 'image', 0, NULL),
	(60, 3, 'test1', 'ㅋㅋ', '2025-05-14 14:30:46', '/uploads/1747200646518-______1_jpg', 'image', 0, NULL),
	(62, 3, 'test2', '하이~', '2025-05-15 14:40:14', NULL, NULL, 0, NULL),
	(63, 3, 'test2', '우리 언제 만나?', '2025-05-15 14:40:19', NULL, NULL, 0, NULL),
	(64, 3, 'test1', '글쎄??? 조만간??', '2025-05-15 14:40:25', NULL, NULL, 0, NULL),
	(65, 3, 'test1', '곧 보자!!', '2025-05-15 14:40:40', '/uploads/1747287640780-______2_jpg', 'image', 0, NULL),
	(66, 3, 'test1', '하이~', '2025-05-15 15:16:48', NULL, NULL, 1, 'test2'),
	(67, 3, 'test2', '됨?', '2025-05-15 15:24:33', NULL, NULL, 1, 'test1'),
	(68, 3, 'test2', '됨?', '2025-05-15 15:24:38', NULL, NULL, 1, 'test1'),
	(69, 3, 'test2', '?', '2025-05-15 15:37:49', NULL, NULL, 1, 'test1'),
	(70, 3, 'test2', '?', '2025-05-15 15:38:09', NULL, NULL, 1, 'test1'),
	(71, 3, 'test2', '?', '2025-05-15 15:39:32', NULL, NULL, 1, 'test1'),
	(72, 3, 'test2', '?', '2025-05-15 15:39:38', NULL, NULL, 1, 'test1'),
	(73, 3, 'test2', '@', '2025-05-15 15:42:56', NULL, NULL, 1, 'test1'),
	(74, 3, 'test2', '!!', '2025-05-15 15:48:43', NULL, NULL, 1, 'test1'),
	(75, 3, 'test2', '??', '2025-05-15 15:49:00', NULL, NULL, 1, 'test1'),
	(76, 3, 'test2', '11', '2025-05-15 15:49:11', NULL, NULL, 1, 'test1'),
	(77, 3, 'test2', '?', '2025-05-15 15:49:23', NULL, NULL, 1, 'test1'),
	(78, 3, 'test2', '된거여ㅑ?', '2025-05-15 16:01:11', NULL, NULL, 1, 'test1'),
	(79, 3, 'test2', 'ㅇㅇ', '2025-05-15 16:01:21', NULL, NULL, 1, 'test1'),
	(80, 3, 'test2', '?', '2025-05-15 16:07:22', NULL, NULL, 1, 'test1'),
	(81, 3, 'test2', '?', '2025-05-15 16:19:44', NULL, NULL, 1, 'test1'),
	(82, 3, 'test2', '3', '2025-05-15 16:20:15', NULL, NULL, 1, 'test1'),
	(83, 3, 'test2', '?', '2025-05-15 16:34:03', NULL, NULL, 1, 'test1'),
	(84, 3, 'test2', '!', '2025-05-15 16:34:07', NULL, NULL, 1, 'test1'),
	(85, 3, 'test2', '?', '2025-05-15 16:40:42', NULL, NULL, 1, 'test1'),
	(86, 3, 'test2', '...............', '2025-05-15 16:40:49', NULL, NULL, 1, 'test1');

-- 테이블 react_project.dm_rooms 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_rooms` (
  `roomId` int NOT NULL AUTO_INCREMENT,
  `userA` varchar(50) NOT NULL DEFAULT '',
  `userB` varchar(50) NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`roomId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.dm_rooms:~2 rows (대략적) 내보내기
INSERT INTO `dm_rooms` (`roomId`, `userA`, `userB`, `createdAt`) VALUES
	(3, 'test1', 'test2', '2025-05-14 11:33:00'),
	(4, 'test1', 'kakao_1747122426930', '2025-05-14 13:02:14');

-- 테이블 react_project.files 구조 내보내기
CREATE TABLE IF NOT EXISTS `files` (
  `fileId` int NOT NULL AUTO_INCREMENT,
  `path` varchar(255) DEFAULT NULL,
  `mime` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.files:~0 rows (대략적) 내보내기

-- 테이블 react_project.follows 구조 내보내기
CREATE TABLE IF NOT EXISTS `follows` (
  `followId` int NOT NULL AUTO_INCREMENT,
  `fromUser` varchar(50) DEFAULT NULL,
  `toUser` varchar(50) DEFAULT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`followId`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.follows:~4 rows (대략적) 내보내기
INSERT INTO `follows` (`followId`, `fromUser`, `toUser`, `status`, `createdAt`) VALUES
	(100, 'test2', 'test1', 'accepted', '2025-05-13 16:34:38'),
	(101, 'test1', 'test2', 'accepted', '2025-05-13 16:34:45'),
	(114, 'kakao_1747122426930', 'test1', 'accepted', '2025-05-14 10:03:53'),
	(115, 'test1', 'kakao_1747122426930', 'accepted', '2025-05-14 10:03:56');

-- 테이블 react_project.messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `messages` (
  `msgId` int NOT NULL AUTO_INCREMENT,
  `convoId` int DEFAULT NULL,
  `senderId` varchar(50) DEFAULT NULL,
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `isRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`msgId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.messages:~0 rows (대략적) 내보내기

-- 테이블 react_project.notis 구조 내보내기
CREATE TABLE IF NOT EXISTS `notis` (
  `notiId` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(50) DEFAULT NULL,
  `postId` int DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `msg` varchar(255) DEFAULT NULL,
  `extraData` json DEFAULT NULL,
  `fromUser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notiId`)
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.notis:~0 rows (대략적) 내보내기

-- 테이블 react_project.postimgs 구조 내보내기
CREATE TABLE IF NOT EXISTS `postimgs` (
  `imgId` int NOT NULL AUTO_INCREMENT,
  `postId` int DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `sort` int DEFAULT NULL,
  `type` enum('image','video') DEFAULT 'image',
  PRIMARY KEY (`imgId`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.postimgs:~5 rows (대략적) 내보내기
INSERT INTO `postimgs` (`imgId`, `postId`, `url`, `sort`, `type`) VALUES
	(42, 24, '/uploads/1747031283370-ê°ìì§2.jpg', 0, 'image'),
	(46, 27, '/uploads/1747031408632-ë¼ë¼2.jpg', 0, 'image'),
	(47, 28, '/uploads/1747031430379-ë¼ë¼1.jpg', 0, 'image'),
	(62, 25, '/uploads/1747040549512-ê°ìì§3.jpg', 0, 'image'),
	(63, 30, '/uploads/1747615039477-ë¼ë¼ ì°ì±.mp4', 0, 'video');

-- 테이블 react_project.postlikes 구조 내보내기
CREATE TABLE IF NOT EXISTS `postlikes` (
  `likeId` int NOT NULL AUTO_INCREMENT,
  `postId` int DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `likedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`likeId`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.postlikes:~3 rows (대략적) 내보내기
INSERT INTO `postlikes` (`likeId`, `postId`, `userId`, `likedAt`) VALUES
	(172, 29, 'test2', '2025-05-14 12:19:53'),
	(173, 26, 'test2', '2025-05-15 14:39:41'),
	(174, 26, 'test1', '2025-05-15 14:39:48');

-- 테이블 react_project.posts 구조 내보내기
CREATE TABLE IF NOT EXISTS `posts` (
  `postId` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(50) DEFAULT NULL,
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.posts:~5 rows (대략적) 내보내기
INSERT INTO `posts` (`postId`, `userId`, `content`, `createdAt`, `updatedAt`) VALUES
	(24, 'test1', '오늘도 냄새 맡고, 풀 뜯고, 친구도 만나고 왔어.\r\n강아지 인생 별거 없지, 바람 맞으며 산책하는 이 시간이 제일 행복한 시간이야. 🌿', '2025-05-12 15:28:03', '2025-05-12 15:28:03'),
	(25, 'test1', '이불 다 뺏기고 누워있지만... 이렇게 자고 있는 모습 보면 아무 말도 못하겠네.\r\n오늘 하루도 수고했어, 우리 아가.!!', '2025-05-12 15:29:14', '2025-05-12 18:02:29'),
	(27, 'test2', '목욕은 정말 싫어하면서도 끝나고 나면 뽀송해진 네 모습에 내가 더 힐링돼.\r\n고생했으니까 오늘 간식 하나 더 주자.', '2025-05-12 15:30:08', '2025-05-12 15:30:08'),
	(28, 'test2', '우리 집 강쥐는 라떼! 간식 줘!!', '2025-05-12 15:30:30', '2025-05-12 15:30:30'),
	(30, 'test1', '?\r\n', '2025-05-19 09:37:19', '2025-05-19 09:37:19');

-- 테이블 react_project.stories 구조 내보내기
CREATE TABLE IF NOT EXISTS `stories` (
  `storyId` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(50) DEFAULT NULL,
  `imgUrl` varchar(255) DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `expiredAt` datetime DEFAULT NULL,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`storyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.stories:~0 rows (대략적) 내보내기

-- 테이블 react_project.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `userId` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pw` varchar(255) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `nick` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `birth` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `profileImg` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDeleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 react_project.users:~3 rows (대략적) 내보내기
INSERT INTO `users` (`userId`, `email`, `pw`, `name`, `nick`, `bio`, `birth`, `phone`, `gender`, `profileImg`, `createdAt`, `updatedAt`, `isDeleted`) VALUES
	('kakao_1747122426930', '', NULL, '길동이', '끝내줘', NULL, '2020-10-08', '01012361235', '기타', NULL, '2025-05-13 16:47:06', '2025-05-13 16:47:49', 0),
	('test1', 'test@gmail.com', '$2b$10$aZEayJ8MWfwSNw2X9maWj.H/o78GVdemUSGDgbTDcilXi/fQVKKa2', '재원', '별똥별', '소개글이다!!', NULL, NULL, '남성', '/uploads/1747029693455-ë¼ë¼1.jpg', '2025-05-12 14:56:30', '2025-05-12 15:21:33', 0),
	('test2', 'test1@gmail.com', '$2b$10$Jc1sRSvu2Ais7gVKzNaSxeWgqh9qoMMdPJus.zmq9k/N0rwvJ.ZnW', '한별', '별똥구리', '소개글입니다~', NULL, NULL, '여성', '/uploads/1747029706727-ë¼ë¼2.jpg', '2025-05-12 14:58:22', '2025-05-12 15:01:46', 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
