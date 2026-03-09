<?php
// api/routes/achievements.php
// Simplificado para responder ao request fetchGameStats do frontend e do modal

require_once '../config/db.php';
require_once '../utils/helpers.php';
require_once '../services/SteamService.php';

header('Content-Type: application/json');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

$steamId = $_GET['steamid'] ?? null;
$appId = $_GET['appid'] ?? null;
$detailed = isset($_GET['detailed']) && $_GET['detailed'] == 'true';

if (!$steamId || !$appId) {
    jsonError('Steam ID e App ID são necessários', 400);
}

$steamService = new SteamService();

// Busca as estatisticas do jogador
$playerStats = $steamService->getPlayerAchievements($steamId, $appId);

if (!$playerStats && !$detailed) {
    // Para a query da grid do frontend que espera esse formato:
    jsonError('Jogo não possui conquistas ou stats ocultos', 404);
}

// O frontend em `fetchGameStats` espera o formato "Steam API brutão" que ele parseia:
// Ex: { playerstats: { achievements: [ {apiname, achieved...} ] } }
// Então devolvemos exatamente nesse formato para manter 100% de compatibilidade e não quebrar `assets/js/main.js`.
if (!$detailed) {
    jsonResponse(['playerstats' => $playerStats]);
}

// Se for $detailed, estamos gerando o dado para o modal com Porcentagens Globais (igual o endpoint /api/achievements/:steamId/:appId do Node)
$achievements = $playerStats['achievements'] ?? [];

// Global percentages (opcional, ignora falhas)
$globalPercentages = [];
$globalData = $steamService->getGlobalAchievementPercentages($appId);
if (!empty($globalData)) {
    foreach ($globalData as $item) {
        $globalPercentages[$item['name']] = $item['percent'];
    }
}

$detailedAchievements = [];
$unlocked = 0;
foreach ($achievements as $a) {
    $apiname = $a['apiname'];
    $achieved = isset($a['achieved']) && $a['achieved'] == 1;
    if ($achieved)
        $unlocked++;

    $detailedAchievements[] = [
        'apiname' => $apiname,
        'name' => $a['name'] ?? $apiname,
        'achieved' => $achieved,
        'unlocktime' => $a['unlocktime'] ?? 0,
        'percent' => $globalPercentages[$apiname] ?? null
    ];
}

$total = count($detailedAchievements);

jsonResponse([
    'gameName' => $playerStats['gameName'] ?? '',
    'steamId' => $steamId,
    'appId' => $appId,
    'achievements' => $detailedAchievements,
    'unlocked' => $unlocked,
    'total' => $total,
    'percent' => $total > 0 ? floor(($unlocked / $total) * 100) : 0
]);
?>
