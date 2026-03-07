<?php
// api/profile.php
require_once 'db.php';

header('Content-Type: application/json');

$STEAM_API_KEY = "388481A4CB861D3BFC4AD24760EA57B8"; 
$query = $_GET['query'] ?? '';

if (!$query) {
    http_response_code(400);
    echo json_encode(["error" => "Steam ID or Vanity URL required"]);
    exit;
}

// 1. Resolve Vanity URL to SteamID like Node.js
function getSteamId($query, $apiKey) {
    if (is_numeric($query) && strlen($query) === 17) {
        return $query;
    }
    $url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key={$apiKey}&vanityurl={$query}";
    $res = @file_get_contents($url);
    if ($res) {
        $data = json_decode($res, true);
        if (isset($data['response']['success']) && $data['response']['success'] === 1) {
            return $data['response']['steamid'];
        }
    }
    return null;
}

$steamId = getSteamId($query, $STEAM_API_KEY);
if (!$steamId) {
    http_response_code(404);
    echo json_encode(["error" => "User not found. Please verify the Steam ID or Custom URL."]);
    exit;
}

// 2. Fetch User Profile
$profileUrl = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={$STEAM_API_KEY}&steamids={$steamId}";
$profileData = @file_get_contents($profileUrl);
$playerInfo = json_decode($profileData, true)['response']['players'][0] ?? null;

if (!$playerInfo) {
    http_response_code(404);
    echo json_encode(["error" => "Could not retrieve user profile."]);
    exit;
}

// Fetch User Level
$levelUrl = "http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key={$STEAM_API_KEY}&steamid={$steamId}";
$levelData = @file_get_contents($levelUrl);
$level = json_decode($levelData, true)['response']['player_level'] ?? 0;

// Update profile in DB
$stmt = $pdo->prepare("
    INSERT INTO user_profiles (steam_id, personaname, avatar_url, profile_url, last_updated)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
    personaname = VALUES(personaname),
    avatar_url = VALUES(avatar_url),
    profile_url = VALUES(profile_url),
    last_updated = CURRENT_TIMESTAMP
");
$stmt->execute([$steamId, $playerInfo['personaname'], $playerInfo['avatarfull'], $playerInfo['profileurl']]);

// 3. Fetch Owned Games
$gamesUrl = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={$STEAM_API_KEY}&steamid={$steamId}&format=json&include_appinfo=1&include_played_free_games=1";
$gamesData = @file_get_contents($gamesUrl);
$gamesList = json_decode($gamesData, true)['response']['games'] ?? [];

// Sort games by playtime
usort($gamesList, function($a, $b) {
    return $b['playtime_forever'] <=> $a['playtime_forever'];
});

// Take top 100 for performance limits
$gamesList = array_slice($gamesList, 0, 100); 

// Load cached games
$stmt = $pdo->prepare("SELECT appid, playtime_forever, percent, unlocked, total, has_achievements FROM user_games WHERE steam_id = ?");
$stmt->execute([$steamId]);
$cachedGames = $stmt->fetchAll();
$dbGamesMap = [];
foreach ($cachedGames as $row) {
    $dbGamesMap[$row['appid']] = $row;
}

$needsUpdate = []; // Array of appids to fetch achievements

foreach ($gamesList as $game) {
    $appid = $game['appid'];
    $playtime = $game['playtime_forever'];
    $name = $game['name'] ?? 'Unknown Game';

    if (!isset($game['has_community_visible_stats']) || !$game['has_community_visible_stats']) {
        // Save as 0 / no stats
        $pdo->prepare("
            INSERT INTO user_games (steam_id, appid, name, playtime_forever, percent, unlocked, total, has_achievements, last_updated)
            VALUES (?, ?, ?, ?, 0, 0, 0, 0, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE playtime_forever = VALUES(playtime_forever)
        ")->execute([$steamId, $appid, $name, $playtime]);
        continue;
    }

    $cached = $dbGamesMap[$appid] ?? null;
    if (!$cached || (int)$cached['playtime_forever'] < (int)$playtime || $cached['percent'] == -1) {
        $needsUpdate[] = $game;
    }
}

// 4. Parallel Curl for Achievements
$mh = curl_multi_init();
$curl_handles = [];

foreach ($needsUpdate as $game) {
    $url = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={$game['appid']}&key={$STEAM_API_KEY}&steamid={$steamId}";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $curl_handles[$game['appid']] = $ch;
    curl_multi_add_handle($mh, $ch);
}

// Execute parallel requests
if (count($curl_handles) > 0) {
    $active = null;
    do {
        $status = curl_multi_exec($mh, $active);
        if ($active) {
            curl_multi_select($mh);
        }
    } while ($active && $status == CURLM_OK);
}

// Process results
foreach ($needsUpdate as $game) {
    $appid = $game['appid'];
    $playtime = $game['playtime_forever'];
    $name = $game['name'] ?? 'Unknown Game';
    
    $ch = $curl_handles[$appid];
    $response = curl_multi_getcontent($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resObj = json_decode($response, true);
        if (isset($resObj['playerstats']['success']) && $resObj['playerstats']['success']) {
            $achievements = $resObj['playerstats']['achievements'] ?? [];
            if (count($achievements) > 0) {
                $unlockedCount = 0;
                $totalCount = count($achievements);
                foreach ($achievements as $ach) {
                    if ($ach['achieved'] == 1) $unlockedCount++;
                }
                $percent = round(($unlockedCount / $totalCount) * 100);

                $pdo->prepare("
                    INSERT INTO user_games (steam_id, appid, name, playtime_forever, percent, unlocked, total, has_achievements, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE 
                    playtime_forever = VALUES(playtime_forever),
                    percent = VALUES(percent),
                    unlocked = VALUES(unlocked),
                    total = VALUES(total),
                    has_achievements = 1,
                    last_updated = CURRENT_TIMESTAMP
                ")->execute([$steamId, $appid, $name, $playtime, $percent, $unlockedCount, $totalCount]);

            } else {
                // Total is 0
                $pdo->prepare("
                    INSERT INTO user_games (steam_id, appid, name, playtime_forever, percent, unlocked, total, has_achievements, last_updated)
                    VALUES (?, ?, ?, ?, 0, 0, 0, 0, CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE playtime_forever = VALUES(playtime_forever), percent=0, unlocked=0, total=0, has_achievements=0, last_updated=CURRENT_TIMESTAMP
                ")->execute([$steamId, $appid, $name, $playtime]);
            }
        }
    } else {
        // Error or hidden achievements
        $pdo->prepare("
            INSERT INTO user_games (steam_id, appid, name, playtime_forever, percent, unlocked, total, has_achievements, last_updated)
            VALUES (?, ?, ?, ?, 0, 0, 0, 0, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE playtime_forever = VALUES(playtime_forever), percent=0, unlocked=0, total=0, has_achievements=0, last_updated=CURRENT_TIMESTAMP
        ")->execute([$steamId, $appid, $name, $playtime]);
    }
}
curl_multi_close($mh);

// 5. Build final dataset to return
$stmt = $pdo->prepare("SELECT * FROM user_games WHERE steam_id = ? ORDER BY playtime_forever DESC");
$stmt->execute([$steamId]);
$finalGames = $stmt->fetchAll();

// Calculate total XP (using all cached games)
$stmt = $pdo->prepare("SELECT SUM(total) as xp_base, SUM(percent) as xp_bonus FROM user_games WHERE steam_id = ? AND has_achievements = 1");
$stmt->execute([$steamId]);
$xpRow = $stmt->fetch();
$dbXp = isset($xpRow['xp_bonus']) ? round($xpRow['xp_bonus'] * 10) : 0; // matching old percent*10 logic

$totalXp = ($level * 100) + $dbXp;

// Update user_xp
$pdo->prepare("
    INSERT INTO user_xp (steam_id, level, xp, last_updated)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE level = VALUES(level), xp = VALUES(xp), last_updated = CURRENT_TIMESTAMP
")->execute([$steamId, $level, $totalXp]);

$playerInfo['level'] = $level;
$playerInfo['total_xp'] = $totalXp;

// Prepare stats for UI
$totalPlaytime = 0;
$totalPercent = 0;
$gamesWithAch = 0;

foreach ($finalGames as $g) {
    if ($g['has_achievements'] && $g['percent'] >= 0) {
        $totalPercent += $g['percent'];
        $gamesWithAch++;
    }
    $totalPlaytime += $g['playtime_forever'];
}

$avgCompletion = $gamesWithAch > 0 ? round($totalPercent / $gamesWithAch, 1) : 0;
$totalHours = round($totalPlaytime / 60, 1);

// Final games format aligned with original JS
$formattedGames = array_map(function($g) {
    return [
        'appid' => $g['appid'],
        'name' => $g['name'],
        'playtime_forever' => $g['playtime_forever'],
        'stats' => $g['has_achievements'] ? [
            'percent' => $g['percent'],
            'unlocked' => $g['unlocked'],
            'total' => $g['total']
        ] : null,
        'has_community_visible_stats' => $g['has_achievements'] == 1
    ];
}, $finalGames);

echo json_encode([
    'player' => $playerInfo,
    'stats' => [
        'avg_completion' => $avgCompletion,
        'total_hours' => $totalHours,
        'total_games' => count($finalGames)
    ],
    'games' => $formattedGames
]);
?>
