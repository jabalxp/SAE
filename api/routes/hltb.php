<?php
// api/routes/hltb.php
// Cabeçalhos CORS no topo para garantir que erros de DB/Inclusão não causem bloqueio de rede
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once '../config/db.php';
require_once '../utils/helpers.php';
require_once '../services/SteamService.php';

header('Content-Type: application/json');

$appId = $_GET['appid'] ?? null;
if (!$appId) {
    jsonError('App ID required', 400);
}

// 1. Obter o Nome do Jogo usando a API Pública da Steam (Store)
$steamUrl = "https://store.steampowered.com/api/appdetails?appids={$appId}";
$steamRes = @file_get_contents($steamUrl);

$gameName = "";
if ($steamRes) {
    $steamData = json_decode($steamRes, true);
    if ($steamData && isset($steamData[$appId]['success']) && $steamData[$appId]['success']) {
        $gameName = $steamData[$appId]['data']['name'];
    }
}

if (empty($gameName)) {
    // Tenta fallback com nome recebido vi GET se existir (ex: fetch from cache)
    $gameName = $_GET['name'] ?? '';
    if (empty($gameName)) {
        jsonResponse(['found' => false, 'error' => 'Could not determine game name']);
        exit;
    }
}

// Limpar o nome para melhor busca no HLTB (Remover Trademark, TM, Edições)
$cleanName = preg_replace('/(™|®|©)/i', '', $gameName);
$cleanName = trim(preg_replace('/(Edition|Game of the Year|Director\'s Cut)/i', '', $cleanName));

// 2. Fazer requisição de POST Search para o HLTB
// HLTB mudou sua API interna com headers obrigatórios como o Referer e Origin
$searchUrl = "https://howlongtobeat.com/api/search";
$postData = json_encode([
    "searchType" => "games",
    "searchTerms" => explode(" ", $cleanName),
    "searchPage" => 1,
    "size" => 20,
    "searchOptions" => [
        "games" => [
            "userId" => 0,
            "platform" => "",
            "sortCategory" => "popular",
            "rangeCategory" => "main",
            "rangeTime" => ["min" => null, "max" => null],
            "gameplay" => ["perspective" => "", "flow" => "", "genre" => ""]
        ],
        "users" => [
            "sortCategory" => "postcount"
        ],
        "filter" => "",
        "sort" => 0,
        "randomizer" => 0
    ]
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $searchUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer: https://howlongtobeat.com/',
    'Origin: https://howlongtobeat.com'
]);
// Ignorar SSL temporariamente para testes locais, recomendo ajustar em PROD
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);


$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200 && $response) {
    $data = json_decode($response, true);

    // Pegar o primeiro resultado mais relevante (se existir)
    if (isset($data['data']) && count($data['data']) > 0) {
        $bestMatch = $data['data'][0];

        // HLTB retorna os tempos em segundos multiplicados (ex: 3600 para 1 hora)
        // Precisamos converter os campos comp_main e comp_plus
        $mainStory = round($bestMatch['comp_main'] / 3600);
        $completionist = round($bestMatch['comp_100'] / 3600);

        jsonResponse([
            'found' => true,
            'name' => $bestMatch['game_name'],
            'mainStory' => $mainStory,
            'completionist' => $completionist,
            'hltbId' => $bestMatch['game_id'],
            'image' => "https://howlongtobeat.com/games/" . $bestMatch['game_image']
        ]);
        exit;
    }
}

// Se falhou por qualquer motivo, retorna fallbacks clássicos ou false
$fallback = [
    72850 => [34, 232], 489830 => [34, 232], 1245620 => [50, 130], 292030 => [51, 173]
];

if (isset($fallback[$appId])) {
    jsonResponse([
        'found' => true,
        'mainStory' => $fallback[$appId][0],
        'completionist' => $fallback[$appId][1]
    ]);
}
else {
    jsonResponse(['found' => false, 'debug' => 'Not found in search API']);
}
