<?php
// api/requirements.php
header('Content-Type: application/json');

$appid = isset($_GET['appid']) ? (int)$_GET['appid'] : 0;
if ($appid <= 0) {
    echo json_encode(['error' => 'AppID inválido']);
    exit;
}

// Buscar dados da Steam Store API
$url = "https://store.steampowered.com/api/appdetails?appids=$appid&l=brazilian";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!isset($data[$appid]['success']) || !$data[$appid]['success']) {
    echo json_encode(['error' => 'Jogo não encontrado']);
    exit;
}

$game = $data[$appid]['data'];
$requirements = [
    'name' => $game['name'],
    'header_image' => $game['header_image'],
    'pc_requirements' => [
        'minimum' => $game['pc_requirements']['minimum'] ?? '',
        'recommended' => $game['pc_requirements']['recommended'] ?? ''
    ]
];

// Função auxiliar para tentar extrair specs estruturadas do HTML da Steam
function parseSpecs($html) {
    $specs = [
        'cpu' => 'Não informado',
        'gpu' => 'Não informado',
        'ram' => 'Não informado',
        'os' => 'Não informado'
    ];
    
    if (empty($html)) return $specs;
    
    // Regex simples para capturar campos comuns
    if (preg_match('/Processador:<\/strong>\s*([^<]+)/i', $html, $m)) $specs['cpu'] = trim($m[1]);
    elseif (preg_match('/Processor:<\/strong>\s*([^<]+)/i', $html, $m)) $specs['cpu'] = trim($m[1]);
    
    if (preg_match('/Placa de vídeo:<\/strong>\s*([^<]+)/i', $html, $m)) $specs['gpu'] = trim($m[1]);
    elseif (preg_match('/Graphics:<\/strong>\s*([^<]+)/i', $html, $m)) $specs['gpu'] = trim($m[1]);
    
    if (preg_match('/Memória:<\/strong>\s*(\d+)/i', $html, $m)) $specs['ram'] = trim($m[1]) . ' GB';
    elseif (preg_match('/Memory:<\/strong>\s*(\d+)/i', $html, $m)) $specs['ram'] = trim($m[1]) . ' GB';

    if (preg_match('/SO:<\/strong>\s*([^<]+)/i', $html, $m)) $specs['os'] = trim($m[1]);
    
    return $specs;
}

$requirements['structured'] = [
    'minimum' => parseSpecs($requirements['pc_requirements']['minimum']),
    'recommended' => parseSpecs($requirements['pc_requirements']['recommended'])
];

echo json_encode($requirements);
