<?php
// api/config/db.php
// Configuração de conexão com o Banco de Dados MySQL

// Configurações Padrão (Local)
$is_local = ($_SERVER['REMOTE_ADDR'] === '127.0.0.1' || $_SERVER['REMOTE_ADDR'] === '::1');

if ($is_local) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'sae_db');
    define('DB_PORT', '3306');
}
else {
    // Estas configurações foram preenchidas com os dados do InfinityFree
    define('DB_HOST', 'sql306.infinityfree.com');
    define('DB_USER', 'if0_41347928');
    define('DB_PASS', 'steamtrack');
    define('DB_NAME', 'if0_41347928_sae_db'); // Nome padrão concatenado
    define('DB_PORT', '3306');
}

class Database
{
    private static $conn = null;

    public static function getConnection()
    {
        if (self::$conn === null) {
            try {
                self::$conn = new PDO(
                    "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                    DB_USER,
                    DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
                    );
            }
            catch (PDOException $e) {
                // Em produção, isso deveria ir para um log de erros
                if (isset($_SERVER['HTTP_ORIGIN'])) {
                    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
                    header('Access-Control-Allow-Credentials: true');
                }
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(["error" => "Falha na conexão com o banco de dados.", "message" => $e->getMessage()]);
                exit;
            }
        }
        return self::$conn;
    }
}
?>
