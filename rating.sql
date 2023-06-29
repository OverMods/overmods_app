SELECT `mod`.*, AVG(`mod_ratings`.`rating`) AS `rating`
FROM `mod` 
INNER JOIN `mod_ratings` 
ON `mod`.`id` = `mod_ratings`.`mod`
GROUP BY `id`
ORDER BY `rating` DESC;