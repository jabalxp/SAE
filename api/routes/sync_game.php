<?php
// api/routes/sync_game.php
require_once '../config/db.php';
require_once '../utils/helpers.php';
require_once '../services/UserService.php';

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS')
    exit;

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['steamid'], $data['appid'])) {
    jsonError("Dados incompletos", 400);
}

try {
    $db = Database::getConnection();

    UserService::saveUserGame(
        $data['steamid'],
        $data['appid'],
        $data['playtime'] ?? 0,
        $data['unlocked'] ?? 0,
        $data['total'] ?? 0,
        $data['percent'] ?? 0,
        $db
    );

    jsonResponse(['success' => true]);

}
catch (Exception $e) {
    jsonError($e->getMessage(), 500);
}
?>
