// api/routes/proxy.php
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

require_once '../utils/helpers.php';
require_once '../services/SteamService.php';

header('Content-Type: application/json');


$endpoint = $_GET['endpoint'] ?? null;
if (!$endpoint) {
    jsonError('Endpoint required', 400);
}

// Remove o endpoint dos parametros para repassar o resto a porta da Steam
$params = $_GET;
unset($params['endpoint']);

// Crie uma instância modificada ou adicione um método puro no SteamService
class SteamProxyService
{
    private $apiKey = '8B07FE7C9405216BF61C1F439E93922B'; // Igual ao SteamService original
    private $baseUrl = 'https://api.steampowered.com';

    public function proxyRequest($endpoint, $params)
    {
        $params['key'] = $this->apiKey;
        $queryString = http_build_query($params);
        $url = "{$this->baseUrl}/{$endpoint}/?{$queryString}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        // SSL Verify false para evitar erros de certificado no XAMPP local
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return ['error' => true, 'message' => "Steam API erro $httpCode", 'curl_error' => $error, 'url' => $url];
        }

        return json_decode($response, true) ?? ['error' => true, 'message' => 'Invalid JSON from Steam'];
    }
}

$proxy = new SteamProxyService();
$data = $proxy->proxyRequest($endpoint, $params);

// Retorna os dados como estão para o JS achar que é a Steam API direta
if (isset($data['error']) && $data['error'] === true) {
    jsonResponse($data, 500);
}

jsonResponse($data);
?>
