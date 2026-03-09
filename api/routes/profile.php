<?php
// api/routes/profile.php
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

$query = $_GET['query'] ?? null;
if (!$query) {
    jsonError('Query (Steam ID ou Vanity URL) required', 400);
}

$steamService = new SteamService();
$steamId = $query;

// 1. Resolve Vanity URL se não for número
if (!is_numeric($query)) {
    // Tenta extrair id de URLs
    if (strpos($query, '/id/') !== false) {
        $parts = explode('/id/', $query);
        $vanity = explode('/', $parts[1])[0];
    }
    else {
        $vanity = $query;
    }

    $resolvedId = $steamService->resolveVanityUrl($vanity);
    if ($resolvedId) {
        $steamId = $resolvedId;
    }
    else {
        jsonError('Usuário não encontrado', 404);
    }
}

// 2. Buscar Dados do Perfil
$players = $steamService->getPlayerSummaries($steamId);
if (empty($players)) {
    jsonError('Perfil privado ou não encontrado', 404);
}
$user = $players[0];

// 3. Buscar Lista de Jogos
$games = $steamService->getOwnedGames($steamId, true);

// 4. Buscar Amigos
$friendsRefs = $steamService->getFriendList($steamId);
$friends = [];
$friendIds = [];
if (!empty($friendsRefs)) {
    foreach ($friendsRefs as $f) {
        $friendIds[] = $f['steamid'];
    }

    // Buscar detalhes dos amigos em lotes de 100
    $chunks = array_chunk($friendIds, 100);
    foreach ($chunks as $chunk) {
        $friendDetails = $steamService->getPlayerSummaries($chunk);
        $friends = array_merge($friends, $friendDetails);
    }
}

// 4. Salvar Usuário no Banco de Dados (Fase 3)
try {
    $db = Database::getConnection();
    require_once '../services/UserService.php';
    UserService::saveUser(
        $user['steamid'],
        $user['personaname'],
        $user['avatarfull'],
        $user['profileurl'],
        $db
    );

    // Opcionalmente salvar a lista de jogos básica (playtime)
    if (!empty($games)) {
        foreach ($games as $g) {
            UserService::saveUserGame(
                $user['steamid'],
                $g['appid'],
                $g['playtime_forever'],
                0, // unlocked inicial (o scan total virá do frontend)
                0, // total inicial
                0, // percent inicial
                $db
            );
        }
    }
}
catch (Exception $e) {
// Erro no banco não impede o retorno da API Steam
}

// Dados para a Engine do Frontend
$responseData = [
    'user' => $user,
    'games' => $games,
    'friends' => $friends,
    // O backend original Node.js processava achievements aqui, 
    // mas o frontend está apto a fazer via cache e fetchGameStats dinamicamente.
    // Retornamos um stats básico para não quebrar a UI antes da fila processar.
    'stats' => [
        'totalGames' => count($games),
        'totalPlatinum' => 0,
        'totalAchievements' => 0,
        'averageCompletion' => 0,
        'xp' => [
            'totalXp' => 0,
            'level' => 0,
            'xpForCurrentLevel' => 0,
            'xpForNextLevel' => 0
        ]
    ]
];

jsonResponse($responseData);
?>
