<?php
// api/db.php
$host = 'localhost';
$dbname = 'sae_steam_cache';
$username = 'root';
$password = '';
$ports = [3306, 3307, 3308]; // Lista de portas comuns no XAMPP/WAMP
$connected = false;
$lastError = '';

foreach ($ports as $port) {
    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $connected = true;
        break; // Sucesso!
    } catch(PDOException $e) {
        $lastError = $e->getMessage();
        continue; // Tenta a próxima porta
    }
}

if (!$connected) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed. MySQL might be offline.',
        'help' => 'Certifique-se que o MySQL está ATIVO (verde) no Painel do XAMPP.',
        'details' => $lastError
    ]));
}
?>
