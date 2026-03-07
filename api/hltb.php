<?php
// api/hltb.php
require_once 'db.php';
header('Content-Type: application/json');

$gamename = $_GET['gamename'] ?? '';
$appid = $_GET['appid'] ?? '';

if (!$gamename && !$appid) {
    http_response_code(400);
    echo json_encode(['error' => 'App ID or game name is required']);
    exit;
}

// 1. Check cache if appid provided
if ($appid) {
    $stmt = $pdo->prepare("SELECT hltb_main, hltb_complete FROM game_details WHERE appid = ? AND hltb_main IS NOT NULL");
    $stmt->execute([$appid]);
    $row = $stmt->fetch();
    
    if ($row && $row['hltb_main']) {
        echo json_encode([
            'found' => true,
            'cached' => true,
            'mainStory' => $row['hltb_main'],
            'completionist' => $row['hltb_complete'] ?: ($row['hltb_main'] * 2)
        ]);
        exit;
    }
}

$gamename = $gamename ?: "appid {$appid}"; 

function searchHLTB($gameName) {
    $url = 'https://howlongtobeat.com/api/search';
    
    $payload = json_encode([
        'searchType' => 'games',
        'searchTerms' => explode(' ', $gameName),
        'searchPage' => 1,
        'size' => 5,
        'searchOptions' => [
            'games' => [
                'userId' => 0,
                'platform' => '',
                'sortCategory' => 'popular',
                'rangeCategory' => 'main',
                'rangeTime' => ['min' => null, 'max' => null],
                'gameplay' => ['perspective' => '', 'flow' => '', 'genre' => ''],
                'rangeYear' => ['min' => '', 'max' => ''],
                'modifier' => ''
            ],
            'users' => ['sortCategory' => 'postcount'],
            'filter' => '',
            'sort' => 0,
            'randomizer' => 0
        ]
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36',
        'Referer: https://howlongtobeat.com/',
        'Origin: https://howlongtobeat.com'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // HLTB sometimes blocks basic scrapers (403). We fail gracefully.
    if ($result && $httpCode === 200) {
        $data = json_decode($result, true);
        if (isset($data['data']) && count($data['data']) > 0) {
            $game = $data['data'][0];
            $main = isset($game['comp_main']) ? round($game['comp_main'] / 3600) : null;
            $comp = isset($game['comp_100']) ? round($game['comp_100'] / 3600) : ($main ? $main * 2 : null);
            
            if ($main) {
                return [
                    'found' => true,
                    'name' => $game['game_name'],
                    'mainStory' => $main,
                    'completionist' => $comp
                ];
            }
        }
    }
    return ['found' => false];
}

$cleanName = trim(preg_replace('/[™®©]|\s*[-–—:]\s*(Definitive|Special|Complete|GOTY|Game of the Year|Remastered|Enhanced|Anniversary|Ultimate|Deluxe|Gold|Premium|Standard|Legacy|Extended|Director\'s Cut).*$/i', '', $gamename));
$cleanName = trim(preg_replace('/\s*\(.*?\)/', '', $cleanName));

$result = searchHLTB($cleanName);

if ($result['found'] && $appid) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO game_details (appid, hltb_main, hltb_complete, last_updated)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
            hltb_main = VALUES(hltb_main),
            hltb_complete = VALUES(hltb_complete),
            last_updated = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$appid, $result['mainStory'], $result['completionist']]);
    } catch(PDOException $e) {
        // ignore unique constraint / caching errors, we still return the values
    }
}

echo json_encode($result);
?>
