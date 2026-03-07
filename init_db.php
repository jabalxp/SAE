<?php
// init_db.php
$host = 'localhost';
$username = 'root';
$password = '';
$port = 3308;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $username, $password);
    
    // Set PDO attributes
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS sae_steam_cache CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE sae_steam_cache");

    // Array of table creation queries
    $tables = [
        "CREATE TABLE IF NOT EXISTS games (
            appid INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )",

        "CREATE TABLE IF NOT EXISTS price_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            appid INT NOT NULL,
            price_usd INT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (appid) REFERENCES games(appid) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS user_xp (
            steam_id VARCHAR(50) PRIMARY KEY,
            level INT NOT NULL,
            xp INT NOT NULL,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )",

        "CREATE TABLE IF NOT EXISTS game_details (
            appid INT PRIMARY KEY,
            metacritic_score INT,
            hltb_main FLOAT,
            hltb_complete FLOAT,
            last_updated DATETIME
        )",

        "CREATE TABLE IF NOT EXISTS user_profiles (
            steam_id VARCHAR(50) PRIMARY KEY,
            personaname VARCHAR(255),
            avatar_url VARCHAR(255),
            profile_url VARCHAR(255),
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )",

        "CREATE TABLE IF NOT EXISTS user_games (
            id INT AUTO_INCREMENT PRIMARY KEY,
            steam_id VARCHAR(50) NOT NULL,
            appid INT NOT NULL,
            name VARCHAR(255),
            playtime_forever INT DEFAULT 0,
            percent INT DEFAULT -1,
            unlocked INT DEFAULT 0,
            total INT DEFAULT 0,
            has_achievements BOOLEAN DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY steam_appid (steam_id, appid)
        )",

        "CREATE TABLE IF NOT EXISTS user_achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            steam_id VARCHAR(50) NOT NULL,
            appid INT NOT NULL,
            apiname VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            description TEXT,
            icon VARCHAR(255),
            icongray VARCHAR(255),
            unlocked BOOLEAN DEFAULT 0,
            unlock_time INT DEFAULT 0,
            percent FLOAT DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY steam_appid_apiname (steam_id, appid, apiname)
        )",

        "CREATE TABLE IF NOT EXISTS game_achievement_schema (
            id INT AUTO_INCREMENT PRIMARY KEY,
            appid INT NOT NULL,
            apiname VARCHAR(255) NOT NULL,
            display_name VARCHAR(255),
            description TEXT,
            icon VARCHAR(255),
            icongray VARCHAR(255),
            global_percent FLOAT DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY appid_apiname (appid, apiname)
        )",

        "CREATE TABLE IF NOT EXISTS sync_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            steam_id VARCHAR(50) NOT NULL,
            appid INT,
            sync_type VARCHAR(50),
            items_synced INT DEFAULT 0,
            sync_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY steam_appid_sync (steam_id, appid)
        )"
    ];

    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }

    echo "✅ Banco de dados 'sae_steam_cache' e todas as 9 tabelas do sistema SAE criadas/verificadas com sucesso em PHP/MySQL!\n";
    echo "Você já pode começar a utilizar as APIs na porta Apache do XAMPP.";

} catch(PDOException $e) {
    die("❌ Erro fatal ao iniciar as tabelas: " . $e->getMessage() . "\nVerifique se o MySQL do XAMPP está ligado (Start).");
}
?>
