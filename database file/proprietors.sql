create table IF NOT EXISTS `proprietors`(
    `id` int (5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `fullname` varchar(100) NOT NULL,
    `address` varchar(100) NOT NULL,
    `phoneNumber` varchar(100) NOT NULL,
    `email` varchar(100),
    `password` varchar(100) NOT NULL,
    `username` varchar(100),
    `status` varchar(50) DEFAULT 'unverified');

    
    
