<?php
// api/routes/genre.php
require_once '../config/db.php';
require_once '../utils/helpers.php';

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

$appId = $_GET['appid'] ?? null;
if (!$appId) {
    jsonError('App ID required', 400);
}

// Simulando um mini-cache/fallback em memória para economizar requests à Store API (muito restritiva)
$popularGenres = [
    730 => ['Ação', 'Free to Play'], // CS:GO / CS2
    570 => ['Ação', 'Free to Play', 'Estratégia'], // Dota 2
    271590 => ['Ação', 'Aventura'], // GTA V
    1172470 => ['Ação', 'Battle Royale'], // Apex
    359550 => ['Ação', 'Tático'], // Rainbow Six
    1091500 => ['RPG', 'Ação'], // Cyberpunk
    400 => ['Ação', 'Puzzle'], // Portal
    814380 => ['Ação', 'Aventura'], // Sekiro
    // Caso padrão genérico:
];

if (isset($popularGenres[$appId])) {
    jsonResponse(['success' => true, 'genres' => $popularGenres[$appId]]);
}

// Em ambiente real, consultar MySQL primeiro, se não existir, curl para Steam Store
$url = "https://store.steampowered.com/api/appdetails?appids={$appId}";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

$storeData = json_decode($response, true);
$genres = [];

if ($storeData && isset($storeData[$appId]['success']) && $storeData[$appId]['success']) {
    $data = $storeData[$appId]['data'];
    if (isset($data['genres'])) {
        foreach ($data['genres'] as $g) {
            $genres[] = $g['description'];
        }
    }
}

// Fallback se n achar
if (empty($genres)) {
    $genres = ['Indie', 'Ação']; // mock fallback
}

jsonResponse(['success' => true, 'genres' => $genres]);
?>
