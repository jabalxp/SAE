-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS sae_steam_cache CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sae_steam_cache;

-- Tabela de Jogos (Geral)
CREATE TABLE IF NOT EXISTS games (
    appid INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Histórico de Preços
CREATE TABLE IF NOT EXISTS price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appid INT NOT NULL,
    price_usd INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appid) REFERENCES games(appid) ON DELETE CASCADE
) ENGINE=InnoDB;

-- XP e Nível do Usuário
CREATE TABLE IF NOT EXISTS user_xp (
    steam_id VARCHAR(50) PRIMARY KEY,
    level INT NOT NULL,
    xp INT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Detalhes Adicionais dos Jogos (Metacritic, HLTB)
CREATE TABLE IF NOT EXISTS game_details (
    appid INT PRIMARY KEY,
    metacritic_score INT,
    hltb_main FLOAT,
    hltb_complete FLOAT,
    last_updated DATETIME
) ENGINE=InnoDB;

-- Perfis de Usuários
CREATE TABLE IF NOT EXISTS user_profiles (
    steam_id VARCHAR(50) PRIMARY KEY,
    personaname VARCHAR(255),
    avatar_url VARCHAR(255),
    profile_url VARCHAR(255),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Jogos dos Usuários (Relacionamento Usuário x Jogo)
CREATE TABLE IF NOT EXISTS user_games (
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
) ENGINE=InnoDB;

-- Conquistas dos Usuários
CREATE TABLE IF NOT EXISTS user_achievements (
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
) ENGINE=InnoDB;

-- Esquema de Conquistas do Jogo (Geral)
CREATE TABLE IF NOT EXISTS game_achievement_schema (
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
) ENGINE=InnoDB;

-- Log de Sincronização
CREATE TABLE IF NOT EXISTS sync_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_id VARCHAR(50) NOT NULL,
    appid INT,
    sync_type VARCHAR(50),
    items_synced INT DEFAULT 0,
    sync_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY steam_appid_sync (steam_id, appid)
) ENGINE=InnoDB;
