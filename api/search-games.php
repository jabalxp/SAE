<?php
// api/search-games.php
header('Content-Type: application/json');

$term = $_GET['term'] ?? '';

if (!$term) {
    http_response_code(400);
    echo json_encode(['error' => 'Term is required']);
    exit;
}

$url = "https://store.steampowered.com/api/storesearch/?term=" . urlencode($term) . "&l=english&cc=US";
$response = @file_get_contents($url);

if ($response) {
    $data = json_decode($response, true);
    if (isset($data['items'])) {
        $games = array_map(function($item) {
            return [
                'appid' => $item['id'],
                'name' => $item['name'],
                'cover' => $item['tiny_image']
            ];
        }, $data['items']);
        echo json_encode($games);
        exit;
    }
}

echo json_encode([]);
?>
