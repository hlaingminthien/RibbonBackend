CREATE DATABASE `ribbon`;
CREATE TABLE `ribbon`.`tbl_sharecounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `count` VARCHAR(45) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);
  
CREATE TABLE `ribbon`.`tbl_luckydrawcounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `count` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

USE `ribbon`;
DROP procedure IF EXISTS `sp_saveLuckyDraw`;

DELIMITER $$
USE `ribbon`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_saveLuckyDraw`()
BEGIN
	CASE
		WHEN (SELECT COUNT(*) from tbl_luckydrawcounts WHERE date = CURDATE()) > 0 THEN UPDATE tbl_luckydrawcounts SET count = (SELECT count FROM (SELECT count+1 AS count FROM tbl_luckydrawcounts WHERE date = CURDATE()) AS t) WHERE date = CURDATE();
		ELSE INSERT INTO tbl_luckydrawcounts(date, count) value ( CURDATE(), 1); 
	END CASE;
    SELECT count from tbl_luckydrawcounts WHERE date = CURDATE();
END$$

DELIMITER ;

USE `ribbon`;
DROP procedure IF EXISTS `sp_saveShareCount`;

DELIMITER $$
USE `ribbon`$$
CREATE PROCEDURE `sp_saveShareCount` ()
BEGIN
	CASE
		WHEN (SELECT COUNT(*) from tbl_sharecounts WHERE date = CURDATE()) > 0 THEN UPDATE tbl_sharecounts SET count = (SELECT count FROM (SELECT count+1 AS count FROM tbl_sharecounts WHERE date = CURDATE()) AS t) WHERE date = CURDATE();
		ELSE INSERT INTO tbl_sharecounts(date, count) value ( CURDATE(), 1); 
	END CASE;
    SELECT count from tbl_sharecounts WHERE date = CURDATE();
END$$

DELIMITER ;





