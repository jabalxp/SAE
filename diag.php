<?php
// diag.php
// Script de diagnóstico para SAE - Steam Achievement Explorer
// Acesse este arquivo via navegador para testar sua hospedagem

header('Content-Type: text/html; charset=utf-8');
echo "<h1>Diagnóstico do Sistema SAE</h1>";

// 1. Teste de PHP
echo "<h3>1. Ambiente PHP</h3>";
echo "Versão PHP: " . PHP_VERSION . "<br>";
echo "cURL instalado: " . (function_exists('curl_init') ? "✅ Sim" : "❌ Não") . "<br>";
echo "PDO MySQL instalado: " . (in_array('mysql', PDO::getAvailableDrivers()) ? "✅ Sim" : "❌ Não") . "<br>";

// 2. Teste de Conexão com Banco de Dados
echo "<h3>2. Banco de Dados</h3>";
require_once 'api/config/db.php';
try {
    $db = Database::getConnection();
    echo "✅ Conexão com MySQL estabelecida com sucesso!<br>";
}
catch (Exception $e) {
    echo "❌ Falha na conexão com banco de dados: " . $e->getMessage() . "<br>";
    echo "<i>Dica: Verifique os dados em api/config/db.php. No InfinityFree, o host não é 'localhost'.</i><br>";
}

// 3. Teste de Conexão com Steam API (cURL)
echo "<h3>3. Conexão Externa (Steam API)</h3>";
$test_url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=X&steamids=76561197960435530";
$ch = curl_init($test_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
$res = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($http_code === 403 || $http_code === 200) {
    echo "✅ cURL está funcionando (Steam respondeu com código $http_code).<br>";
}
else {
    $err = curl_error($ch);
    echo "❌ cURL falhou (Código $http_code). Erro: $err<br>";
    echo "<i>Dica: Algumas hospedagens gratuitas bloqueiam conexões externas.</i><br>";
}
curl_close($ch);

// 4. Teste de URL Base
echo "<h3>4. Verificação de Caminhos</h3>";
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];
$base = substr($uri, 0, strrpos($uri, '/') + 1);
$api_url = $protocol . "://" . $host . $base . "api/routes/proxy.php";

echo "Sua URL Base detectada: " . $protocol . "://" . $host . $base . "<br>";
echo "Caminho da API esperado: " . $api_url . "<br>";

$proxy_exists = file_exists('api/routes/proxy.php');
echo "Arquivo proxy.php existe: " . ($proxy_exists ? "✅ Sim" : "❌ Não (Verifique se subiu a pasta api corretamente)") . "<br>";


echo "<hr><p>SAE Diagnostic Tool v1.0</p>";
?>
