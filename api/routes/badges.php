<?php
// api/routes/badges.php
require_once '../config/db.php';
require_once '../utils/helpers.php';

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

$steamid = $_GET['steamid'] ?? null;

if (!$steamid) {
    jsonError("SteamID é obrigatório", 400);
}

try {
    $db = Database::getConnection();

    // Buscar badges que o usuário já conquistou
    $query = "
        SELECT 
            sb.badge_key, 
            sb.name, 
            sb.description, 
            sb.icon
        FROM user_badges ub
        JOIN site_badges sb ON ub.badge_id = sb.id
        WHERE ub.steamid = ?
        ORDER BY ub.unlocked_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([$steamid]);
    $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Se não tiver badges, vamos tentar rodar uma verificação rápida (opcional aqui, melhor no sync)

    jsonResponse([
        'success' => true,
        'data' => $badges
    ]);

}
catch (Exception $e) {
    jsonError($e->getMessage(), 500);
}
?>
