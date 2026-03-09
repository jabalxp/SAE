<?php
// api/services/UserService.php
require_once __DIR__ . '/BadgeService.php';

class UserService
{
    public static function saveUser($steamid, $personaname, $avatarfull, $profileurl, $db)
    {
        $stmt = $db->prepare("
            INSERT INTO users (steamid, personaname, avatarfull, profileurl, last_login) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                personaname = VALUES(personaname),
                avatarfull = VALUES(avatarfull),
                profileurl = VALUES(profileurl),
                last_login = NOW()
        ");
        $stmt->execute([$steamid, $personaname, $avatarfull, $profileurl]);

        // Atribuir badge inicial de login se for a primeira vez
        BadgeService::checkAndAwardBadges($steamid, $db);
    }

    public static function saveUserGame($steamid, $appid, $playtime, $unlocked, $total, $percent, $db)
    {
        // Garantir que o jogo existe na tabela games (básico)
        $stmt = $db->prepare("INSERT IGNORE INTO games (appid, name) VALUES (?, 'Unknown')");
        $stmt->execute([$appid]);

        // Salvar relação
        $stmt = $db->prepare("
            INSERT INTO user_games (steamid, appid, playtime_forever, unlocked_achievements, total_achievements, completion_percentage)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                playtime_forever = VALUES(playtime_forever),
                unlocked_achievements = VALUES(unlocked_achievements),
                total_achievements = VALUES(total_achievements),
                completion_percentage = VALUES(completion_percentage)
        ");
        $stmt->execute([$steamid, $appid, $playtime, $unlocked, $total, $percent]);

        // Verificar badges após atualizações importantes (ex: platinou)
        if ($percent == 100) {
            BadgeService::checkAndAwardBadges($steamid, $db);
        }
    }
}
?>
