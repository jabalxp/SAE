<?php
// Configurações de Banco e API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$db   = 'steam_explorer';
$user = 'root';     // Seu usuário do MySQL (padrão do XAMPP é root)
$pass = '';         // Sua senha do MySQL (padrão do XAMPP é vazio)
$charset = 'utf8mb4';

$steam_api_key = '8B07FE7C9405216BF61C1F439E93922B';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Erro de conexão com Banco de Dados: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// -------------------------------------------------------
// ROTA 1: BUSCAR PERFIL (Inteligente: Cache ou Live)
// -------------------------------------------------------
if ($action === 'get_profile') {
    $input = $_GET['query'] ?? '';
    
    // 1. Resolver ID se não for numérico
    $steamId = $input;
    if (!is_numeric($input)) {
        $vanity = str_replace(['https://steamcommunity.com/id/', '/'], '', $input);
        $url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=$steam_api_key&vanityurl=$vanity";
        $json = file_get_contents($url);
        $data = json_decode($json, true);
        if ($data['response']['success'] == 1) {
            $steamId = $data['response']['steamid'];
        } else {
            echo json_encode(['error' => 'Usuário não encontrado']);
            exit;
        }
    }

    // 2. Verificar se existe no Banco de Dados (Cache Local)
    // Se os dados tiverem menos de 24h, usamos o banco!
    $stmt = $pdo->prepare("SELECT * FROM users WHERE steam_id = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    $stmt->execute([$steamId]);
    $cachedUser = $stmt->fetch();

    if ($cachedUser) {
        // -- BUSCAR DO BANCO --
        $gamesStmt = $pdo->prepare("SELECT app_id as appid, name, playtime_forever, achievements_total as total, achievements_unlocked as unlocked, completion_percent as percent, has_stats FROM user_games WHERE steam_id = ? ORDER BY playtime_forever DESC");
        $gamesStmt->execute([$steamId]);
        $games = $gamesStmt->fetchAll();

        echo json_encode([
            'source' => 'database', // Flag para debug
            'user' => [
                'steamid' => $cachedUser['steam_id'],
                'personaname' => $cachedUser['personaname'],
                'avatarfull' => $cachedUser['avatar_url']
            ],
            'games' => $games
        ]);
    } else {
        // -- BUSCAR DA STEAM API (Primeira vez ou desatualizado) --
        
        // A) Perfil
        $profileUrl = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=$steam_api_key&steamids=$steamId";
        $profileData = json_decode(file_get_contents($profileUrl), true);
        $p = $profileData['response']['players'][0] ?? null;

        if (!$p) { echo json_encode(['error' => 'Perfil privado ou erro API']); exit; }

        // Salva/Atualiza Usuário
        $upsertUser = $pdo->prepare("INSERT INTO users (steam_id, personaname, avatar_url, last_updated) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE personaname=?, avatar_url=?, last_updated=NOW()");
        $upsertUser->execute([$p['steamid'], $p['personaname'], $p['avatarfull'], $p['personaname'], $p['avatarfull']]);

        // B) Jogos
        $gamesUrl = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=$steam_api_key&steamid=$steamId&include_appinfo=true&format=json";
        $gamesData = json_decode(file_get_contents($gamesUrl), true);
        $gamesList = $gamesData['response']['games'] ?? [];

        $responseGames = [];
        
        // Prepara inserção em massa (mais rápido)
        $insertGame = $pdo->prepare("INSERT INTO user_games (steam_id, app_id, name, playtime_forever) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE playtime_forever=VALUES(playtime_forever)");

        foreach ($gamesList as $g) {
            $insertGame->execute([$steamId, $g['appid'], $g['name'], $g['playtime_forever']]);
            
            $responseGames[] = [
                'appid' => $g['appid'],
                'name' => $g['name'],
                'playtime_forever' => $g['playtime_forever'],
                'percent' => -1, // Ainda não sabemos as conquistas
                'has_stats' => 0
            ];
        }

        echo json_encode([
            'source' => 'steam_api',
            'user' => $p,
            'games' => $responseGames
        ]);
    }
}

// -------------------------------------------------------
// ROTA 2: SALVAR ESTATÍSTICAS (Chamada pelos Workers JS)
// -------------------------------------------------------
if ($action === 'update_stats') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data) {
        $stmt = $pdo->prepare("UPDATE user_games SET achievements_total=?, achievements_unlocked=?, completion_percent=?, has_stats=1 WHERE steam_id=? AND app_id=?");
        $stmt->execute([
            $data['total'], 
            $data['unlocked'], 
            $data['percent'], 
            $data['steamId'], 
            $data['appId']
        ]);
        echo json_encode(['status' => 'saved']);
    }
}
?>