create table IF NOT EXISTS `vacancies`(
    `id` int AUTO_INCREMENT PRIMARY KEY,
    `number` varchar(50) NOT NULL,
    `gender` varchar(50) NOT NULL,
    `price` varchar(10) NOT NUll,
    `wifi` varchar(50) DEFAULT 'off',
    `geyser`varchar(50) DEFAULT 'off',
    `solar`varchar(50) DEFAULT 'off',
    `fridge`varchar(50) DEFAULT 'off',
    `proprietor` varchar(100),
    `phoneNumber` varchar(100),
    `gas` varchar(50) DEFAULT 'off');

