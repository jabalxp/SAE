<?php
// api/routes/leaderboard.php
require_once '../config/db.php';
require_once '../utils/helpers.php';

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

try {
    $db = Database::getConnection();

    // Buscar Top 50 usuários por Platinas (jogos com 100%)
    // Contamos na tabela user_games onde completion_percentage = 100
    $query = "
        SELECT 
            u.steamid, 
            u.personaname, 
            u.avatarfull,
            COUNT(ug.id) as platinums,
            SUM(ug.unlocked_achievements) as total_achievements
        FROM users u
        LEFT JOIN user_games ug ON u.steamid = ug.steamid AND ug.completion_percentage = 100
        GROUP BY u.steamid
        ORDER BY platinums DESC, total_achievements DESC
        LIMIT 50
    ";

    $stmt = $db->query($query);
    $rankings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse([
        'success' => true,
        'data' => $rankings
    ]);

}
catch (Exception $e) {
    jsonError($e->getMessage(), 500);
}
?>
