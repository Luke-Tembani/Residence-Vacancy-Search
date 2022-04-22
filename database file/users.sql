create table IF NOT EXISTS `users`(
    `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `fullname` varchar(50) NOT NULL,
    `email` varchar(50) NOT NULL,
    `password` varchar(150) NOT NULL,
    `username` varchar(100)NOT NULL);
    
