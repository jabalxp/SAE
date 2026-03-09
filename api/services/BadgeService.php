<?php
// api/services/BadgeService.php

class BadgeService
{
    public static function checkAndAwardBadges($steamid, $db)
    {
        // Buscar todas as badges disponíveis
        $stmt = $db->query("SELECT * FROM site_badges");
        $allBadges = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Buscar badges que o usuário já tem
        $stmt = $db->prepare("SELECT badge_id FROM user_badges WHERE steamid = ?");
        $stmt->execute([$steamid]);
        $userBadges = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Coletar estatísticas do usuário no banco
        // 1. Total de Platinas (jogos com 100%)
        $stmt = $db->prepare("SELECT COUNT(*) FROM user_games WHERE steamid = ? AND completion_percentage = 100");
        $stmt->execute([$steamid]);
        $totalPlats = $stmt->fetchColumn();

        // 2. Total de Conquistas
        $stmt = $db->prepare("SELECT SUM(unlocked_achievements) FROM user_games WHERE steamid = ?");
        $stmt->execute([$steamid]);
        $totalAchievs = $stmt->fetchColumn() ?: 0;

        foreach ($allBadges as $badge) {
            // Pular se o usuário já tem
            if (in_array($badge['id'], $userBadges))
                continue;

            $awarded = false;
            switch ($badge['criteria_type']) {
                case 'platinums':
                    if ($totalPlats >= $badge['criteria_value'])
                        $awarded = true;
                    break;
                case 'achievements':
                    if ($totalAchievs >= $badge['criteria_value'])
                        $awarded = true;
                    break;
                case 'login':
                    $awarded = true; // Badge básica por existir no site
                    break;
            }

            if ($awarded) {
                $stmt = $db->prepare("INSERT IGNORE INTO user_badges (steamid, badge_id) VALUES (?, ?)");
                $stmt->execute([$steamid, $badge['id']]);
            }
        }
    }
}
?>
