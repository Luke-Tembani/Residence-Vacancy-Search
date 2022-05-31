create table IF NOT EXISTS `applications`(
    `id` int (5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `studentName` varchar(100) NOT NULL,
    `proprietor` varchar(100) NOT NULL,
    `price` varchar(100) NOT NULL,
    `wifi` varchar(100),
    `geyser` varchar(100),
    `solar` varchar(100),
    `fridge` varchar(100),
    `gas` varchar(100),
    `phoneNumber` varchar(100) NOT NULL,
    `vacancyId` varchar(100) NOT NULL,
    `paymentStatus` varchar(100) NOT NULL);



    
