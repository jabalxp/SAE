<?php
// api/routes/metacritic.php
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

// Em vez de raspar o Metacritic (o que é pesado e bloqueia IP fácil),
// Usamos o Endpoint Público da própria Loja da Steam que informa a nota oficial do jogo
$storeUrl = "https://store.steampowered.com/api/appdetails?appids={$appId}&filters=metacritic";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $storeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    $data = json_decode($response, true);

    // Verifica se o jogo existe e tem a chave de metacritic
    if (isset($data[$appId]['success']) && $data[$appId]['success']) {
        $gameData = $data[$appId]['data'];

        if (isset($gameData['metacritic'])) {
            jsonResponse([
                'found' => true,
                'score' => $gameData['metacritic']['score'],
                'url' => $gameData['metacritic']['url']
            ]);
            exit;
        }
    }
}

// Caso a Steam não tenha nota registrada para este jogo
jsonResponse(['found' => false]);
?>
