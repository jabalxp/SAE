const sqlite3 = require('sqlite3').verbose();

const DB_SOURCE = 'steam_data.db';

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS games (
                appid INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'games'", err.message);
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                appid INTEGER NOT NULL,
                price_usd INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appid) REFERENCES games(appid)
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'price_history'", err.message);
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS user_xp (
                steam_id TEXT PRIMARY KEY,
                level INTEGER NOT NULL,
                xp INTEGER NOT NULL,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'user_xp'", err.message);
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS game_details (
                appid INTEGER PRIMARY KEY,
                metacritic_score INTEGER,
                hltb_main REAL,
                hltb_complete REAL,
                last_updated DATETIME
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'game_details'", err.message);
                }
            });
            
            // Adicionar coluna hltb_complete se não existir
            db.run(`ALTER TABLE game_details ADD COLUMN hltb_complete REAL`, (err) => {
                // Ignora erro se coluna já existe
            });

            // ===== NOVAS TABELAS PARA CACHE DE CONQUISTAS =====
            
            // Perfis de usuários Steam
            db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
                steam_id TEXT PRIMARY KEY,
                personaname TEXT,
                avatar_url TEXT,
                profile_url TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'user_profiles'", err.message);
                }
            });

            // Jogos do usuário com stats de conquistas
            db.run(`CREATE TABLE IF NOT EXISTS user_games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                steam_id TEXT NOT NULL,
                appid INTEGER NOT NULL,
                name TEXT,
                playtime_forever INTEGER DEFAULT 0,
                percent INTEGER DEFAULT -1,
                unlocked INTEGER DEFAULT 0,
                total INTEGER DEFAULT 0,
                has_achievements INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(steam_id, appid)
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'user_games'", err.message);
                }
            });

            // Conquistas individuais por usuário
            db.run(`CREATE TABLE IF NOT EXISTS user_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                steam_id TEXT NOT NULL,
                appid INTEGER NOT NULL,
                apiname TEXT NOT NULL,
                name TEXT,
                description TEXT,
                icon TEXT,
                icongray TEXT,
                unlocked INTEGER DEFAULT 0,
                unlock_time INTEGER DEFAULT 0,
                percent REAL DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(steam_id, appid, apiname)
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'user_achievements'", err.message);
                }
            });

            // Schema de conquistas dos jogos (compartilhado entre usuários)
            db.run(`CREATE TABLE IF NOT EXISTS game_achievement_schema (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                appid INTEGER NOT NULL,
                apiname TEXT NOT NULL,
                display_name TEXT,
                description TEXT,
                icon TEXT,
                icongray TEXT,
                global_percent REAL DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(appid, apiname)
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'game_achievement_schema'", err.message);
                }
            });

            // Log de sincronizações
            db.run(`CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                steam_id TEXT NOT NULL,
                appid INTEGER,
                sync_type TEXT,
                items_synced INTEGER DEFAULT 0,
                sync_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(steam_id, appid)
            )`, (err) => {
                if (err) {
                    console.error("Erro ao criar tabela 'sync_log'", err.message);
                }
            });

            // Criar índices para performance
            db.run(`CREATE INDEX IF NOT EXISTS idx_user_games_steam_id ON user_games(steam_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_user_achievements_steam_appid ON user_achievements(steam_id, appid)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_game_schema_appid ON game_achievement_schema(appid)`);

            console.log('✅ Todas as tabelas criadas/verificadas com sucesso');
        });
    }
});

module.exports = db;
