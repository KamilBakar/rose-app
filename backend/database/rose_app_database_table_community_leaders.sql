
-- --------------------------------------------------------

--
-- Table structure for table `community_leaders`
--

DROP TABLE IF EXISTS `community_leaders`;
CREATE TABLE IF NOT EXISTS `community_leaders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `referral_code` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `referral_code` (`referral_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
