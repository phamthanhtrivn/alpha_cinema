-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_ticket_db
CREATE DATABASE IF NOT EXISTS `alpha_ticket_db` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `alpha_ticket_db`;

-- Dumping structure for table alpha_ticket_db.holidays
CREATE TABLE IF NOT EXISTS `holidays` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_ticket_db.holidays: ~2 rows (approximately)
REPLACE INTO `holidays` (`id`, `created_at`, `description`, `end_date`, `name`, `start_date`, `status`, `updated_at`) VALUES
	('HD471f4107-f', '2026-03-12 09:46:18.100208', '', '2026-05-03', 'L? 30/4, 1/5 2026', '2026-04-30', b'1', '2026-03-12 09:46:18.100208'),
	('HD631592f3-f', '2026-03-12 09:44:28.424713', '', '2026-04-27', 'L? Gi? T? Hùng V??ng 2026', '2026-04-26', b'1', '2026-03-12 09:47:35.962716');

-- Dumping structure for table alpha_ticket_db.ticket_prices
CREATE TABLE IF NOT EXISTS `ticket_prices` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `day_type` enum('HOLIDAY','WEEKDAY','WEEKEND_AFTER_17','WEEKEND_BEFORE_17') DEFAULT NULL,
  `price` double NOT NULL,
  `projection_type` enum('IMAX','_2D','_3D') DEFAULT NULL,
  `seat_type_id` varchar(255) DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1ws402yakg3hp9xu79q3dnbkh` (`seat_type_id`,`projection_type`,`day_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_ticket_db.ticket_prices: ~35 rows (approximately)
REPLACE INTO `ticket_prices` (`id`, `created_at`, `day_type`, `price`, `projection_type`, `seat_type_id`, `status`, `updated_at`) VALUES
	('TP001eefc7-2', '2026-03-11 19:14:59.073601', 'WEEKEND_AFTER_17', 125000, 'IMAX', 'ST01', b'1', '2026-03-11 19:59:40.857058'),
	('TP016b7356-9', '2026-03-11 19:13:46.778248', 'WEEKEND_AFTER_17', 180000, '_2D', 'ST02', b'1', '2026-03-11 19:13:46.778248'),
	('TP01acc33d-b', '2026-03-11 19:17:49.476350', 'HOLIDAY', 135000, 'IMAX', 'ST01', b'1', '2026-04-07 17:29:28.455836'),
	('TP02acd297-3', '2026-03-11 19:16:37.965863', 'HOLIDAY', 135000, '_2D', 'ST03', b'1', '2026-03-11 19:16:37.965863'),
	('TP04b455f4-1', '2026-03-11 19:14:45.586840', 'WEEKEND_AFTER_17', 140000, '_3D', 'ST03', b'1', '2026-03-11 19:14:45.586840'),
	('TP22d52042-d', '2026-03-11 19:15:08.835351', 'WEEKEND_AFTER_17', 250000, 'IMAX', 'ST02', b'1', '2026-03-11 19:15:08.835351'),
	('TP2abe1cab-4', '2026-03-11 19:14:20.522139', 'WEEKEND_AFTER_17', 110000, '_3D', 'ST01', b'1', '2026-03-11 19:14:20.522139'),
	('TP2feeb035-b', '2026-03-11 19:07:25.394926', 'WEEKDAY', 190000, 'IMAX', 'ST02', b'1', '2026-03-11 19:07:25.394926'),
	('TP3230b9f1-7', '2026-03-11 19:13:34.214628', 'WEEKEND_AFTER_17', 90000, '_2D', 'ST01', b'1', '2026-03-11 19:13:34.214628'),
	('TP32d31aab-7', '2026-03-11 19:07:12.091889', 'WEEKDAY', 95000, 'IMAX', 'ST01', b'1', '2026-03-11 19:07:12.091889'),
	('TP39a32c02-e', '2026-03-11 19:13:58.043770', 'WEEKEND_AFTER_17', 120000, '_2D', 'ST03', b'1', '2026-03-11 19:13:58.043770'),
	('TP3d088e8f-b', '2026-03-11 19:06:41.359280', 'WEEKDAY', 105000, '_3D', 'ST03', b'1', '2026-03-11 19:06:41.359280'),
	('TP4811e80b-f', '2026-03-11 19:04:40.653732', 'WEEKDAY', 120000, '_2D', 'ST02', b'1', '2026-03-11 19:04:40.654303'),
	('TP4f3f8476-b', '2026-03-11 19:17:18.415133', 'HOLIDAY', 155000, '_3D', 'ST03', b'1', '2026-03-11 19:17:18.415133'),
	('TP52692730-e', '2026-03-11 19:17:58.001305', 'HOLIDAY', 270000, 'IMAX', 'ST02', b'1', '2026-03-11 19:17:58.001305'),
	('TP5323de78-5', '2026-03-11 19:04:58.403647', 'WEEKDAY', 85000, '_2D', 'ST03', b'1', '2026-03-11 19:04:58.403647'),
	('TP6de2a672-a', '2026-03-11 19:12:43.102254', 'WEEKEND_BEFORE_17', 230000, 'IMAX', 'ST02', b'1', '2026-03-11 19:12:43.102254'),
	('TP6fb2e18d-1', '2026-03-11 19:16:29.828151', 'HOLIDAY', 190000, '_2D', 'ST02', b'1', '2026-03-11 19:16:29.828151'),
	('TP6fda8e23-6', '2026-03-11 19:05:35.105765', 'WEEKDAY', 160000, '_3D', 'ST02', b'1', '2026-03-11 19:05:35.105765'),
	('TP713204ce-0', '2026-03-11 19:16:54.155583', 'HOLIDAY', 115000, '_3D', 'ST01', b'1', '2026-03-11 19:16:54.155583'),
	('TP7e2cb24c-e', '2026-03-11 19:13:13.068164', 'WEEKEND_BEFORE_17', 155000, 'IMAX', 'ST03', b'1', '2026-03-11 19:13:13.068164'),
	('TP885e2ae1-6', '2026-03-11 19:05:26.785485', 'WEEKDAY', 80000, '_3D', 'ST01', b'1', '2026-03-11 19:05:26.785485'),
	('TP8ce7e80a-f', '2026-03-11 16:09:25.225145', 'WEEKDAY', 60000, '_2D', 'ST01', b'1', '2026-03-11 16:09:25.225145'),
	('TP8f6af3e4-a', '2026-03-11 19:18:13.105174', 'HOLIDAY', 185000, 'IMAX', 'ST03', b'1', '2026-03-11 19:18:13.105174'),
	('TPa6da3629-4', '2026-03-11 19:11:02.204307', 'WEEKEND_BEFORE_17', 115000, 'IMAX', 'ST01', b'1', '2026-03-11 19:11:02.204307'),
	('TPa80f3219-3', '2026-03-11 19:07:40.666137', 'WEEKDAY', 135000, 'IMAX', 'ST03', b'1', '2026-03-11 19:07:40.666137'),
	('TPaa935bb4-e', '2026-03-11 19:09:54.228358', 'WEEKEND_BEFORE_17', 105000, '_2D', 'ST03', b'1', '2026-03-11 19:09:54.228358'),
	('TPaa9d9767-6', '2026-03-11 19:14:31.590514', 'WEEKEND_AFTER_17', 220000, '_3D', 'ST02', b'1', '2026-03-11 19:14:31.590514'),
	('TPaac155ef-1', '2026-03-11 19:16:18.792030', 'HOLIDAY', 95000, '_2D', 'ST01', b'1', '2026-03-11 19:16:18.792030'),
	('TPb750210b-e', '2026-03-11 19:10:29.829419', 'WEEKEND_BEFORE_17', 200000, '_3D', 'ST02', b'1', '2026-03-11 19:10:29.829419'),
	('TPc64c2491-8', '2026-03-11 19:08:13.769297', 'WEEKEND_BEFORE_17', 80000, '_2D', 'ST01', b'1', '2026-03-11 19:08:13.769297'),
	('TPcfde7fc0-3', '2026-03-11 19:10:46.365530', 'WEEKEND_BEFORE_17', 125000, '_3D', 'ST03', b'1', '2026-03-11 19:10:46.365530'),
	('TPe4c3244f-3', '2026-03-11 19:15:57.426422', 'WEEKEND_AFTER_17', 165000, 'IMAX', 'ST03', b'1', '2026-03-11 19:15:57.426422'),
	('TPeb9067f2-2', '2026-03-11 19:17:02.129712', 'HOLIDAY', 230000, '_3D', 'ST02', b'1', '2026-03-11 19:17:02.129712'),
	('TPf214a676-8', '2026-03-11 19:10:17.831970', 'WEEKEND_BEFORE_17', 100000, '_3D', 'ST01', b'1', '2026-03-11 19:10:17.831970');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_payment_db
CREATE DATABASE IF NOT EXISTS `alpha_payment_db` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `alpha_payment_db`;

-- Dumping structure for table alpha_payment_db.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(255) NOT NULL,
  `amount` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `method` enum('CASH','MOMO','VNPAY') DEFAULT NULL,
  `order_id` varchar(255) NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_code` varchar(255) DEFAULT NULL,
  `provider_response` varchar(255) DEFAULT NULL,
  `provider_transaction_id` varchar(255) DEFAULT NULL,
  `status` enum('CANCELLED','EXPIRED','FAILED','PENDING','SUCCESS') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8vo36cen604as7etdfwmyjsxt` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_payment_db.payments: ~7 rows (approximately)
REPLACE INTO `payments` (`id`, `amount`, `created_at`, `currency`, `expired_at`, `method`, `order_id`, `paid_at`, `payment_code`, `provider_response`, `provider_transaction_id`, `status`, `updated_at`) VALUES
	('3b6b8dbb-f209-446c-8b27-2e2c78b8cfc3', 90000, '2026-05-07 13:10:23.775243', 'VND', '2026-05-07 13:15:23.752900', 'VNPAY', '3c891555-f295-4e4c-9f63-9760d90a399c', '2026-05-07 13:12:47.440782', 'PAY_3fb40832-9452-4612-a263-ddff19c6cc56', 'VNPay responseCode=00', '15527525', 'SUCCESS', '2026-05-07 13:12:48.126594'),
	('6c1bdf56-4f13-406c-8011-e1d4aa7c1654', 120000, '2026-05-07 11:19:03.870172', 'VND', '2026-05-07 11:24:03.849774', 'VNPAY', 'ecf9d95b-bc68-4c37-8e6b-c3506235563c', NULL, 'PAY_2ea10c3a-81ae-4349-b812-9f85139e9bca', 'VNPay payment url generated', NULL, 'PENDING', '2026-05-07 11:19:03.870172'),
	('931e2f9e-4a74-49f9-a3b5-f9e850e9661a', 60000, '2026-05-12 14:45:30.742195', 'VND', '2026-05-12 14:50:30.722810', 'VNPAY', '39af0f23-624b-44a9-a479-49afa207ec9f', '2026-05-12 14:46:21.921235', 'PAY_7d046654-5baa-4501-a471-04b97ce8415e', 'VNPay responseCode=00', '15534834', 'SUCCESS', '2026-05-12 14:46:22.535686'),
	('bc83dfc6-9a9a-43a8-abcc-c976de43ae81', 300000, '2026-05-08 18:08:19.881646', 'VND', '2026-05-08 18:13:19.858543', 'VNPAY', '5acca4cd-e109-4208-b606-f8036405a515', '2026-05-08 18:09:15.953688', 'PAY_78786dc3-90ae-4809-848c-1809abd52c10', 'VNPay responseCode=00', '15530109', 'SUCCESS', '2026-05-08 18:09:16.972659'),
	('d19c3f52-6891-4393-8799-2b742a9a6b4f', 120000, '2026-05-07 11:21:48.008846', 'VND', '2026-05-07 11:26:48.007273', 'VNPAY', '8242b59e-7f4d-4e2d-aaa8-b302e2845dc4', '2026-05-07 11:25:05.630359', 'PAY_839159c4-42c5-456e-a648-7d74d5a2452f', 'VNPay responseCode=00', '15527337', 'SUCCESS', '2026-05-07 11:25:06.259780'),
	('d210f582-25ac-4d29-a150-9d9d196cab77', 120000, '2026-05-07 11:26:40.858147', 'VND', '2026-05-07 11:31:40.845663', 'VNPAY', '02750ea6-ed71-487a-a250-0a729dcb8c6d', '2026-05-07 11:27:05.352730', 'PAY_182ceb55-6979-4e9d-9ee6-e7d59c940eaa', 'VNPay responseCode=00', '15527359', 'SUCCESS', '2026-05-07 11:27:05.354728'),
	('dbaaf8a3-9d9a-4d22-a448-30d48de5bb7c', 90000, '2026-05-08 01:09:31.063487', 'VND', '2026-05-08 01:14:31.040820', 'VNPAY', '0237846c-eac4-4929-8f32-7aea7da44fe6', '2026-05-08 01:09:58.226408', 'PAY_8f0abf5b-2bd7-4601-8a0c-dda6d166059c', 'VNPay responseCode=00', '15528720', 'SUCCESS', '2026-05-08 01:09:59.237200');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_order_db
CREATE DATABASE IF NOT EXISTS `alpha_order_db` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `alpha_order_db`;

-- Dumping structure for table alpha_order_db.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(255) NOT NULL,
  `cinema_id` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `point_discount` double NOT NULL,
  `promotion_discount` double NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` enum('CANCELLED','CONFIRMED','EXPIRED','FAILED','PAID','PENDING_PAYMENT') DEFAULT NULL,
  `total_payment` double NOT NULL,
  `total_price` double NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `promotion_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK42bki7v5u9s62olp5is82sd74` (`promotion_id`),
  CONSTRAINT `FK42bki7v5u9s62olp5is82sd74` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_order_db.orders: ~7 rows (approximately)
REPLACE INTO `orders` (`id`, `cinema_id`, `created_at`, `customer_id`, `employee_id`, `point_discount`, `promotion_discount`, `qr_code`, `status`, `total_payment`, `total_price`, `updated_at`, `promotion_id`) VALUES
	('0237846c-eac4-4929-8f32-7aea7da44fe6', 'C03', '2026-05-08 01:09:30.759701', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'CONFIRMED', 90000, 90000, '2026-05-08 01:09:59.734561', NULL),
	('02750ea6-ed71-487a-a250-0a729dcb8c6d', 'C01', '2026-05-07 11:26:40.767679', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PAID', 120000, 120000, '2026-05-07 11:27:05.487837', NULL),
	('39af0f23-624b-44a9-a479-49afa207ec9f', 'C01', '2026-05-12 14:45:30.307840', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PAID', 60000, 60000, '2026-05-12 14:46:23.045724', NULL),
	('3c891555-f295-4e4c-9f63-9760d90a399c', 'C03', '2026-05-07 13:10:23.293637', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PAID', 90000, 90000, '2026-05-07 13:12:48.517489', NULL),
	('5acca4cd-e109-4208-b606-f8036405a515', 'C01', '2026-05-08 18:08:19.448451', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PAID', 300000, 300000, '2026-05-08 18:09:18.199903', NULL),
	('8242b59e-7f4d-4e2d-aaa8-b302e2845dc4', 'C03', '2026-05-07 11:21:47.984832', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PENDING_PAYMENT', 120000, 120000, '2026-05-07 11:21:47.984832', NULL),
	('ecf9d95b-bc68-4c37-8e6b-c3506235563c', 'C03', '2026-05-07 11:19:03.428179', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', NULL, 0, 0, '', 'PENDING_PAYMENT', 120000, 120000, '2026-05-07 11:19:03.428179', NULL);

-- Dumping structure for table alpha_order_db.order_details
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `price` double NOT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `sub_total` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjyu2qbqt8gnvno9oe9j2s2ldk` (`order_id`),
  CONSTRAINT `FKjyu2qbqt8gnvno9oe9j2s2ldk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_order_db.order_details: ~0 rows (approximately)

-- Dumping structure for table alpha_order_db.promotions
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `discount` int(11) NOT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `remaining_quantity` int(11) NOT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_order_db.promotions: ~0 rows (approximately)

-- Dumping structure for table alpha_order_db.show_schedule_details
CREATE TABLE IF NOT EXISTS `show_schedule_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `final_price` double NOT NULL,
  `seat_id` varchar(255) DEFAULT NULL,
  `show_schedule_id` varchar(255) DEFAULT NULL,
  `show_seat_type` enum('CHECKED_IN','LOCKED','SOLD') DEFAULT NULL,
  `ticket_price_id` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `movie_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9bl8bsh3025i8uuh5fvi01fcn` (`show_schedule_id`,`seat_id`),
  KEY `FK1b5gjvswjkxpg25xt6sng5pbe` (`order_id`),
  CONSTRAINT `FK1b5gjvswjkxpg25xt6sng5pbe` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table alpha_order_db.show_schedule_details: ~7 rows (approximately)
REPLACE INTO `show_schedule_details` (`id`, `created_at`, `final_price`, `seat_id`, `show_schedule_id`, `show_seat_type`, `ticket_price_id`, `updated_at`, `order_id`, `movie_id`) VALUES
	(1, '2026-05-07 11:19:03.455191', 120000, 's-R01_C03-H10', 'sched-08', 'LOCKED', 'TP39a32c02-e', '2026-05-07 11:19:03.455191', 'ecf9d95b-bc68-4c37-8e6b-c3506235563c', NULL),
	(2, '2026-05-07 11:21:47.984832', 120000, 's-R01_C03-G10', 'sched-08', 'LOCKED', 'TP39a32c02-e', '2026-05-07 11:21:47.984832', '8242b59e-7f4d-4e2d-aaa8-b302e2845dc4', NULL),
	(3, '2026-05-07 11:26:40.767679', 120000, 's-R01_C01-D10', '8eb2ddee-7681-46a3-ae98-44f5ef6b4344', 'SOLD', 'TP39a32c02-e', '2026-05-07 11:27:05.490006', '02750ea6-ed71-487a-a250-0a729dcb8c6d', NULL),
	(4, '2026-05-07 13:10:23.327597', 90000, 's-R01_C03-C3', 'sched-08', 'SOLD', 'TP3230b9f1-7', '2026-05-07 13:12:48.521130', '3c891555-f295-4e4c-9f63-9760d90a399c', NULL),
	(6, '2026-05-08 01:09:30.759701', 90000, 's-R01_C03-C9', 'sched-08', 'SOLD', 'TP3230b9f1-7', '2026-05-08 01:09:59.737573', '0237846c-eac4-4929-8f32-7aea7da44fe6', NULL),
	(7, '2026-05-08 18:08:19.461569', 180000, 's-R01_C01-J8', '8eb2ddee-7681-46a3-ae98-44f5ef6b4344', 'SOLD', 'TP016b7356-9', '2026-05-08 18:09:18.201907', '5acca4cd-e109-4208-b606-f8036405a515', NULL),
	(8, '2026-05-08 18:08:19.514417', 120000, 's-R01_C01-I10', '8eb2ddee-7681-46a3-ae98-44f5ef6b4344', 'SOLD', 'TP39a32c02-e', '2026-05-08 18:09:18.201907', '5acca4cd-e109-4208-b606-f8036405a515', NULL),
	(9, '2026-05-12 14:45:30.335623', 60000, 's-R01_C01-A10', '8eb2ddee-7681-46a3-ae98-44f5ef6b4344', 'SOLD', 'TP8ce7e80a-f', '2026-05-12 14:46:23.048361', '39af0f23-624b-44a9-a479-49afa207ec9f', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_user_db
CREATE DATABASE IF NOT EXISTS `alpha_user_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `alpha_user_db`;

-- Dumping structure for table alpha_user_db.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `loyalty_point` int(11) NOT NULL,
  `total_spending` double NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `customer_type` varchar(20) DEFAULT 'MEMBER',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FKrh1g1a20omjmn6kurd35o3eit` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.customers: ~6 rows (approximately)
REPLACE INTO `customers` (`loyalty_point`, `total_spending`, `user_id`, `customer_type`) VALUES
	(0, 0, '00fa52cd-0399-478d-9fba-fccc0f00dd46', 'MEMBER'),
	(0, 0, '3267a35a-bacc-4bf3-9162-fdd624aa4683', 'MEMBER'),
	(17, 540000, '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', 'MEMBER'),
	(0, 0, 'c20674df-eaba-4203-865c-1bfc499cd594', 'MEMBER'),
	(0, 0, 'd34c1fcc-8d75-49ea-af8e-7c5e40442692', 'MEMBER'),
	(0, 0, 'e3aaf1ce-f315-44a6-8f85-c8d8e1539b98', 'MEMBER');

-- Dumping structure for table alpha_user_db.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `user_id` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF') DEFAULT NULL,
  `cinema_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FK69x3vjuy1t5p18a5llb8h2fjx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.employees: ~2 rows (approximately)
REPLACE INTO `employees` (`user_id`, `role`, `cinema_id`) VALUES
	('1212', 'ADMIN', '11222'),
	('1213', 'STAFF', '11223');

-- Dumping structure for table alpha_user_db.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `rating` int(11) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `movie_id` varchar(255) DEFAULT NULL,
  `review_type` enum('NOT_PURCHASED','PURCHASED','VIEWED') DEFAULT NULL,
  `status` enum('APPROVED','HIDDEN','PENDING') DEFAULT NULL,
  `moderation_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4sm0k8kw740iyuex3vwwv1etu` (`customer_id`),
  CONSTRAINT `FK4sm0k8kw740iyuex3vwwv1etu` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`user_id`),
  CONSTRAINT `FKkquncb1glvrldaui8v52xfd5q` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.reviews: ~2 rows (approximately)
REPLACE INTO `reviews` (`rating`, `created_at`, `updated_at`, `comment`, `customer_id`, `id`, `movie_id`, `review_type`, `status`, `moderation_reason`) VALUES
	(7, '2026-05-15 00:58:12.680706', '2026-05-15 00:58:25.804471', 'Phim cũng ổn thôi, cũng tạm tạm, chắc không hợp gu', '3267a35a-bacc-4bf3-9162-fdd624aa4683', '3c6ea3d1-e411-4a53-a8f8-b564e93b666d', 'movie-09', 'NOT_PURCHASED', 'APPROVED', 'Nội dung đánh giá văn minh, hình ảnh liên quan đến hoạt động tại rạp chiếu phim, không vi phạm các tiêu chuẩn cộng đồng.'),
	(10, '2026-05-15 10:59:08.356965', '2026-05-15 10:59:09.526645', 'oke ngon', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', '9ddd085e-b2dc-47ec-a1a2-e7e28b08bd41', 'movie-09', 'NOT_PURCHASED', 'APPROVED', 'Nội dung đánh giá ngắn gọn, không vi phạm các tiêu chuẩn về ngôn ngữ, không spoil nội dung và không chứa quảng cáo.');

-- Dumping structure for table alpha_user_db.review_pictures
CREATE TABLE IF NOT EXISTS `review_pictures` (
  `picture_url` varchar(255) DEFAULT NULL,
  `review_id` varchar(255) NOT NULL,
  KEY `FKe6f9gdfkbeiqvxc1te658nwig` (`review_id`),
  CONSTRAINT `FKe6f9gdfkbeiqvxc1te658nwig` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.review_pictures: ~1 rows (approximately)
REPLACE INTO `review_pictures` (`picture_url`, `review_id`) VALUES
	('https://res.cloudinary.com/dcwauocnz/image/upload/v1778781493/alpha-cinema/29263e6c-482f-4574-bf8e-edfc6c59c129_4194881099911657890403576674048010956552620n-1708623986418304570597.webp', '3c6ea3d1-e411-4a53-a8f8-b564e93b666d');

-- Dumping structure for table alpha_user_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `date_of_birth` date DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.users: ~8 rows (approximately)
REPLACE INTO `users` (`date_of_birth`, `status`, `created_at`, `updated_at`, `email`, `full_name`, `id`, `password`, `phone`, `gender`) VALUES
	(NULL, b'1', '2026-04-17 14:31:30.947872', '2026-04-17 14:31:30.947872', 'tranminhtri11223344@gmail.com', 'Tri Tranminh', '00fa52cd-0399-478d-9fba-fccc0f00dd46', '$2a$10$aMTEGAsi7cSxhDnG9DBeIODqVCECIhi3jpqi/JK3rJqL.bK2RK83G', NULL, NULL),
	(NULL, b'1', NULL, NULL, 'vana@gmail.com', 'Nguyen Van A', '1212', '$2a$10$edXoiSXOpkZwm/bbGrKNveWs40SKzQUd30HMVcQYqo.XHAnvl0KRS', NULL, 'MALE'),
	(NULL, b'1', NULL, NULL, 'vanb@gmail.com', 'Nguyen Van B', '1213', '$2a$10$edXoiSXOpkZwm/bbGrKNveWs40SKzQUd30HMVcQYqo.XHAnvl0KRS', NULL, 'MALE'),
	(NULL, b'1', '2026-05-15 00:55:55.722780', '2026-05-15 00:55:55.722780', 'mailmoikk1@gmail.com', 'Nguyen Nguyen', '3267a35a-bacc-4bf3-9162-fdd624aa4683', '$2a$10$7bRBy8e3sXPalsZfJMAuC.RxQAw5AymQx9CZG8lAKrWXyMYJP8q4W', NULL, NULL),
	('2005-02-19', b'1', '2026-04-09 23:00:15.915884', '2026-05-12 14:46:23.139491', 'hthanhtuan.2307@gmail.com', 'Tran Minh Tri', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', '$2a$10$Vog3SPuJXNxK7k5qNh/RsuX.6YXaspWspIQuAkv9o55iQXwcRhfjq', '0367155132', 'MALE'),
	(NULL, b'1', '2026-04-17 14:26:17.998076', '2026-04-17 14:26:17.998076', 'giautenbantri30@gmail.com', 'Minh Tri', 'c20674df-eaba-4203-865c-1bfc499cd594', '$2a$10$.ob6bW44IIcIv08PEpWZ0uDp3p1FMSAJKGz7.iXnslHZry.ClH2Xm', NULL, NULL),
	(NULL, b'1', '2026-04-09 00:03:46.233097', '2026-04-09 00:03:46.233097', 'minhtri112@gmail.com', 'datvan', 'd34c1fcc-8d75-49ea-af8e-7c5e40442692', '$2a$10$Rz71JJ7IB6y9rpT8a6PxYecQL32W3wOx9AuSImlwHP7YmfSiFYeXy', NULL, 'MALE'),
	(NULL, b'1', '2026-04-15 20:16:56.664686', '2026-04-15 20:16:56.664686', 'tranminhtri29004@gmail.com', 'Trần Minh Trí', 'e3aaf1ce-f315-44a6-8f85-c8d8e1539b98', '$2a$10$mRk/HZaN.5s70BWW661Q1O0netxvnVpkONvhrBABzTcsTpc4TBAVm', NULL, 'MALE');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_user_db
CREATE DATABASE IF NOT EXISTS `alpha_user_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `alpha_user_db`;

-- Dumping structure for table alpha_user_db.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `loyalty_point` int(11) NOT NULL,
  `total_spending` double NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `customer_type` varchar(20) DEFAULT 'MEMBER',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FKrh1g1a20omjmn6kurd35o3eit` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.customers: ~6 rows (approximately)
REPLACE INTO `customers` (`loyalty_point`, `total_spending`, `user_id`, `customer_type`) VALUES
	(0, 0, '00fa52cd-0399-478d-9fba-fccc0f00dd46', 'MEMBER'),
	(0, 0, '3267a35a-bacc-4bf3-9162-fdd624aa4683', 'MEMBER'),
	(17, 540000, '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', 'MEMBER'),
	(0, 0, 'c20674df-eaba-4203-865c-1bfc499cd594', 'MEMBER'),
	(0, 0, 'd34c1fcc-8d75-49ea-af8e-7c5e40442692', 'MEMBER'),
	(0, 0, 'e3aaf1ce-f315-44a6-8f85-c8d8e1539b98', 'MEMBER');

-- Dumping structure for table alpha_user_db.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `user_id` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF') DEFAULT NULL,
  `cinema_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FK69x3vjuy1t5p18a5llb8h2fjx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.employees: ~2 rows (approximately)
REPLACE INTO `employees` (`user_id`, `role`, `cinema_id`) VALUES
	('1212', 'ADMIN', '11222'),
	('1213', 'STAFF', '11223');

-- Dumping structure for table alpha_user_db.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `rating` int(11) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `movie_id` varchar(255) DEFAULT NULL,
  `review_type` enum('NOT_PURCHASED','PURCHASED','VIEWED') DEFAULT NULL,
  `status` enum('APPROVED','HIDDEN','PENDING') DEFAULT NULL,
  `moderation_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4sm0k8kw740iyuex3vwwv1etu` (`customer_id`),
  CONSTRAINT `FK4sm0k8kw740iyuex3vwwv1etu` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`user_id`),
  CONSTRAINT `FKkquncb1glvrldaui8v52xfd5q` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.reviews: ~2 rows (approximately)
REPLACE INTO `reviews` (`rating`, `created_at`, `updated_at`, `comment`, `customer_id`, `id`, `movie_id`, `review_type`, `status`, `moderation_reason`) VALUES
	(7, '2026-05-15 00:58:12.680706', '2026-05-15 00:58:25.804471', 'Phim cũng ổn thôi, cũng tạm tạm, chắc không hợp gu', '3267a35a-bacc-4bf3-9162-fdd624aa4683', '3c6ea3d1-e411-4a53-a8f8-b564e93b666d', 'movie-09', 'NOT_PURCHASED', 'APPROVED', 'Nội dung đánh giá văn minh, hình ảnh liên quan đến hoạt động tại rạp chiếu phim, không vi phạm các tiêu chuẩn cộng đồng.'),
	(10, '2026-05-15 10:59:08.356965', '2026-05-15 10:59:09.526645', 'oke ngon', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', '9ddd085e-b2dc-47ec-a1a2-e7e28b08bd41', 'movie-09', 'NOT_PURCHASED', 'APPROVED', 'Nội dung đánh giá ngắn gọn, không vi phạm các tiêu chuẩn về ngôn ngữ, không spoil nội dung và không chứa quảng cáo.');

-- Dumping structure for table alpha_user_db.review_pictures
CREATE TABLE IF NOT EXISTS `review_pictures` (
  `picture_url` varchar(255) DEFAULT NULL,
  `review_id` varchar(255) NOT NULL,
  KEY `FKe6f9gdfkbeiqvxc1te658nwig` (`review_id`),
  CONSTRAINT `FKe6f9gdfkbeiqvxc1te658nwig` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.review_pictures: ~1 rows (approximately)
REPLACE INTO `review_pictures` (`picture_url`, `review_id`) VALUES
	('https://res.cloudinary.com/dcwauocnz/image/upload/v1778781493/alpha-cinema/29263e6c-482f-4574-bf8e-edfc6c59c129_4194881099911657890403576674048010956552620n-1708623986418304570597.webp', '3c6ea3d1-e411-4a53-a8f8-b564e93b666d');

-- Dumping structure for table alpha_user_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `date_of_birth` date DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `id` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_user_db.users: ~8 rows (approximately)
REPLACE INTO `users` (`date_of_birth`, `status`, `created_at`, `updated_at`, `email`, `full_name`, `id`, `password`, `phone`, `gender`) VALUES
	(NULL, b'1', '2026-04-17 14:31:30.947872', '2026-04-17 14:31:30.947872', 'tranminhtri11223344@gmail.com', 'Tri Tranminh', '00fa52cd-0399-478d-9fba-fccc0f00dd46', '$2a$10$aMTEGAsi7cSxhDnG9DBeIODqVCECIhi3jpqi/JK3rJqL.bK2RK83G', NULL, NULL),
	(NULL, b'1', NULL, NULL, 'vana@gmail.com', 'Nguyen Van A', '1212', '$2a$10$edXoiSXOpkZwm/bbGrKNveWs40SKzQUd30HMVcQYqo.XHAnvl0KRS', NULL, 'MALE'),
	(NULL, b'1', NULL, NULL, 'vanb@gmail.com', 'Nguyen Van B', '1213', '$2a$10$edXoiSXOpkZwm/bbGrKNveWs40SKzQUd30HMVcQYqo.XHAnvl0KRS', NULL, 'MALE'),
	(NULL, b'1', '2026-05-15 00:55:55.722780', '2026-05-15 00:55:55.722780', 'mailmoikk1@gmail.com', 'Nguyen Nguyen', '3267a35a-bacc-4bf3-9162-fdd624aa4683', '$2a$10$7bRBy8e3sXPalsZfJMAuC.RxQAw5AymQx9CZG8lAKrWXyMYJP8q4W', NULL, NULL),
	('2005-02-19', b'1', '2026-04-09 23:00:15.915884', '2026-05-12 14:46:23.139491', 'hthanhtuan.2307@gmail.com', 'Tran Minh Tri', '49f2fea0-f87a-43b3-aec3-fb8f39b5845a', '$2a$10$Vog3SPuJXNxK7k5qNh/RsuX.6YXaspWspIQuAkv9o55iQXwcRhfjq', '0367155132', 'MALE'),
	(NULL, b'1', '2026-04-17 14:26:17.998076', '2026-04-17 14:26:17.998076', 'giautenbantri30@gmail.com', 'Minh Tri', 'c20674df-eaba-4203-865c-1bfc499cd594', '$2a$10$.ob6bW44IIcIv08PEpWZ0uDp3p1FMSAJKGz7.iXnslHZry.ClH2Xm', NULL, NULL),
	(NULL, b'1', '2026-04-09 00:03:46.233097', '2026-04-09 00:03:46.233097', 'minhtri112@gmail.com', 'datvan', 'd34c1fcc-8d75-49ea-af8e-7c5e40442692', '$2a$10$Rz71JJ7IB6y9rpT8a6PxYecQL32W3wOx9AuSImlwHP7YmfSiFYeXy', NULL, 'MALE'),
	(NULL, b'1', '2026-04-15 20:16:56.664686', '2026-04-15 20:16:56.664686', 'tranminhtri29004@gmail.com', 'Trần Minh Trí', 'e3aaf1ce-f315-44a6-8f85-c8d8e1539b98', '$2a$10$mRk/HZaN.5s70BWW661Q1O0netxvnVpkONvhrBABzTcsTpc4TBAVm', NULL, 'MALE');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;


-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_product_db
CREATE DATABASE IF NOT EXISTS `alpha_product_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `alpha_product_db`;

-- Dumping structure for table alpha_product_db.age_types
CREATE TABLE IF NOT EXISTS `age_types` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.age_types: ~4 rows (approximately)
REPLACE INTO `age_types` (`id`, `created_at`, `description`, `name`, `updated_at`) VALUES
	('age-type-p', '2026-04-09 22:15:07.000000', 'Phim được phép phổ biến đến mọi độ tuổi', 'P', '2026-04-09 22:15:07.000000'),
	('age-type-t13', '2026-04-09 22:15:07.000000', 'Phim cấm khán giả dưới 13 tuổi', 'T13', '2026-04-09 22:15:07.000000'),
	('age-type-t16', '2026-04-09 22:15:07.000000', 'Phim cấm khán giả dưới 16 tuổi', 'T16', '2026-04-09 22:15:07.000000'),
	('age-type-t18', '2026-04-09 22:15:07.000000', 'Phim cấm khán giả dưới 18 tuổi', 'T18', '2026-04-09 22:15:07.000000');

-- Dumping structure for table alpha_product_db.artists
CREATE TABLE IF NOT EXISTS `artists` (
  `id` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `type` enum('ACTOR','DIRECTOR') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.artists: ~13 rows (approximately)
REPLACE INTO `artists` (`id`, `avatar_url`, `bio`, `created_at`, `date_of_birth`, `full_name`, `nationality`, `type`, `updated_at`) VALUES
	('30860f82-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949994/tom_hanks_zehdnb.jpg', 'Nam diễn viên kỳ cựu của Hollywood, nổi tiếng với Forrest Gump và Cast Away.', '2026-03-21 11:48:22.000000', '1956-07-09', 'Tom Hanks', 'USA', 'ACTOR', '2026-04-23 23:04:50.490670'),
	('3086803f-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949996/leo_dicaprio_datn1w.webp', 'Chủ nhân giải Oscar, nổi tiếng với Titanic, Inception và The Revenant.', '2026-03-21 11:48:22.000000', '1974-11-11', 'Leonardo DiCaprio', 'USA', 'ACTOR', NULL),
	('30869dba-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949996/scarlett_j_b4djya.jpg', 'Nữ diễn viên đóng vai Black Widow trong vũ trụ điện ảnh Marvel.', '2026-03-21 11:48:22.000000', '1984-11-22', 'Scarlett Johansson', 'USA', 'ACTOR', NULL),
	('30869f20-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949997/margot_robbie_csylnp.jpg', 'Nữ diễn viên người Úc, nổi tiếng với vai Harley Quinn và phim Barbie.', '2026-03-21 11:48:22.000000', '1990-07-02', 'Margot Robbie', 'Australia', 'ACTOR', NULL),
	('30869f76-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949995/cillian_m_tuvs6d.jpg', 'Nam diễn viên chính trong Oppenheimer và series Peaky Blinders.', '2026-03-21 11:48:22.000000', '1976-05-25', 'Cillian Murphy', 'Ireland', 'ACTOR', NULL),
	('30869fd7-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949994/song_kh_nwdyd6.jpg', 'Nam diễn viên gạo cội Hàn Quốc, ngôi sao của phim Parasite.', '2026-03-21 11:48:22.000000', '1967-01-17', 'Song Kang-ho', 'South Korea', 'ACTOR', NULL),
	('3086a052-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949995/gal_gadot_m5uxfs.jpg', 'Nữ diễn viên người Israel, được biết đến với vai Wonder Woman.', '2026-03-21 11:48:22.000000', '1985-04-30', 'Gal Gadot', 'Israel', 'ACTOR', NULL),
	('3086a1cd-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949996/lan_ngoc_qysyzu.jpg', 'Nữ diễn viên hàng đầu Việt Nam, được mệnh danh là Ngọc nữ màn ảnh.', '2026-03-21 11:48:22.000000', '1990-04-04', 'Ninh Dương Lan Ngọc', 'Vietnam', 'ACTOR', NULL),
	('3086a22b-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949994/tran_thanh_p002ux.jpg', 'Diễn viên, đạo diễn và MC nổi tiếng nhất Việt Nam với các dự án Bố Già, Mai.', '2026-03-21 11:48:22.000000', '1987-02-05', 'Trấn Thành', 'Vietnam', 'ACTOR', NULL),
	('3086a277-24e1-11f1-a03f-5b94d571b330', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949997/ngo_thanh_van_o76arq.jpg', 'Được biết đến với biệt danh "Đả nữ", vừa là diễn viên vừa là đạo diễn.', '2026-03-21 11:48:22.000000', '1979-02-26', 'Ngô Thanh Vân', 'Vietnam', 'ACTOR', NULL),
	('504ff48f-5fb6-4050-b5eb-da88e2f561ae', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776960518/alpha-cinema/8bf41352-2b6b-4dca-baca-e114dbb9aa12_Dwayne-TheRock.jpg', 'Dwayne Douglas Johnson, còn được biết đến với nghệ danh "The Rock", là một diễn viên và đô vật chuyên nghiệp người Mỹ. Anh hiện đang ký hợp đồng với WWE, nơi anh thi đấu bán thời gian.', '2026-04-23 23:08:39.419078', '1972-05-02', 'Dwayne Johnson', 'Vương Quốc Anh', 'ACTOR', '2026-04-23 23:08:39.419078'),
	('b5d679ba-32ea-49c7-84f5-a3f1b07f4ab0', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949994/tran_thanh_p002ux.jpg', 'Mình à sao đôi ta, lại chẳng xuất phát á aaaaaaaaaaaaaaa', '2026-04-09 16:26:36.934208', '2026-04-09', 'Trấn Thành', 'Việt Nam', 'DIRECTOR', '2026-04-09 16:26:36.934208'),
	('f1549c88-93c6-4726-90f4-04e82957aa6b', 'https://res.cloudinary.com/dcwauocnz/image/upload/v1776949994/tran_thanh_p002ux.jpg', 'Mình à sao đôi ta, lại chẳng xuất phát á aaaaaaaaaaaaaaa', '2026-04-10 20:51:44.940239', '2026-04-09', 'Trấn Thành', 'Việt Nam', 'DIRECTOR', '2026-04-10 20:51:44.941247');

-- Dumping structure for table alpha_product_db.movies
CREATE TABLE IF NOT EXISTS `movies` (
  `id` varchar(255) NOT NULL,
  `avg_rating` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `premiere_date` date DEFAULT NULL,
  `producer` varchar(255) DEFAULT NULL,
  `release_status` enum('ENDED','NOW_SHOWING','UPCOMING') DEFAULT NULL,
  `release_year` int(11) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `age_type_id` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `total_reviews` bigint(20) DEFAULT NULL,
  `total_sum_rating` double DEFAULT NULL,
  `last_event_timestamp` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKm9i920mu4d7409u24dtpa9qdj` (`age_type_id`),
  CONSTRAINT `FKm9i920mu4d7409u24dtpa9qdj` FOREIGN KEY (`age_type_id`) REFERENCES `age_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movies: ~16 rows (approximately)
REPLACE INTO `movies` (`id`, `avg_rating`, `created_at`, `description`, `duration`, `nationality`, `premiere_date`, `producer`, `release_status`, `release_year`, `thumbnail_url`, `title`, `trailer_url`, `updated_at`, `age_type_id`, `banner_url`, `total_reviews`, `total_sum_rating`, `last_event_timestamp`) VALUES
	('69944148-c7cd-443f-90b5-3f004550357a', 0, '2026-04-23 12:06:58.335680', 'Sau cú búng tay tàn khốc của Thanos, vũ trụ chìm trong đống đổ nát. Các Avengers còn sống sót phải tập hợp lại một lần cuối để đảo ngược thảm kịch và khôi phục trật tự cho vũ trụ.', 181, 'USA', '2019-04-26', 'Marvel Studios', 'UPCOMING', 2019, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776955271/alpha-cinema/9a535ab4-acb5-45c3-a30b-d6968a231ffa_avengers_endgame.jpg', 'Avengers: Endgame', 'https://www.youtube.com/watch?v=TcMBFSGVi1c', '2026-04-30 00:31:16.600166', 'age-type-t13', NULL, NULL, NULL, NULL),
	('915e3061-57ba-4388-9396-d52b44be98bb', 0, '2026-04-26 12:34:00.357532', 'Phim “Thỏ ơi!!” dự kiến công chiếu trong dịp Tết 2026, thuộc thể loại hài, tâm lý sở trường của Trấn Thành, mang màu sắc trẻ trung với dàn diễn viên mới, tiếp nối tinh thần đem đến cho khán giả những điều vui vẻ, hài hước vào dịp Tết Nguyên đán.', 127, '', '2026-02-17', 'Trấn Thành Town', 'UPCOMING', 2026, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1777181641/alpha-cinema/ae9ca0da-005c-49a0-a680-faace7f97534_tho-oi.jpg', 'Thỏ Ơi!!!!', '', '2026-04-26 12:34:00.357532', 'age-type-t18', NULL, NULL, NULL, NULL),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', 0, '2026-04-30 00:30:35.271441', '', 0, '', NULL, '', 'UPCOMING', 2026, 'https://res.cloudinary.com/dcwauocnz/image/upload/v1777483838/alpha-cinema/ddfc8c73-6a6b-4586-b186-a6d1a29aed1d_tho-oi.jpg', 'Mai', '', '2026-04-30 00:31:55.654959', 'age-type-t16', NULL, NULL, NULL, NULL),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', 0, '2026-04-23 22:08:07.574742', 'Bộ tứ báo thủ là một bộ phim điện ảnh Việt Nam ra mắt năm 2025 thuộc thể loại hài – lãng mạn – chính kịch do Trấn Thành làm đạo diễn kiêm biên kịch và đồng sản xuất, đánh dấu đây là bộ phim điện ảnh thứ tư anh làm đạo diễn, sau Bố già, Nhà bà Nữ và Mai.', 133, 'Việt Nam', '2025-01-29', '', 'UPCOMING', 2025, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776956886/alpha-cinema/4f73dfaa-e97e-47b1-8d9e-ec1fcba95865_bo_tu_bao_thu.jpg', 'Bộ Tứ Báo Thủ ', 'https://youtu.be/zKMOgOWn8lQ', '2026-04-23 22:08:07.574742', 'age-type-t16', NULL, NULL, NULL, NULL),
	('movie-01', 8.8, '2026-04-09 22:18:45.000000', 'Cuộc đời của một người đàn ông có IQ 75 nhưng lại trải qua những sự kiện lịch sử vĩ đại nhất nước Mỹ.', 142, 'USA', '1994-07-06', 'Paramount Pictures', 'NOW_SHOWING', 1994, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776955158/forrest_gump_hqijan.jpg', 'Forrest Gump', 'https://youtube.com/watch?v=bLvqoHBptjg', '2026-04-30 02:44:51.986507', 'age-type-p', NULL, NULL, NULL, NULL),
	('movie-02', 8.8, '2026-04-09 22:18:45.000000', 'Một kẻ cắp chuyên nghiệp thực hiện nhiệm vụ cấy ghép ý tưởng vào giấc mơ của mục tiêu.', 148, 'USA', '2010-07-16', 'Warner Bros', 'NOW_SHOWING', 2010, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/inceptionjfif_q63nbm.jpg', 'Inception', 'https://youtube.com/watch?v=8hP9D6kZseM', '2026-04-09 22:18:45.000000', 'age-type-t13', NULL, NULL, NULL, NULL),
	('movie-03', 6.7, '2026-04-09 22:18:45.000000', 'Quá khứ đen tối của Natasha Romanoff trước khi cô gia nhập Avengers.', 134, 'USA', '2021-07-09', 'Marvel Studios', 'NOW_SHOWING', 2021, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/black_widow_kyoovy.jpg', 'Black Widow', 'https://youtube.com/watch?v=Fp9pNPdNwjI', '2026-04-09 22:18:45.000000', 'age-type-t13', NULL, NULL, NULL, NULL),
	('movie-04', 7, '2026-04-09 22:18:45.000000', 'Búp bê Barbie bị trục xuất khỏi Barbieland vì không đủ hoàn hảo, cô quyết định phiêu lưu đến thế giới thực.', 114, 'USA', '2023-07-21', 'Warner Bros', 'NOW_SHOWING', 2023, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/barbie_yynz8h.jpg', 'Barbie', 'https://youtube.com/watch?v=pBk4NYhWNMM', '2026-04-26 14:17:14.268379', 'age-type-p', NULL, NULL, NULL, NULL),
	('movie-05', 8.4, '2026-04-09 22:18:45.000000', 'Câu chuyện về J. Robert Oppenheimer và dự án Manhattan chế tạo bom nguyên tử.', 180, 'USA', '2023-07-21', 'Universal Pictures', 'NOW_SHOWING', 2023, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/Oppenheimer_gulogd.jpg', 'Oppenheimer', 'https://youtube.com/watch?v=uYPbbksJxIg', '2026-04-09 22:18:45.000000', 'age-type-t16', NULL, NULL, NULL, NULL),
	('movie-06', 0, '2026-04-09 22:18:45.000000', 'Bi kịch nảy sinh khi một gia đình nghèo tìm cách lọt vào làm thuê cho một gia đình thượng lưu.', 132, 'South Korea', '2019-05-30', 'CJ Entertainment', 'NOW_SHOWING', 2019, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954237/parasite_cdqhug.jpg', 'Parasite (Ký Sinh Trùng)', 'https://youtube.com/watch?v=5xV14r1w1n0', '2026-04-09 22:18:45.000000', 'age-type-t18', NULL, NULL, NULL, NULL),
	('movie-07', 7.4, '2026-04-09 22:18:45.000000', 'Công chúa chiến binh Diana rời hòn đảo quê hương để chấm dứt cuộc Thế chiến thứ nhất.', 141, 'USA', '2017-06-02', 'DC Films', 'NOW_SHOWING', 2017, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/Wonder_Woman_zozou6.jpg', 'Wonder Woman', 'https://youtube.com/watch?v=1Q8fG0TtVAY', '2026-04-09 22:18:45.000000', 'age-type-t13', NULL, NULL, NULL, NULL),
	('movie-08', 6.8, '2026-04-09 22:18:45.000000', 'Chuyện tình dang dở của Trọng Thoại và Nhã Linh, cùng sự xuất hiện của tình cũ Quý Khánh.', 100, 'Vietnam', '2019-02-05', 'Galaxy Studio', 'NOW_SHOWING', 2019, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954237/Cua_lai_vo_bau_rnlutj.jpg', 'Cua Lại Vợ Bầu', 'https://youtube.com/watch?v=123456789', '2026-04-26 13:25:24.241585', 'age-type-t16', NULL, NULL, NULL, NULL),
	('movie-09', 8.5, '2026-04-09 22:18:45.000000', 'Cuộc đời nhiều biến cố của Mai, một phụ nữ làm nghề mát-xa và mối tình với chàng nhạc sĩ kém tuổi.', 131, 'Vietnam', '2024-02-10', 'Trấn Thành Town', 'NOW_SHOWING', 2024, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954238/mai_ljq3qw.jpg', 'Mai', 'https://youtu.be/EX6clvId19s?si=IG76tjWut7F5U93-', '2026-05-14 12:30:48.680770', 'age-type-t18', 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1777280578/mai_banner_dacebq.jpg', 2, 17, 1778817549531),
	('movie-10', 7.1, '2026-04-09 22:18:45.000000', 'Hành trình nghẹt thở của Hai Phượng đi tìm lại đứa con gái bị bắt cóc.', 98, 'Vietnam', '2019-02-22', 'Studio68', 'NOW_SHOWING', 2019, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954237/Hai_Phuong_bxedul.jpg', 'Hai Phượng', 'https://youtube.com/watch?v=123456789', '2026-04-09 22:18:45.000000', 'age-type-t18', NULL, 0, NULL, NULL),
	('movie-11', 8.8, '2026-04-09 22:18:45.000000', 'Paul Atreides liên minh với người Fremen để trả thù những kẻ đã hủy hoại gia đình anh.', 166, 'USA', '2024-03-01', 'Warner Bros', 'UPCOMING', 2024, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954236/dune2_lt4bkd.jpg', 'Dune: Hành Tinh Cát - Phần 2', 'https://youtube.com/watch?v=Way9Dexny3w', '2026-04-09 22:18:45.000000', 'age-type-t13', NULL, NULL, NULL, NULL),
	('movie-12', 0, '2026-04-09 22:18:45.000000', 'Phần tiếp theo trong series phim ăn khách nhất điện ảnh Việt Nam của đạo diễn Lý Hải.', 120, 'Vietnam', '2026-04-26', 'Ly Hai Production', 'UPCOMING', 2026, 'https://res.cloudinary.com/dzcwbvlk4/image/upload/v1776954237/lat-mat-7_f6sixe.jpg', 'Lật Mặt 7: Một Điều Ước', 'https://youtube.com/watch?v=123456789', '2026-04-09 22:18:45.000000', 'age-type-p', NULL, NULL, NULL, NULL);

-- Dumping structure for table alpha_product_db.movie_actors
CREATE TABLE IF NOT EXISTS `movie_actors` (
  `movie_id` varchar(255) NOT NULL,
  `artist_id` varchar(255) NOT NULL,
  KEY `FK2a27v2kuvkwv544so8n0edi7r` (`artist_id`),
  KEY `FKs4rlt03tdf55rwso4uyrwm0oq` (`movie_id`),
  CONSTRAINT `FK2a27v2kuvkwv544so8n0edi7r` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  CONSTRAINT `FKs4rlt03tdf55rwso4uyrwm0oq` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movie_actors: ~17 rows (approximately)
REPLACE INTO `movie_actors` (`movie_id`, `artist_id`) VALUES
	('movie-02', '3086803f-24e1-11f1-a03f-5b94d571b330'),
	('movie-03', '30869dba-24e1-11f1-a03f-5b94d571b330'),
	('movie-05', '30869f76-24e1-11f1-a03f-5b94d571b330'),
	('movie-06', '30869fd7-24e1-11f1-a03f-5b94d571b330'),
	('movie-07', '3086a052-24e1-11f1-a03f-5b94d571b330'),
	('movie-10', '3086a277-24e1-11f1-a03f-5b94d571b330'),
	('movie-09', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', '3086a277-24e1-11f1-a03f-5b94d571b330'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('915e3061-57ba-4388-9396-d52b44be98bb', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('movie-08', '3086a1cd-24e1-11f1-a03f-5b94d571b330'),
	('movie-08', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('movie-04', '30869f20-24e1-11f1-a03f-5b94d571b330'),
	('69944148-c7cd-443f-90b5-3f004550357a', '30869dba-24e1-11f1-a03f-5b94d571b330'),
	('69944148-c7cd-443f-90b5-3f004550357a', '30860f82-24e1-11f1-a03f-5b94d571b330'),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', '3086a277-24e1-11f1-a03f-5b94d571b330'),
	('movie-01', '30860f82-24e1-11f1-a03f-5b94d571b330');

-- Dumping structure for table alpha_product_db.movie_directors
CREATE TABLE IF NOT EXISTS `movie_directors` (
  `movie_id` varchar(255) NOT NULL,
  `artist_id` varchar(255) NOT NULL,
  KEY `FKjiv5pkv8wcxlj1w6er63864` (`artist_id`),
  KEY `FK90u08nnfro53e8vy5bgkkf77o` (`movie_id`),
  CONSTRAINT `FK90u08nnfro53e8vy5bgkkf77o` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `FKjiv5pkv8wcxlj1w6er63864` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movie_directors: ~7 rows (approximately)
REPLACE INTO `movie_directors` (`movie_id`, `artist_id`) VALUES
	('movie-10', '3086a277-24e1-11f1-a03f-5b94d571b330'),
	('movie-09', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', '30860f82-24e1-11f1-a03f-5b94d571b330'),
	('915e3061-57ba-4388-9396-d52b44be98bb', '3086a22b-24e1-11f1-a03f-5b94d571b330'),
	('69944148-c7cd-443f-90b5-3f004550357a', '3086803f-24e1-11f1-a03f-5b94d571b330'),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', '3086803f-24e1-11f1-a03f-5b94d571b330');

-- Dumping structure for table alpha_product_db.movie_genres
CREATE TABLE IF NOT EXISTS `movie_genres` (
  `movie_id` varchar(255) NOT NULL,
  `genre` varchar(255) DEFAULT NULL,
  KEY `FK4ak9svw913jblkfgru84h2phd` (`movie_id`),
  CONSTRAINT `FK4ak9svw913jblkfgru84h2phd` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movie_genres: ~30 rows (approximately)
REPLACE INTO `movie_genres` (`movie_id`, `genre`) VALUES
	('movie-01', 'Drama'),
	('movie-01', 'Romance'),
	('movie-02', 'Action'),
	('movie-02', 'Sci-Fi'),
	('movie-02', 'Thriller'),
	('movie-03', 'Action'),
	('movie-03', 'Adventure'),
	('movie-04', 'Comedy'),
	('movie-04', 'Fantasy'),
	('movie-05', 'Biography'),
	('movie-05', 'Drama'),
	('movie-05', 'History'),
	('movie-06', 'Drama'),
	('movie-06', 'Thriller'),
	('movie-07', 'Action'),
	('movie-07', 'Fantasy'),
	('movie-08', 'Comedy'),
	('movie-08', 'Romance'),
	('movie-09', 'Drama'),
	('movie-09', 'Romance'),
	('movie-10', 'Action'),
	('movie-10', 'Crime'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'Hành động'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'Viễn tưởng'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'Phiêu lưu'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', 'Tình cảm'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', 'Hài hước'),
	('915e3061-57ba-4388-9396-d52b44be98bb', 'Tình cảm'),
	('915e3061-57ba-4388-9396-d52b44be98bb', 'Hài hước'),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', 'Tình cảm');

-- Dumping structure for table alpha_product_db.movie_projections
CREATE TABLE IF NOT EXISTS `movie_projections` (
  `movie_id` varchar(255) NOT NULL,
  `projection_type` enum('IMAX','_2D','_3D') DEFAULT NULL,
  KEY `FKl5ihfk5cdg9xd2alww3m7s49u` (`movie_id`),
  CONSTRAINT `FKl5ihfk5cdg9xd2alww3m7s49u` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movie_projections: ~20 rows (approximately)
REPLACE INTO `movie_projections` (`movie_id`, `projection_type`) VALUES
	('movie-02', '_2D'),
	('movie-02', 'IMAX'),
	('movie-03', '_2D'),
	('movie-03', '_3D'),
	('movie-03', 'IMAX'),
	('movie-05', '_2D'),
	('movie-05', 'IMAX'),
	('movie-09', '_2D'),
	('movie-11', '_2D'),
	('movie-11', 'IMAX'),
	('69944148-c7cd-443f-90b5-3f004550357a', '_2D'),
	('69944148-c7cd-443f-90b5-3f004550357a', '_3D'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'IMAX'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', '_2D'),
	('915e3061-57ba-4388-9396-d52b44be98bb', '_2D'),
	('movie-08', '_2D'),
	('movie-04', '_3D'),
	('movie-04', '_2D'),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', '_2D'),
	('movie-01', '_2D');

-- Dumping structure for table alpha_product_db.movie_translations
CREATE TABLE IF NOT EXISTS `movie_translations` (
  `movie_id` varchar(255) NOT NULL,
  `translation_type` enum('DUBBING','SUBTITLES','VOICE_OVER') DEFAULT NULL,
  KEY `FKigt0aw0qkhq6pydnu8i8chaie` (`movie_id`),
  CONSTRAINT `FKigt0aw0qkhq6pydnu8i8chaie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.movie_translations: ~16 rows (approximately)
REPLACE INTO `movie_translations` (`movie_id`, `translation_type`) VALUES
	('movie-02', 'SUBTITLES'),
	('movie-02', 'DUBBING'),
	('movie-03', 'SUBTITLES'),
	('movie-03', 'DUBBING'),
	('movie-05', 'SUBTITLES'),
	('movie-09', 'SUBTITLES'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'DUBBING'),
	('69944148-c7cd-443f-90b5-3f004550357a', 'SUBTITLES'),
	('c1e5d70b-0316-4c93-948d-97185fddae6e', 'SUBTITLES'),
	('915e3061-57ba-4388-9396-d52b44be98bb', 'SUBTITLES'),
	('movie-08', 'VOICE_OVER'),
	('movie-08', 'SUBTITLES'),
	('movie-04', 'VOICE_OVER'),
	('bcebcb57-bdaa-4937-bc4b-c258474f98a7', 'DUBBING'),
	('movie-01', 'SUBTITLES'),
	('movie-01', 'DUBBING');

-- Dumping structure for table alpha_product_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `picture_url` varchar(255) DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `type` enum('COMBO','SINGLE') DEFAULT NULL,
  `unit_price` double NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.products: ~0 rows (approximately)

-- Dumping structure for table alpha_product_db.show_schedules
CREATE TABLE IF NOT EXISTS `show_schedules` (
  `id` varchar(255) NOT NULL,
  `available_seat` int(11) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `projection_type` enum('IMAX','_2D','_3D') DEFAULT NULL,
  `room_id` varchar(255) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `translation_type` enum('DUBBING','SUBTITLES','VOICE_OVER') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `movie_id` varchar(255) DEFAULT NULL,
  `cinema_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9j88xul6xybkl7pkqg66dw234` (`movie_id`),
  CONSTRAINT `FK9j88xul6xybkl7pkqg66dw234` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_product_db.show_schedules: ~22 rows (approximately)
REPLACE INTO `show_schedules` (`id`, `available_seat`, `created_at`, `end_time`, `projection_type`, `room_id`, `start_time`, `status`, `translation_type`, `updated_at`, `movie_id`, `cinema_id`) VALUES
	('0f18341f-9942-4504-a611-4542b1c9e6e0', 50, '2026-04-26 12:57:58.598008', '2026-04-30 14:22:00.000000', '_2D', 'R01_C01', '2026-04-30 12:00:00.000000', b'1', 'SUBTITLES', '2026-04-26 12:57:58.598552', '915e3061-57ba-4388-9396-d52b44be98bb', 'C01'),
	('46f69844-e145-43ae-8122-36a8549eb156', 50, '2026-04-25 00:46:14.494621', '2026-06-28 03:11:00.000000', NULL, 'R02_C02', '2026-06-28 00:45:00.000000', b'1', NULL, '2026-04-25 00:46:14.494621', 'movie-09', NULL),
	('51994dc9-17ee-4176-b51f-3a30205bde85', 50, '2026-04-25 11:57:20.121965', '2026-04-27 02:36:00.000000', NULL, 'R01_C01', '2026-04-27 00:00:00.000000', b'1', NULL, '2026-04-25 11:57:20.121965', 'movie-07', NULL),
	('60bcb4f0-002f-487a-89a8-7e9a85b5d334', 50, '2026-04-28 00:05:17.970537', '2026-04-28 14:26:00.000000', '_2D', 'R01_C01', '2026-04-28 12:00:00.000000', b'1', 'SUBTITLES', '2026-04-28 00:05:17.970537', 'movie-09', 'C01'),
	('62088a0d-ced5-4b41-98bd-6adbf913ad21', 50, '2026-04-28 09:52:47.513833', '2026-04-30 19:56:00.000000', '_2D', 'R01_C02', '2026-04-30 17:30:00.000000', b'1', 'SUBTITLES', '2026-04-28 09:52:47.513833', 'movie-09', 'C02'),
	('71461a70-5949-4f8d-8533-5312ea188e2a', 50, '2026-04-25 00:44:46.662809', '2026-04-26 09:01:00.000000', NULL, 'R01_C01', '2026-04-26 06:35:00.000000', b'1', NULL, '2026-04-25 00:44:46.662809', 'movie-09', NULL),
	('8cc3a4f9-d1f7-4605-9e56-2a2efdb9e719', 50, '2026-04-28 09:51:43.394530', '2026-05-01 00:41:00.000000', '_2D', 'R01_C02', '2026-04-30 22:15:00.000000', b'1', 'SUBTITLES', '2026-04-28 09:51:43.394530', 'movie-09', 'C02'),
	('8eb2ddee-7681-46a3-ae98-44f5ef6b4344', 50, '2026-04-28 09:53:56.794478', '2026-05-20 03:41:00.000000', '_2D', 'R01_C01', '2026-05-20 02:15:00.000000', b'1', 'SUBTITLES', '2026-04-28 09:53:56.794478', 'movie-09', 'C01'),
	('sched-01', 50, '2026-04-24 17:25:12.000000', '2026-04-25 10:37:00.000000', '_2D', 'R01_C01', '2026-04-25 08:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-01', 'C01'),
	('sched-02', 50, '2026-04-24 17:25:12.000000', '2026-04-25 13:09:00.000000', '_2D', 'R01_C01', '2026-04-25 11:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-04', 'C01'),
	('sched-03', 100, '2026-04-24 17:25:12.000000', '2026-04-25 11:43:00.000000', 'IMAX', 'R02_C01', '2026-04-25 09:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-02', 'C01'),
	('sched-04', 100, '2026-04-24 17:25:12.000000', '2026-04-25 16:01:00.000000', 'IMAX', 'R02_C01', '2026-04-25 13:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-11', 'C01'),
	('sched-05', 50, '2026-04-24 17:25:12.000000', '2026-04-25 16:29:00.000000', '_2D', 'R01_C02', '2026-04-25 14:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-03', 'C02'),
	('sched-06', 50, '2026-04-24 17:25:12.000000', '2026-04-25 18:55:00.000000', '_2D', 'R01_C02', '2026-04-25 17:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-08', 'C02'),
	('sched-07', 50, '2026-04-24 17:25:12.000000', '2026-04-25 17:36:00.000000', '_3D', 'R02_C02', '2026-04-25 15:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-07', 'C02'),
	('sched-08', 50, '2026-04-24 17:25:12.000000', '2026-05-10 20:26:00.000000', '_2D', 'R01_C03', '2026-05-10 18:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-09', 'C03'),
	('sched-09', 50, '2026-04-24 17:25:12.000000', '2026-04-25 22:53:00.000000', '_2D', 'R01_C03', '2026-04-25 21:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-10', 'C03'),
	('sched-10', 80, '2026-04-24 17:25:12.000000', '2026-04-25 22:15:00.000000', 'IMAX', 'R02_C03', '2026-04-25 19:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-05', 'C03'),
	('sched-11', 60, '2026-04-24 17:25:12.000000', '2026-04-25 22:27:00.000000', '_2D', 'R01_C04', '2026-04-25 20:00:00.000000', b'1', 'SUBTITLES', '2026-04-24 17:25:12.000000', 'movie-06', 'C04'),
	('sched-12', 60, '2026-04-24 17:25:12.000000', '2026-04-25 15:36:00.000000', '_3D', 'R01_C05', '2026-04-25 13:00:00.000000', b'1', 'DUBBING', '2026-04-24 17:25:12.000000', 'movie-07', 'C05'),
	('sched-13', 50, '2026-04-24 17:25:12.000000', '2026-04-26 12:15:00.000000', '_2D', 'R01_C01', '2026-04-26 10:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-12', 'C01'),
	('sched-14', 50, '2026-04-24 17:25:12.000000', '2026-04-26 15:15:00.000000', '_2D', 'R01_C01', '2026-04-26 13:00:00.000000', b'1', 'VOICE_OVER', '2026-04-24 17:25:12.000000', 'movie-12', 'C01');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;


-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for alpha_cinema_db
CREATE DATABASE IF NOT EXISTS `alpha_cinema_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `alpha_cinema_db`;

-- Dumping structure for table alpha_cinema_db.cinemas
CREATE TABLE IF NOT EXISTS `cinemas` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_cinema_db.cinemas: ~5 rows (approximately)
REPLACE INTO `cinemas` (`id`, `name`, `address`, `phone`, `status`, `created_at`, `updated_at`) VALUES
	('C01', 'Alpha Quận 1', '123 Lê Lợi, Phường Bến Thành, Quận 1', '02833331111', 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('C02', 'Alpha Quận 7', '456 Nguyễn Thị Thập, Phường Tân Quy, Quận 7', '02833332222', 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('C03', 'Alpha Gò Vấp', '789 Quang Trung, Phường 10, Quận Gò Vấp', '02833333333', 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('C04', 'Alpha Tân Phú', '101 Lũy Bán Bích, Phường Hòa Thạnh, Quận Tân Phú', '02833334444', 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('C05', 'Alpha Thủ Đức', '202 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức', '02833335555', 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04');

-- Dumping structure for procedure alpha_cinema_db.GenerateAlphaSeats
DELIMITER //
CREATE PROCEDURE `GenerateAlphaSeats`()
BEGIN
    DECLARE cinema_suffix VARCHAR(10);
    DECLARE room_no INT;
    DECLARE room_id_var VARCHAR(50);
    DECLARE row_char CHAR(1);
    DECLARE col_idx INT;
    DECLARE seat_type_var VARCHAR(20);
    
    -- Danh sách hậu tố của rạp
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur_room CURSOR FOR SELECT id FROM rooms;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur_room;
    read_loop: LOOP
        FETCH cur_room INTO room_id_var;
        IF done THEN LEAVE read_loop; END IF;

        -- Duyệt hàng từ A đến J (Skip I nếu muốn theo chuẩn rạp, nhưng ở đây tôi dùng I luôn cho đủ bộ)
        SET @row_list = 'ABCDEFGHIJ';
        SET @row_idx = 1;
        
        WHILE @row_idx <= 10 DO
            SET row_char = SUBSTRING(@row_list, @row_idx, 1);
            
            -- Phân loại ghế theo hàng
            IF row_char IN ('A', 'B', 'C') THEN SET seat_type_var = 'st-single';
            ELSEIF row_char IN ('D', 'E', 'F', 'G', 'H', 'I') THEN SET seat_type_var = 'st-vip';
            ELSE SET seat_type_var = 'st-double';
            END IF;

            SET col_idx = 1;
            WHILE col_idx <= 10 DO
                INSERT INTO seats (id, room_id, row_name, column_name, seat_type_id, status, created_at, updated_at)
                VALUES (
                    CONCAT('s-', room_id_var, '-', row_char, col_idx),
                    room_id_var,
                    row_char,
                    CAST(col_idx AS CHAR),
                    seat_type_var,
                    1,
                    NOW(),
                    NOW()
                );
                SET col_idx = col_idx + 1;
            END WHILE;
            
            SET @row_idx = @row_idx + 1;
        END WHILE;
    END LOOP;

    CLOSE cur_room;
END//
DELIMITER ;

-- Dumping structure for table alpha_cinema_db.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` varchar(50) NOT NULL,
  `cinema_id` varchar(50) DEFAULT NULL,
  `room_number` int(11) DEFAULT NULL,
  `projection_type` varchar(20) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cinema_id` (`cinema_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_cinema_db.rooms: ~8 rows (approximately)
REPLACE INTO `rooms` (`id`, `cinema_id`, `room_number`, `projection_type`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
	('R01_C01', 'C01', 1, '_2D', 50, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R01_C02', 'C02', 1, '_2D', 50, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R01_C03', 'C03', 1, '_2D', 50, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R01_C04', 'C04', 1, '_2D', 60, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R01_C05', 'C05', 1, '_3D', 60, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R02_C01', 'C01', 2, 'IMAX', 100, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R02_C02', 'C02', 2, '_3D', 50, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('R02_C03', 'C03', 2, 'IMAX', 80, 1, '2026-04-24 17:13:04', '2026-04-24 17:13:04');

-- Dumping structure for table alpha_cinema_db.seats
CREATE TABLE IF NOT EXISTS `seats` (
  `id` varchar(255) NOT NULL,
  `room_id` varchar(50) DEFAULT NULL,
  `row_name` varchar(255) DEFAULT NULL,
  `column_name` varchar(255) DEFAULT NULL,
  `seat_type_id` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `seat_type_id` (`seat_type_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `seats_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seat_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_cinema_db.seats: ~800 rows (approximately)
REPLACE INTO `seats` (`id`, `room_id`, `row_name`, `column_name`, `seat_type_id`, `status`, `created_at`, `updated_at`) VALUES
	('s-R01_C01-A1', 'R01_C01', 'A', '1', 'ST01', 1, '2026-04-24 17:15:56', '2026-04-24 17:15:56'),
	('s-R01_C01-A10', 'R01_C01', 'A', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A2', 'R01_C01', 'A', '2', 'ST01', 1, '2026-04-24 17:15:56', '2026-04-24 17:15:56'),
	('s-R01_C01-A3', 'R01_C01', 'A', '3', 'ST01', 1, '2026-04-24 17:15:56', '2026-04-24 17:15:56'),
	('s-R01_C01-A4', 'R01_C01', 'A', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A5', 'R01_C01', 'A', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A6', 'R01_C01', 'A', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A7', 'R01_C01', 'A', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A8', 'R01_C01', 'A', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-A9', 'R01_C01', 'A', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B1', 'R01_C01', 'B', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B10', 'R01_C01', 'B', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B2', 'R01_C01', 'B', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B3', 'R01_C01', 'B', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B4', 'R01_C01', 'B', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B5', 'R01_C01', 'B', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B6', 'R01_C01', 'B', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B7', 'R01_C01', 'B', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B8', 'R01_C01', 'B', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-B9', 'R01_C01', 'B', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C1', 'R01_C01', 'C', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C10', 'R01_C01', 'C', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C2', 'R01_C01', 'C', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C3', 'R01_C01', 'C', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C4', 'R01_C01', 'C', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C5', 'R01_C01', 'C', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C6', 'R01_C01', 'C', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C7', 'R01_C01', 'C', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C8', 'R01_C01', 'C', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-C9', 'R01_C01', 'C', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D1', 'R01_C01', 'D', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D10', 'R01_C01', 'D', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D2', 'R01_C01', 'D', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D3', 'R01_C01', 'D', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D4', 'R01_C01', 'D', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D5', 'R01_C01', 'D', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D6', 'R01_C01', 'D', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D7', 'R01_C01', 'D', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D8', 'R01_C01', 'D', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-D9', 'R01_C01', 'D', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E1', 'R01_C01', 'E', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E10', 'R01_C01', 'E', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E2', 'R01_C01', 'E', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E3', 'R01_C01', 'E', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E4', 'R01_C01', 'E', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E5', 'R01_C01', 'E', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E6', 'R01_C01', 'E', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E7', 'R01_C01', 'E', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E8', 'R01_C01', 'E', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-E9', 'R01_C01', 'E', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F1', 'R01_C01', 'F', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F10', 'R01_C01', 'F', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F2', 'R01_C01', 'F', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F3', 'R01_C01', 'F', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F4', 'R01_C01', 'F', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F5', 'R01_C01', 'F', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F6', 'R01_C01', 'F', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F7', 'R01_C01', 'F', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F8', 'R01_C01', 'F', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-F9', 'R01_C01', 'F', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G1', 'R01_C01', 'G', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G10', 'R01_C01', 'G', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G2', 'R01_C01', 'G', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G3', 'R01_C01', 'G', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G4', 'R01_C01', 'G', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G5', 'R01_C01', 'G', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G6', 'R01_C01', 'G', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G7', 'R01_C01', 'G', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G8', 'R01_C01', 'G', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-G9', 'R01_C01', 'G', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H1', 'R01_C01', 'H', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H10', 'R01_C01', 'H', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H2', 'R01_C01', 'H', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H3', 'R01_C01', 'H', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H4', 'R01_C01', 'H', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H5', 'R01_C01', 'H', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H6', 'R01_C01', 'H', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H7', 'R01_C01', 'H', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H8', 'R01_C01', 'H', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-H9', 'R01_C01', 'H', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I1', 'R01_C01', 'I', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I10', 'R01_C01', 'I', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I2', 'R01_C01', 'I', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I3', 'R01_C01', 'I', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I4', 'R01_C01', 'I', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I5', 'R01_C01', 'I', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I6', 'R01_C01', 'I', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I7', 'R01_C01', 'I', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I8', 'R01_C01', 'I', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-I9', 'R01_C01', 'I', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J1', 'R01_C01', 'J', '1', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J10', 'R01_C01', 'J', '10', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J2', 'R01_C01', 'J', '2', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J3', 'R01_C01', 'J', '3', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J4', 'R01_C01', 'J', '4', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J5', 'R01_C01', 'J', '5', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J6', 'R01_C01', 'J', '6', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J7', 'R01_C01', 'J', '7', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J8', 'R01_C01', 'J', '8', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C01-J9', 'R01_C01', 'J', '9', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A1', 'R01_C02', 'A', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A10', 'R01_C02', 'A', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A2', 'R01_C02', 'A', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A3', 'R01_C02', 'A', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A4', 'R01_C02', 'A', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A5', 'R01_C02', 'A', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A6', 'R01_C02', 'A', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A7', 'R01_C02', 'A', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A8', 'R01_C02', 'A', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-A9', 'R01_C02', 'A', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B1', 'R01_C02', 'B', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B10', 'R01_C02', 'B', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B2', 'R01_C02', 'B', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B3', 'R01_C02', 'B', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B4', 'R01_C02', 'B', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B5', 'R01_C02', 'B', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B6', 'R01_C02', 'B', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B7', 'R01_C02', 'B', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B8', 'R01_C02', 'B', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-B9', 'R01_C02', 'B', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C1', 'R01_C02', 'C', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C10', 'R01_C02', 'C', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C2', 'R01_C02', 'C', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C3', 'R01_C02', 'C', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C4', 'R01_C02', 'C', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C5', 'R01_C02', 'C', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C6', 'R01_C02', 'C', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C7', 'R01_C02', 'C', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C8', 'R01_C02', 'C', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-C9', 'R01_C02', 'C', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D1', 'R01_C02', 'D', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D10', 'R01_C02', 'D', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D2', 'R01_C02', 'D', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D3', 'R01_C02', 'D', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D4', 'R01_C02', 'D', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D5', 'R01_C02', 'D', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D6', 'R01_C02', 'D', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D7', 'R01_C02', 'D', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D8', 'R01_C02', 'D', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-D9', 'R01_C02', 'D', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E1', 'R01_C02', 'E', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E10', 'R01_C02', 'E', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E2', 'R01_C02', 'E', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E3', 'R01_C02', 'E', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E4', 'R01_C02', 'E', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E5', 'R01_C02', 'E', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E6', 'R01_C02', 'E', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E7', 'R01_C02', 'E', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E8', 'R01_C02', 'E', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-E9', 'R01_C02', 'E', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F1', 'R01_C02', 'F', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F10', 'R01_C02', 'F', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F2', 'R01_C02', 'F', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F3', 'R01_C02', 'F', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F4', 'R01_C02', 'F', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F5', 'R01_C02', 'F', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F6', 'R01_C02', 'F', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F7', 'R01_C02', 'F', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F8', 'R01_C02', 'F', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-F9', 'R01_C02', 'F', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G1', 'R01_C02', 'G', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G10', 'R01_C02', 'G', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G2', 'R01_C02', 'G', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G3', 'R01_C02', 'G', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G4', 'R01_C02', 'G', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G5', 'R01_C02', 'G', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G6', 'R01_C02', 'G', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G7', 'R01_C02', 'G', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G8', 'R01_C02', 'G', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-G9', 'R01_C02', 'G', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H1', 'R01_C02', 'H', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H10', 'R01_C02', 'H', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H2', 'R01_C02', 'H', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H3', 'R01_C02', 'H', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H4', 'R01_C02', 'H', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H5', 'R01_C02', 'H', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H6', 'R01_C02', 'H', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H7', 'R01_C02', 'H', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H8', 'R01_C02', 'H', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-H9', 'R01_C02', 'H', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I1', 'R01_C02', 'I', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I10', 'R01_C02', 'I', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I2', 'R01_C02', 'I', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I3', 'R01_C02', 'I', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I4', 'R01_C02', 'I', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I5', 'R01_C02', 'I', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I6', 'R01_C02', 'I', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I7', 'R01_C02', 'I', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I8', 'R01_C02', 'I', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-I9', 'R01_C02', 'I', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J1', 'R01_C02', 'J', '1', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J10', 'R01_C02', 'J', '10', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J2', 'R01_C02', 'J', '2', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J3', 'R01_C02', 'J', '3', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J4', 'R01_C02', 'J', '4', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J5', 'R01_C02', 'J', '5', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J6', 'R01_C02', 'J', '6', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J7', 'R01_C02', 'J', '7', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J8', 'R01_C02', 'J', '8', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C02-J9', 'R01_C02', 'J', '9', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R01_C03-A1', 'R01_C03', 'A', '1', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-28 17:03:21'),
	('s-R01_C03-A10', 'R01_C03', 'A', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A2', 'R01_C03', 'A', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A3', 'R01_C03', 'A', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A4', 'R01_C03', 'A', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A5', 'R01_C03', 'A', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A6', 'R01_C03', 'A', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A7', 'R01_C03', 'A', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A8', 'R01_C03', 'A', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-A9', 'R01_C03', 'A', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B1', 'R01_C03', 'B', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B10', 'R01_C03', 'B', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B2', 'R01_C03', 'B', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B3', 'R01_C03', 'B', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B4', 'R01_C03', 'B', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B5', 'R01_C03', 'B', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B6', 'R01_C03', 'B', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B7', 'R01_C03', 'B', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B8', 'R01_C03', 'B', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-B9', 'R01_C03', 'B', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C1', 'R01_C03', 'C', '1', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-28 17:03:14'),
	('s-R01_C03-C10', 'R01_C03', 'C', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C2', 'R01_C03', 'C', '2', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-28 17:03:14'),
	('s-R01_C03-C3', 'R01_C03', 'C', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C4', 'R01_C03', 'C', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C5', 'R01_C03', 'C', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C6', 'R01_C03', 'C', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C7', 'R01_C03', 'C', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C8', 'R01_C03', 'C', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-C9', 'R01_C03', 'C', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D1', 'R01_C03', 'D', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D10', 'R01_C03', 'D', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D2', 'R01_C03', 'D', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D3', 'R01_C03', 'D', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D4', 'R01_C03', 'D', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D5', 'R01_C03', 'D', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D6', 'R01_C03', 'D', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D7', 'R01_C03', 'D', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D8', 'R01_C03', 'D', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-D9', 'R01_C03', 'D', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E1', 'R01_C03', 'E', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E10', 'R01_C03', 'E', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E2', 'R01_C03', 'E', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E3', 'R01_C03', 'E', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E4', 'R01_C03', 'E', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E5', 'R01_C03', 'E', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E6', 'R01_C03', 'E', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E7', 'R01_C03', 'E', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E8', 'R01_C03', 'E', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-E9', 'R01_C03', 'E', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F1', 'R01_C03', 'F', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F10', 'R01_C03', 'F', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F2', 'R01_C03', 'F', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F3', 'R01_C03', 'F', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F4', 'R01_C03', 'F', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F5', 'R01_C03', 'F', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F6', 'R01_C03', 'F', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F7', 'R01_C03', 'F', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F8', 'R01_C03', 'F', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-F9', 'R01_C03', 'F', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G1', 'R01_C03', 'G', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G10', 'R01_C03', 'G', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G2', 'R01_C03', 'G', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G3', 'R01_C03', 'G', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G4', 'R01_C03', 'G', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G5', 'R01_C03', 'G', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G6', 'R01_C03', 'G', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G7', 'R01_C03', 'G', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G8', 'R01_C03', 'G', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-G9', 'R01_C03', 'G', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H1', 'R01_C03', 'H', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H10', 'R01_C03', 'H', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H2', 'R01_C03', 'H', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H3', 'R01_C03', 'H', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H4', 'R01_C03', 'H', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H5', 'R01_C03', 'H', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H6', 'R01_C03', 'H', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H7', 'R01_C03', 'H', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H8', 'R01_C03', 'H', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-H9', 'R01_C03', 'H', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I1', 'R01_C03', 'I', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I10', 'R01_C03', 'I', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I2', 'R01_C03', 'I', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I3', 'R01_C03', 'I', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I4', 'R01_C03', 'I', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I5', 'R01_C03', 'I', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I6', 'R01_C03', 'I', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I7', 'R01_C03', 'I', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I8', 'R01_C03', 'I', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-I9', 'R01_C03', 'I', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J1', 'R01_C03', 'J', '1', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J10', 'R01_C03', 'J', '10', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J2', 'R01_C03', 'J', '2', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J3', 'R01_C03', 'J', '3', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J4', 'R01_C03', 'J', '4', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J5', 'R01_C03', 'J', '5', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J6', 'R01_C03', 'J', '6', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J7', 'R01_C03', 'J', '7', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J8', 'R01_C03', 'J', '8', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C03-J9', 'R01_C03', 'J', '9', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A1', 'R01_C04', 'A', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A10', 'R01_C04', 'A', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A2', 'R01_C04', 'A', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A3', 'R01_C04', 'A', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A4', 'R01_C04', 'A', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A5', 'R01_C04', 'A', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A6', 'R01_C04', 'A', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A7', 'R01_C04', 'A', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A8', 'R01_C04', 'A', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-A9', 'R01_C04', 'A', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B1', 'R01_C04', 'B', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B10', 'R01_C04', 'B', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B2', 'R01_C04', 'B', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B3', 'R01_C04', 'B', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B4', 'R01_C04', 'B', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B5', 'R01_C04', 'B', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B6', 'R01_C04', 'B', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B7', 'R01_C04', 'B', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B8', 'R01_C04', 'B', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-B9', 'R01_C04', 'B', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C1', 'R01_C04', 'C', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C10', 'R01_C04', 'C', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C2', 'R01_C04', 'C', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C3', 'R01_C04', 'C', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C4', 'R01_C04', 'C', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C5', 'R01_C04', 'C', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C6', 'R01_C04', 'C', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C7', 'R01_C04', 'C', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C8', 'R01_C04', 'C', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-C9', 'R01_C04', 'C', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D1', 'R01_C04', 'D', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D10', 'R01_C04', 'D', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-D2', 'R01_C04', 'D', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D3', 'R01_C04', 'D', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D4', 'R01_C04', 'D', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D5', 'R01_C04', 'D', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D6', 'R01_C04', 'D', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R01_C04-D7', 'R01_C04', 'D', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-D8', 'R01_C04', 'D', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-D9', 'R01_C04', 'D', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E1', 'R01_C04', 'E', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E10', 'R01_C04', 'E', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E2', 'R01_C04', 'E', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E3', 'R01_C04', 'E', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E4', 'R01_C04', 'E', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E5', 'R01_C04', 'E', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E6', 'R01_C04', 'E', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E7', 'R01_C04', 'E', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E8', 'R01_C04', 'E', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-E9', 'R01_C04', 'E', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F1', 'R01_C04', 'F', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F10', 'R01_C04', 'F', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F2', 'R01_C04', 'F', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F3', 'R01_C04', 'F', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F4', 'R01_C04', 'F', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F5', 'R01_C04', 'F', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F6', 'R01_C04', 'F', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F7', 'R01_C04', 'F', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F8', 'R01_C04', 'F', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-F9', 'R01_C04', 'F', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G1', 'R01_C04', 'G', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G10', 'R01_C04', 'G', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G2', 'R01_C04', 'G', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G3', 'R01_C04', 'G', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G4', 'R01_C04', 'G', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G5', 'R01_C04', 'G', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G6', 'R01_C04', 'G', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G7', 'R01_C04', 'G', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G8', 'R01_C04', 'G', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-G9', 'R01_C04', 'G', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H1', 'R01_C04', 'H', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H10', 'R01_C04', 'H', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H2', 'R01_C04', 'H', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H3', 'R01_C04', 'H', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H4', 'R01_C04', 'H', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H5', 'R01_C04', 'H', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H6', 'R01_C04', 'H', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H7', 'R01_C04', 'H', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H8', 'R01_C04', 'H', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-H9', 'R01_C04', 'H', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I1', 'R01_C04', 'I', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I10', 'R01_C04', 'I', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I2', 'R01_C04', 'I', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I3', 'R01_C04', 'I', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I4', 'R01_C04', 'I', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I5', 'R01_C04', 'I', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I6', 'R01_C04', 'I', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I7', 'R01_C04', 'I', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I8', 'R01_C04', 'I', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-I9', 'R01_C04', 'I', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J1', 'R01_C04', 'J', '1', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J10', 'R01_C04', 'J', '10', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J2', 'R01_C04', 'J', '2', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J3', 'R01_C04', 'J', '3', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J4', 'R01_C04', 'J', '4', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J5', 'R01_C04', 'J', '5', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J6', 'R01_C04', 'J', '6', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J7', 'R01_C04', 'J', '7', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J8', 'R01_C04', 'J', '8', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C04-J9', 'R01_C04', 'J', '9', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A1', 'R01_C05', 'A', '1', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A10', 'R01_C05', 'A', '10', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A2', 'R01_C05', 'A', '2', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A3', 'R01_C05', 'A', '3', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A4', 'R01_C05', 'A', '4', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-28 17:04:13'),
	('s-R01_C05-A5', 'R01_C05', 'A', '5', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-28 17:03:50'),
	('s-R01_C05-A6', 'R01_C05', 'A', '6', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-28 17:03:50'),
	('s-R01_C05-A7', 'R01_C05', 'A', '7', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A8', 'R01_C05', 'A', '8', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-A9', 'R01_C05', 'A', '9', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B1', 'R01_C05', 'B', '1', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B10', 'R01_C05', 'B', '10', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B2', 'R01_C05', 'B', '2', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B3', 'R01_C05', 'B', '3', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B4', 'R01_C05', 'B', '4', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B5', 'R01_C05', 'B', '5', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B6', 'R01_C05', 'B', '6', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B7', 'R01_C05', 'B', '7', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B8', 'R01_C05', 'B', '8', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-B9', 'R01_C05', 'B', '9', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C1', 'R01_C05', 'C', '1', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C10', 'R01_C05', 'C', '10', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C2', 'R01_C05', 'C', '2', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C3', 'R01_C05', 'C', '3', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C4', 'R01_C05', 'C', '4', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C5', 'R01_C05', 'C', '5', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C6', 'R01_C05', 'C', '6', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C7', 'R01_C05', 'C', '7', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C8', 'R01_C05', 'C', '8', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-C9', 'R01_C05', 'C', '9', 'ST01', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D1', 'R01_C05', 'D', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D10', 'R01_C05', 'D', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D2', 'R01_C05', 'D', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D3', 'R01_C05', 'D', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D4', 'R01_C05', 'D', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D5', 'R01_C05', 'D', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D6', 'R01_C05', 'D', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D7', 'R01_C05', 'D', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D8', 'R01_C05', 'D', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-D9', 'R01_C05', 'D', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E1', 'R01_C05', 'E', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E10', 'R01_C05', 'E', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E2', 'R01_C05', 'E', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E3', 'R01_C05', 'E', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E4', 'R01_C05', 'E', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E5', 'R01_C05', 'E', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E6', 'R01_C05', 'E', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E7', 'R01_C05', 'E', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E8', 'R01_C05', 'E', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-E9', 'R01_C05', 'E', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F1', 'R01_C05', 'F', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F10', 'R01_C05', 'F', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F2', 'R01_C05', 'F', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F3', 'R01_C05', 'F', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F4', 'R01_C05', 'F', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F5', 'R01_C05', 'F', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F6', 'R01_C05', 'F', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F7', 'R01_C05', 'F', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F8', 'R01_C05', 'F', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-F9', 'R01_C05', 'F', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G1', 'R01_C05', 'G', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G10', 'R01_C05', 'G', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G2', 'R01_C05', 'G', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G3', 'R01_C05', 'G', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G4', 'R01_C05', 'G', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G5', 'R01_C05', 'G', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G6', 'R01_C05', 'G', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G7', 'R01_C05', 'G', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G8', 'R01_C05', 'G', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-G9', 'R01_C05', 'G', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H1', 'R01_C05', 'H', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H10', 'R01_C05', 'H', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H2', 'R01_C05', 'H', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H3', 'R01_C05', 'H', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H4', 'R01_C05', 'H', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H5', 'R01_C05', 'H', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H6', 'R01_C05', 'H', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H7', 'R01_C05', 'H', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H8', 'R01_C05', 'H', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-H9', 'R01_C05', 'H', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I1', 'R01_C05', 'I', '1', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I10', 'R01_C05', 'I', '10', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I2', 'R01_C05', 'I', '2', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I3', 'R01_C05', 'I', '3', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I4', 'R01_C05', 'I', '4', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I5', 'R01_C05', 'I', '5', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I6', 'R01_C05', 'I', '6', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I7', 'R01_C05', 'I', '7', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I8', 'R01_C05', 'I', '8', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-I9', 'R01_C05', 'I', '9', 'ST03', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J1', 'R01_C05', 'J', '1', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J10', 'R01_C05', 'J', '10', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J2', 'R01_C05', 'J', '2', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J3', 'R01_C05', 'J', '3', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J4', 'R01_C05', 'J', '4', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J5', 'R01_C05', 'J', '5', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J6', 'R01_C05', 'J', '6', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J7', 'R01_C05', 'J', '7', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J8', 'R01_C05', 'J', '8', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R01_C05-J9', 'R01_C05', 'J', '9', 'ST02', 1, '2026-04-24 17:15:59', '2026-04-24 17:15:59'),
	('s-R02_C01-A1', 'R02_C01', 'A', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A10', 'R02_C01', 'A', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A2', 'R02_C01', 'A', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A3', 'R02_C01', 'A', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A4', 'R02_C01', 'A', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A5', 'R02_C01', 'A', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A6', 'R02_C01', 'A', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A7', 'R02_C01', 'A', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A8', 'R02_C01', 'A', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-A9', 'R02_C01', 'A', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B1', 'R02_C01', 'B', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B10', 'R02_C01', 'B', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B2', 'R02_C01', 'B', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B3', 'R02_C01', 'B', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B4', 'R02_C01', 'B', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B5', 'R02_C01', 'B', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B6', 'R02_C01', 'B', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B7', 'R02_C01', 'B', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B8', 'R02_C01', 'B', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-B9', 'R02_C01', 'B', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C1', 'R02_C01', 'C', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C10', 'R02_C01', 'C', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C2', 'R02_C01', 'C', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C3', 'R02_C01', 'C', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C4', 'R02_C01', 'C', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C5', 'R02_C01', 'C', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C6', 'R02_C01', 'C', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C7', 'R02_C01', 'C', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C8', 'R02_C01', 'C', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-C9', 'R02_C01', 'C', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D1', 'R02_C01', 'D', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D10', 'R02_C01', 'D', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D2', 'R02_C01', 'D', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D3', 'R02_C01', 'D', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D4', 'R02_C01', 'D', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D5', 'R02_C01', 'D', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D6', 'R02_C01', 'D', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D7', 'R02_C01', 'D', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D8', 'R02_C01', 'D', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-D9', 'R02_C01', 'D', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E1', 'R02_C01', 'E', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E10', 'R02_C01', 'E', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E2', 'R02_C01', 'E', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E3', 'R02_C01', 'E', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E4', 'R02_C01', 'E', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E5', 'R02_C01', 'E', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E6', 'R02_C01', 'E', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E7', 'R02_C01', 'E', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E8', 'R02_C01', 'E', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-E9', 'R02_C01', 'E', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F1', 'R02_C01', 'F', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F10', 'R02_C01', 'F', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F2', 'R02_C01', 'F', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F3', 'R02_C01', 'F', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F4', 'R02_C01', 'F', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F5', 'R02_C01', 'F', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F6', 'R02_C01', 'F', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F7', 'R02_C01', 'F', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F8', 'R02_C01', 'F', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-F9', 'R02_C01', 'F', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G1', 'R02_C01', 'G', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G10', 'R02_C01', 'G', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G2', 'R02_C01', 'G', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G3', 'R02_C01', 'G', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G4', 'R02_C01', 'G', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G5', 'R02_C01', 'G', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G6', 'R02_C01', 'G', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G7', 'R02_C01', 'G', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G8', 'R02_C01', 'G', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-G9', 'R02_C01', 'G', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H1', 'R02_C01', 'H', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H10', 'R02_C01', 'H', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H2', 'R02_C01', 'H', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H3', 'R02_C01', 'H', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H4', 'R02_C01', 'H', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H5', 'R02_C01', 'H', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H6', 'R02_C01', 'H', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H7', 'R02_C01', 'H', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H8', 'R02_C01', 'H', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-H9', 'R02_C01', 'H', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I1', 'R02_C01', 'I', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I10', 'R02_C01', 'I', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I2', 'R02_C01', 'I', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I3', 'R02_C01', 'I', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I4', 'R02_C01', 'I', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I5', 'R02_C01', 'I', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I6', 'R02_C01', 'I', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I7', 'R02_C01', 'I', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I8', 'R02_C01', 'I', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-I9', 'R02_C01', 'I', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J1', 'R02_C01', 'J', '1', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J10', 'R02_C01', 'J', '10', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J2', 'R02_C01', 'J', '2', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J3', 'R02_C01', 'J', '3', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J4', 'R02_C01', 'J', '4', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J5', 'R02_C01', 'J', '5', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J6', 'R02_C01', 'J', '6', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J7', 'R02_C01', 'J', '7', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J8', 'R02_C01', 'J', '8', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C01-J9', 'R02_C01', 'J', '9', 'ST02', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A1', 'R02_C02', 'A', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A10', 'R02_C02', 'A', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A2', 'R02_C02', 'A', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A3', 'R02_C02', 'A', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A4', 'R02_C02', 'A', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A5', 'R02_C02', 'A', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A6', 'R02_C02', 'A', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A7', 'R02_C02', 'A', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A8', 'R02_C02', 'A', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-A9', 'R02_C02', 'A', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B1', 'R02_C02', 'B', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B10', 'R02_C02', 'B', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B2', 'R02_C02', 'B', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B3', 'R02_C02', 'B', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B4', 'R02_C02', 'B', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B5', 'R02_C02', 'B', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B6', 'R02_C02', 'B', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B7', 'R02_C02', 'B', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B8', 'R02_C02', 'B', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-B9', 'R02_C02', 'B', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C1', 'R02_C02', 'C', '1', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C10', 'R02_C02', 'C', '10', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C2', 'R02_C02', 'C', '2', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C3', 'R02_C02', 'C', '3', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C4', 'R02_C02', 'C', '4', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C5', 'R02_C02', 'C', '5', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C6', 'R02_C02', 'C', '6', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C7', 'R02_C02', 'C', '7', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C8', 'R02_C02', 'C', '8', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-C9', 'R02_C02', 'C', '9', 'ST01', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D1', 'R02_C02', 'D', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D10', 'R02_C02', 'D', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D2', 'R02_C02', 'D', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D3', 'R02_C02', 'D', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D4', 'R02_C02', 'D', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D5', 'R02_C02', 'D', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D6', 'R02_C02', 'D', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D7', 'R02_C02', 'D', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D8', 'R02_C02', 'D', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-D9', 'R02_C02', 'D', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E1', 'R02_C02', 'E', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E10', 'R02_C02', 'E', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E2', 'R02_C02', 'E', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E3', 'R02_C02', 'E', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E4', 'R02_C02', 'E', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E5', 'R02_C02', 'E', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E6', 'R02_C02', 'E', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E7', 'R02_C02', 'E', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E8', 'R02_C02', 'E', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-E9', 'R02_C02', 'E', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F1', 'R02_C02', 'F', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F10', 'R02_C02', 'F', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F2', 'R02_C02', 'F', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F3', 'R02_C02', 'F', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F4', 'R02_C02', 'F', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F5', 'R02_C02', 'F', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F6', 'R02_C02', 'F', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F7', 'R02_C02', 'F', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F8', 'R02_C02', 'F', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-F9', 'R02_C02', 'F', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G1', 'R02_C02', 'G', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G10', 'R02_C02', 'G', '10', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G2', 'R02_C02', 'G', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G3', 'R02_C02', 'G', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G4', 'R02_C02', 'G', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G5', 'R02_C02', 'G', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G6', 'R02_C02', 'G', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G7', 'R02_C02', 'G', '7', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G8', 'R02_C02', 'G', '8', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-G9', 'R02_C02', 'G', '9', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H1', 'R02_C02', 'H', '1', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H10', 'R02_C02', 'H', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-H2', 'R02_C02', 'H', '2', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H3', 'R02_C02', 'H', '3', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H4', 'R02_C02', 'H', '4', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H5', 'R02_C02', 'H', '5', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H6', 'R02_C02', 'H', '6', 'ST03', 1, '2026-04-24 17:15:57', '2026-04-24 17:15:57'),
	('s-R02_C02-H7', 'R02_C02', 'H', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-H8', 'R02_C02', 'H', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-H9', 'R02_C02', 'H', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I1', 'R02_C02', 'I', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I10', 'R02_C02', 'I', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I2', 'R02_C02', 'I', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I3', 'R02_C02', 'I', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I4', 'R02_C02', 'I', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I5', 'R02_C02', 'I', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I6', 'R02_C02', 'I', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I7', 'R02_C02', 'I', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I8', 'R02_C02', 'I', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-I9', 'R02_C02', 'I', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J1', 'R02_C02', 'J', '1', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J10', 'R02_C02', 'J', '10', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J2', 'R02_C02', 'J', '2', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J3', 'R02_C02', 'J', '3', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J4', 'R02_C02', 'J', '4', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J5', 'R02_C02', 'J', '5', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J6', 'R02_C02', 'J', '6', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J7', 'R02_C02', 'J', '7', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J8', 'R02_C02', 'J', '8', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C02-J9', 'R02_C02', 'J', '9', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A1', 'R02_C03', 'A', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A10', 'R02_C03', 'A', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A2', 'R02_C03', 'A', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A3', 'R02_C03', 'A', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A4', 'R02_C03', 'A', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A5', 'R02_C03', 'A', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A6', 'R02_C03', 'A', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A7', 'R02_C03', 'A', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A8', 'R02_C03', 'A', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-A9', 'R02_C03', 'A', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B1', 'R02_C03', 'B', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B10', 'R02_C03', 'B', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B2', 'R02_C03', 'B', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B3', 'R02_C03', 'B', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B4', 'R02_C03', 'B', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B5', 'R02_C03', 'B', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B6', 'R02_C03', 'B', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B7', 'R02_C03', 'B', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B8', 'R02_C03', 'B', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-B9', 'R02_C03', 'B', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C1', 'R02_C03', 'C', '1', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C10', 'R02_C03', 'C', '10', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C2', 'R02_C03', 'C', '2', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C3', 'R02_C03', 'C', '3', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C4', 'R02_C03', 'C', '4', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C5', 'R02_C03', 'C', '5', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C6', 'R02_C03', 'C', '6', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C7', 'R02_C03', 'C', '7', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C8', 'R02_C03', 'C', '8', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-C9', 'R02_C03', 'C', '9', 'ST01', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D1', 'R02_C03', 'D', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D10', 'R02_C03', 'D', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D2', 'R02_C03', 'D', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D3', 'R02_C03', 'D', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D4', 'R02_C03', 'D', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D5', 'R02_C03', 'D', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D6', 'R02_C03', 'D', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D7', 'R02_C03', 'D', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D8', 'R02_C03', 'D', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-D9', 'R02_C03', 'D', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E1', 'R02_C03', 'E', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E10', 'R02_C03', 'E', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E2', 'R02_C03', 'E', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E3', 'R02_C03', 'E', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E4', 'R02_C03', 'E', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E5', 'R02_C03', 'E', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E6', 'R02_C03', 'E', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E7', 'R02_C03', 'E', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E8', 'R02_C03', 'E', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-E9', 'R02_C03', 'E', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F1', 'R02_C03', 'F', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F10', 'R02_C03', 'F', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F2', 'R02_C03', 'F', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F3', 'R02_C03', 'F', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F4', 'R02_C03', 'F', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F5', 'R02_C03', 'F', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F6', 'R02_C03', 'F', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F7', 'R02_C03', 'F', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F8', 'R02_C03', 'F', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-F9', 'R02_C03', 'F', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G1', 'R02_C03', 'G', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G10', 'R02_C03', 'G', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G2', 'R02_C03', 'G', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G3', 'R02_C03', 'G', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G4', 'R02_C03', 'G', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G5', 'R02_C03', 'G', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G6', 'R02_C03', 'G', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G7', 'R02_C03', 'G', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G8', 'R02_C03', 'G', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-G9', 'R02_C03', 'G', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H1', 'R02_C03', 'H', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H10', 'R02_C03', 'H', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H2', 'R02_C03', 'H', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H3', 'R02_C03', 'H', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H4', 'R02_C03', 'H', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H5', 'R02_C03', 'H', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H6', 'R02_C03', 'H', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H7', 'R02_C03', 'H', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H8', 'R02_C03', 'H', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-H9', 'R02_C03', 'H', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I1', 'R02_C03', 'I', '1', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I10', 'R02_C03', 'I', '10', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I2', 'R02_C03', 'I', '2', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I3', 'R02_C03', 'I', '3', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I4', 'R02_C03', 'I', '4', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I5', 'R02_C03', 'I', '5', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I6', 'R02_C03', 'I', '6', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I7', 'R02_C03', 'I', '7', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I8', 'R02_C03', 'I', '8', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-I9', 'R02_C03', 'I', '9', 'ST03', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J1', 'R02_C03', 'J', '1', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J10', 'R02_C03', 'J', '10', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J2', 'R02_C03', 'J', '2', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J3', 'R02_C03', 'J', '3', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J4', 'R02_C03', 'J', '4', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J5', 'R02_C03', 'J', '5', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J6', 'R02_C03', 'J', '6', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J7', 'R02_C03', 'J', '7', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J8', 'R02_C03', 'J', '8', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58'),
	('s-R02_C03-J9', 'R02_C03', 'J', '9', 'ST02', 1, '2026-04-24 17:15:58', '2026-04-24 17:15:58');

-- Dumping structure for table alpha_cinema_db.seat_types
CREATE TABLE IF NOT EXISTS `seat_types` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table alpha_cinema_db.seat_types: ~3 rows (approximately)
REPLACE INTO `seat_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
	('ST01', 'Ghế đơn', 'Ghế đơn tiêu chuẩn, thoải mái', '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('ST02', 'Ghế đôi', 'Ghế đôi dành cho cặp đôi', '2026-04-24 17:13:04', '2026-04-24 17:13:04'),
	('ST03', 'VIP', 'Ghế VIP rộng rãi, vị trí trung tâm đẹp nhất', '2026-04-24 17:13:04', '2026-04-24 17:13:04');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;


