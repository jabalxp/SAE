/**
 * Steam Explorer - IndexedDB Cache System
 * Armazena jogos, conquistas e dados do perfil localmente
 * para carregamento instantâneo e suporte offline
 */

const SteamCache = (function() {
    const DB_NAME = 'SteamExplorerDB';
    const DB_VERSION = 2;
    let db = null;

    // Stores (tabelas) do banco
    const STORES = {
        PROFILES: 'profiles',       // Perfis de usuários
        GAMES: 'games',             // Jogos por usuário
        ACHIEVEMENTS: 'achievements', // Conquistas individuais
        GAME_SCHEMAS: 'gameSchemas', // Schema de conquistas dos jogos
        SYNC_LOG: 'syncLog'         // Log de sincronizações
    };

    /**
     * Inicializa o banco IndexedDB
     */
    async function init() {
        return new Promise((resolve, reject) => {
            if (db) {
                resolve(db);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('❌ Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                db = request.result;
                console.log('✅ IndexedDB conectado:', DB_NAME);
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                console.log('🔄 Atualizando schema do IndexedDB...');

                // Store: Perfis de usuários
                if (!database.objectStoreNames.contains(STORES.PROFILES)) {
                    const profileStore = database.createObjectStore(STORES.PROFILES, { keyPath: 'steamId' });
                    profileStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }

                // Store: Jogos do usuário
                if (!database.objectStoreNames.contains(STORES.GAMES)) {
                    const gamesStore = database.createObjectStore(STORES.GAMES, { keyPath: ['steamId', 'appid'] });
                    gamesStore.createIndex('steamId', 'steamId', { unique: false });
                    gamesStore.createIndex('appid', 'appid', { unique: false });
                    gamesStore.createIndex('percent', 'percent', { unique: false });
                    gamesStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }

                // Store: Conquistas individuais
                if (!database.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
                    const achStore = database.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: ['steamId', 'appid', 'apiname'] });
                    achStore.createIndex('steamId', 'steamId', { unique: false });
                    achStore.createIndex('appid', 'appid', { unique: false });
                    achStore.createIndex('unlocked', 'unlocked', { unique: false });
                    achStore.createIndex('steamId_appid', ['steamId', 'appid'], { unique: false });
                }

                // Store: Schema de conquistas (descrições, ícones)
                if (!database.objectStoreNames.contains(STORES.GAME_SCHEMAS)) {
                    const schemaStore = database.createObjectStore(STORES.GAME_SCHEMAS, { keyPath: 'appid' });
                    schemaStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }

                // Store: Log de sincronizações
                if (!database.objectStoreNames.contains(STORES.SYNC_LOG)) {
                    const syncStore = database.createObjectStore(STORES.SYNC_LOG, { keyPath: ['steamId', 'appid'] });
                    syncStore.createIndex('steamId', 'steamId', { unique: false });
                    syncStore.createIndex('lastSync', 'lastSync', { unique: false });
                }

                console.log('✅ Schema criado com sucesso');
            };
        });
    }

    /**
     * Salva ou atualiza o perfil do usuário
     */
    async function saveProfile(profile) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PROFILES, 'readwrite');
            const store = tx.objectStore(STORES.PROFILES);
            
            const data = {
                steamId: profile.steamid,
                personaname: profile.personaname,
                avatarfull: profile.avatarfull,
                profileurl: profile.profileurl,
                lastUpdated: Date.now()
            };
            
            store.put(data);
            tx.oncomplete = () => resolve(data);
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Obtém o perfil do cache
     */
    async function getProfile(steamId) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.PROFILES, 'readonly');
            const store = tx.objectStore(STORES.PROFILES);
            const request = store.get(steamId);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Salva múltiplos jogos de uma vez (batch)
     */
    async function saveGames(steamId, games) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.GAMES, 'readwrite');
            const store = tx.objectStore(STORES.GAMES);
            
            const now = Date.now();
            let count = 0;
            
            games.forEach(game => {
                const data = {
                    steamId: steamId,
                    appid: game.appid,
                    name: game.name,
                    playtime_forever: game.playtime_forever || 0,
                    playtime_hours: game.playtime_hours || 0,
                    header_image: game.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
                    has_community_visible_stats: game.has_community_visible_stats || false,
                    percent: game.percent !== undefined ? game.percent : -1,
                    unlocked: game.unlocked || 0,
                    total: game.total || 0,
                    lastUpdated: now
                };
                store.put(data);
                count++;
            });
            
            tx.oncomplete = () => {
                console.log(`💾 ${count} jogos salvos no cache`);
                resolve(count);
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Obtém todos os jogos de um usuário do cache
     */
    async function getGames(steamId) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.GAMES, 'readonly');
            const store = tx.objectStore(STORES.GAMES);
            const index = store.index('steamId');
            const request = index.getAll(steamId);
            
            request.onsuccess = () => {
                const games = request.result || [];
                console.log(`📂 ${games.length} jogos carregados do cache`);
                resolve(games);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Atualiza as stats de um jogo específico
     */
    async function updateGameStats(steamId, appid, stats) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.GAMES, 'readwrite');
            const store = tx.objectStore(STORES.GAMES);
            const request = store.get([steamId, appid]);
            
            request.onsuccess = () => {
                const game = request.result;
                if (game) {
                    game.percent = stats.percent;
                    game.unlocked = stats.unlocked;
                    game.total = stats.total;
                    game.lastUpdated = Date.now();
                    store.put(game);
                }
            };
            
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Salva as conquistas de um jogo
     */
    async function saveAchievements(steamId, appid, achievements) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORES.ACHIEVEMENTS, STORES.SYNC_LOG], 'readwrite');
            const achStore = tx.objectStore(STORES.ACHIEVEMENTS);
            const syncStore = tx.objectStore(STORES.SYNC_LOG);
            
            const now = Date.now();
            
            achievements.forEach(ach => {
                const data = {
                    steamId: steamId,
                    appid: appid,
                    apiname: ach.apiname || ach.name,
                    name: ach.displayName || ach.name,
                    description: ach.description || '',
                    icon: ach.icon || '',
                    icongray: ach.icongray || '',
                    unlocked: ach.achieved === 1 || ach.unlocked === true,
                    unlocktime: ach.unlocktime || 0,
                    percent: ach.percent || 0,
                    lastUpdated: now
                };
                achStore.put(data);
            });
            
            // Registra sync
            syncStore.put({
                steamId: steamId,
                appid: appid,
                lastSync: now,
                achievementCount: achievements.length
            });
            
            tx.oncomplete = () => {
                console.log(`🏆 ${achievements.length} conquistas salvas para ${appid}`);
                resolve(achievements.length);
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Obtém as conquistas de um jogo do cache
     */
    async function getAchievements(steamId, appid) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.ACHIEVEMENTS, 'readonly');
            const store = tx.objectStore(STORES.ACHIEVEMENTS);
            const index = store.index('steamId_appid');
            const request = index.getAll([steamId, appid]);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obtém TODAS as conquistas de um usuário do cache
     */
    async function getAllAchievements(steamId) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.ACHIEVEMENTS, 'readonly');
            const store = tx.objectStore(STORES.ACHIEVEMENTS);
            const index = store.index('steamId');
            const request = index.getAll(steamId);
            
            request.onsuccess = () => {
                const achievements = request.result || [];
                console.log(`🏆 ${achievements.length} conquistas carregadas do cache para ${steamId}`);
                resolve(achievements);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Salva o schema de conquistas de um jogo
     */
    async function saveGameSchema(appid, schema) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.GAME_SCHEMAS, 'readwrite');
            const store = tx.objectStore(STORES.GAME_SCHEMAS);
            
            const data = {
                appid: appid,
                achievements: schema.achievements || [],
                lastUpdated: Date.now()
            };
            
            store.put(data);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Obtém o schema de um jogo do cache
     */
    async function getGameSchema(appid) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.GAME_SCHEMAS, 'readonly');
            const store = tx.objectStore(STORES.GAME_SCHEMAS);
            const request = store.get(appid);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Verifica quando foi a última sincronização de um jogo
     */
    async function getLastSync(steamId, appid) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.SYNC_LOG, 'readonly');
            const store = tx.objectStore(STORES.SYNC_LOG);
            const request = store.get([steamId, appid]);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.lastSync : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Verifica se precisa sincronizar (mais de X horas desde último sync)
     */
    async function needsSync(steamId, appid, maxAgeHours = 24) {
        const lastSync = await getLastSync(steamId, appid);
        if (!lastSync) return true;
        
        const maxAge = maxAgeHours * 60 * 60 * 1000; // Converter para ms
        return (Date.now() - lastSync) > maxAge;
    }

    /**
     * Obtém estatísticas totais do cache
     */
    async function getCacheStats(steamId) {
        await init();
        
        const games = await getGames(steamId);
        
        let totalAchievements = 0;
        let totalUnlocked = 0;
        let totalPlatinum = 0;
        let gamesWithStats = 0;
        
        games.forEach(g => {
            if (g.percent !== -1 && g.total > 0) {
                totalAchievements += g.total;
                totalUnlocked += g.unlocked;
                gamesWithStats++;
                if (g.percent === 100) totalPlatinum++;
            }
        });
        
        return {
            totalGames: games.length,
            gamesWithStats: gamesWithStats,
            totalAchievements: totalAchievements,
            totalUnlocked: totalUnlocked,
            totalPlatinum: totalPlatinum,
            completionRate: gamesWithStats > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0
        };
    }

    /**
     * Limpa todo o cache de um usuário
     */
    async function clearUserCache(steamId) {
        await init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORES.GAMES, STORES.ACHIEVEMENTS, STORES.SYNC_LOG], 'readwrite');
            
            // Limpar jogos
            const gamesStore = tx.objectStore(STORES.GAMES);
            const gamesIndex = gamesStore.index('steamId');
            const gamesCursor = gamesIndex.openCursor(IDBKeyRange.only(steamId));
            gamesCursor.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            
            // Limpar conquistas
            const achStore = tx.objectStore(STORES.ACHIEVEMENTS);
            const achIndex = achStore.index('steamId');
            const achCursor = achIndex.openCursor(IDBKeyRange.only(steamId));
            achCursor.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            
            // Limpar sync log
            const syncStore = tx.objectStore(STORES.SYNC_LOG);
            const syncIndex = syncStore.index('steamId');
            const syncCursor = syncIndex.openCursor(IDBKeyRange.only(steamId));
            syncCursor.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            
            tx.oncomplete = () => {
                console.log(`🗑️ Cache limpo para ${steamId}`);
                resolve(true);
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Limpa todo o banco de dados
     */
    async function clearAll() {
        return new Promise((resolve, reject) => {
            if (db) {
                db.close();
                db = null;
            }
            
            const request = indexedDB.deleteDatabase(DB_NAME);
            request.onsuccess = () => {
                console.log('🗑️ IndexedDB completamente limpo');
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obtém o tamanho estimado do cache
     */
    async function getCacheSize() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage || 0,
                quota: estimate.quota || 0,
                usedMB: ((estimate.usage || 0) / 1024 / 1024).toFixed(2),
                quotaMB: ((estimate.quota || 0) / 1024 / 1024).toFixed(2)
            };
        }
        return { used: 0, quota: 0, usedMB: '0', quotaMB: '0' };
    }

    // API Pública
    return {
        init,
        // Profile
        saveProfile,
        getProfile,
        // Games
        saveGames,
        getGames,
        updateGameStats,
        // Achievements
        saveAchievements,
        getAchievements,
        getAllAchievements,
        // Schema
        saveGameSchema,
        getGameSchema,
        // Sync
        getLastSync,
        needsSync,
        // Stats
        getCacheStats,
        getCacheSize,
        // Clear
        clearUserCache,
        clearAll,
        // Constants
        STORES
    };
})();

// Exportar para uso global
window.SteamCache = SteamCache;

// Auto-inicializar
SteamCache.init().then(() => {
    console.log('🚀 SteamCache pronto para uso');
}).catch(err => {
    console.error('❌ Erro ao inicializar SteamCache:', err);
});
