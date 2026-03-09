<?php
// api/config/init_db.php
require_once 'db.php';

try {
    // 1. Conectar sem selecionar banco para poder criar
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );

    // 2. Ler o arquivo SQL
    $sqlFilePath = __DIR__ . '/../../database.sql';
    if (!file_exists($sqlFilePath)) {
        die("Arquivo database.sql não encontrado em: $sqlFilePath");
    }

    $sql = file_get_contents($sqlFilePath);

    // 3. Executar o SQL
    $pdo->exec($sql);
    echo "Banco de dados e tabelas criados com sucesso!\n";

}
catch (PDOException $e) {
    echo "Erro ao criar banco de dados: " . $e->getMessage() . "\n";
}
?>
