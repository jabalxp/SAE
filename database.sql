-- Estrutura de Banco de Dados para Steam Achievements Explorer (SAE)

CREATE DATABASE IF NOT EXISTS sae_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sae_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    steamid VARCHAR(50) PRIMARY KEY,
    personaname VARCHAR(255) NOT NULL,
    avatarfull VARCHAR(255),
    profileurl VARCHAR(255),
    last_login DATETIME,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Geral de Jogos (Metadados da Steam/HLTB)
CREATE TABLE IF NOT EXISTS games (
    appid INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    header_image VARCHAR(255),
    hltb_main INT DEFAULT NULL, -- Horas para zerar
    hltb_100 INT DEFAULT NULL,  -- Horas para platinar
    metacritic_score INT DEFAULT NULL,
    price_current DECIMAL(10,2) DEFAULT NULL,
    price_lowest DECIMAL(10,2) DEFAULT NULL,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Relação Usuário x Jogos (A Biblioteca do Usuário)
CREATE TABLE IF NOT EXISTS user_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steamid VARCHAR(50) NOT NULL,
    appid INT NOT NULL,
    playtime_forever INT DEFAULT 0, -- Tempo de jogo em minutos
    unlocked_achievements INT DEFAULT 0,
    total_achievements INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game (steamid, appid),
    FOREIGN KEY (steamid) REFERENCES users(steamid) ON DELETE CASCADE,
    FOREIGN KEY (appid) REFERENCES games(appid) ON DELETE CASCADE
);

-- Tabela de Esquema de Conquistas (Metadados globais das conquistas de um jogo)
CREATE TABLE IF NOT EXISTS achievements_schema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appid INT NOT NULL,
    apiname VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    icon VARCHAR(255),
    icongray VARCHAR(255),
    global_percent DECIMAL(5,2) DEFAULT 0.00, -- Porcentagem global de desbloqueio
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_game_achievement (appid, apiname),
    FOREIGN KEY (appid) REFERENCES games(appid) ON DELETE CASCADE
);

-- Tabela de Conquistas do Usuário
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steamid VARCHAR(50) NOT NULL,
    appid INT NOT NULL,
    apiname VARCHAR(255) NOT NULL,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocktime INT DEFAULT 0, -- Timestamp UNIX retornado pela Steam
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (steamid, appid, apiname),
    FOREIGN KEY (steamid) REFERENCES users(steamid) ON DELETE CASCADE,
    FOREIGN KEY (appid) REFERENCES games(appid) ON DELETE CASCADE
    -- O apiname não referencia achievements_schema obrigatoriamente para lidar com jogos que removem conquistas ou mudam schemas
);

-- Tabela de Badges do Site (Conquistas internas do SAE)
CREATE TABLE IF NOT EXISTS site_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    badge_key VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'starter', 'shiny_collector'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    criteria_type VARCHAR(50), -- Ex: 'platinums', 'achievements', 'games'
    criteria_value INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Relacionamento Usuário x Badges
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steamid VARCHAR(50) NOT NULL,
    badge_id INT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (steamid) REFERENCES users(steamid) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES site_badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (steamid, badge_id)
);

-- Inserção de Badges Iniciais de Exemplo
INSERT IGNORE INTO site_badges (badge_key, name, description, criteria_type, criteria_value) VALUES
('explorer', 'Explorador Solitário', 'Pesquisou seu próprio perfil pela primeira vez.', 'login', 1),
('platinum_novice', 'Platinador Iniciante', 'Conquistou suas primeiras 5 platinas.', 'platinums', 5),
('platinum_pro', 'Caçador de Elite', 'Alcançou a marca de 50 platinas.', 'platinums', 50),
('achievement_king', 'Rei das Conquistas', 'Desbloqueou mais de 1000 conquistas no total.', 'achievements', 1000),
('completionist_gold', 'Mestre da Perfeição', 'Possui pelo menos 10 jogos com 100% de conclusão.', 'platinums', 10);

-- Índices úteis para consultas frequentes
CREATE INDEX idx_user_games_completion ON user_games(completion_percentage);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(steamid, appid, unlocked);
CREATE INDEX idx_user_badges_steamid ON user_badges(steamid);
