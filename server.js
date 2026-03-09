const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// SUA CHAVE DA STEAM
const STEAM_API_KEY = '8B07FE7C9405216BF61C1F439E93922B';

// Configuração dos Workers
const CONCURRENCY_LIMIT = 30; // Quantas requisições simultâneas (muito mais rápido que o navegador)

// Rota Principal
app.get('/api/profile', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });

    console.log(`[Search] Iniciando busca para: ${query}`);

    try {
        // 1. Resolver ID (se for vanity url ou link)
        let steamId = query;
        if (isNaN(query)) {
            // Limpa URL se foi colada inteira
            const vanity = query.includes('/id/') ? query.split('/id/')[1].split('/')[0].replace('/', '') : query;
            const resolve = await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanity}`);
            if (resolve.data.response.success === 1) {
                steamId = resolve.data.response.steamid;
            } else {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
        }

        // 2. Buscar Dados do Perfil
        const summaryReq = axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`);
        // 3. Buscar Lista de Jogos (TODOS)
        const gamesReq = axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json`);
        // 4. Buscar Amigos
        const friendsReq = axios.get(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&relationship=friend`);

        const [summaryRes, gamesRes, friendsRes] = await Promise.allSettled([summaryReq, gamesReq, friendsReq]);

        // Dados Iniciais
        const user = summaryRes.value?.data?.response?.players?.[0];
        const games = gamesRes.value?.data?.response?.games || [];
        let friends = [];

        // Processar amigos (pegar detalhes)
        if (friendsRes.status === 'fulfilled' && friendsRes.value.data.friendslist) {
            const friendIds = friendsRes.value.data.friendslist.friends.map(f => f.steamid);
            // A API só aceita 100 IDs por vez, vamos pegar só os primeiros 100 pra ser rápido, ou fazer batching se quiser todos
            // Para o exemplo, vamos pegar todos em lotes
            const chunks = [];
            for (let i = 0; i < friendIds.length; i += 100) {
                chunks.push(friendIds.slice(i, i + 100).join(','));
            }
            
            const friendDetailsPromises = chunks.map(ids => 
                axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${ids}`)
            );
            
            const friendsDetailsRes = await Promise.all(friendDetailsPromises);
            friendsDetailsRes.forEach(r => {
                if(r.data.response.players) friends.push(...r.data.response.players);
            });
        }

        if (!user) return res.status(404).json({ error: 'Perfil privado ou não encontrado' });

        // ---------------------------------------------------------
        // A MÁGICA DOS WORKERS (Coleta de Conquistas)
        // ---------------------------------------------------------
        
        // Filtra apenas jogos que podem ter conquistas para não perder tempo
        // (Jogos sem playtime ou muito antigos as vezes não tem stats visíveis)
        const gamesToScan = games.filter(g => g.has_community_visible_stats);
        
        console.log(`[Workers] Iniciando análise de ${gamesToScan.length} jogos...`);

        // Variáveis "In-Memory" (Nosso Banco de Dados temporário)
        let totalAchievements = 0;
        let totalPlatinum = 0;
        let completedSum = 0;
        let gamesCounted = 0;

        // Função Worker
        const processGame = async (game) => {
            try {
                const statsRes = await axios.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${game.appid}`, {
                    timeout: 5000 // Timeout curto para não travar se a API engasgar
                });

                if (statsRes.data.playerstats && statsRes.data.playerstats.achievements) {
                    const achs = statsRes.data.playerstats.achievements;
                    const total = achs.length;
                    const unlocked = achs.filter(a => a.achieved === 1).length;
                    
                    if (total > 0) {
                        const percent = Math.floor((unlocked / total) * 100);
                        
                        // Atualiza Stats Globais (Thread-safe no Node.js pois é single thread event loop)
                        totalAchievements += unlocked;
                        completedSum += percent;
                        gamesCounted++;
                        if (percent === 100) totalPlatinum++;

                        // Adiciona dados ao objeto do jogo para o frontend
                        game.stats = {
                            total,
                            unlocked,
                            percent
                        };
                    }
                }
            } catch (error) {
                // Ignora erros individuais (jogo sem conquista ou timeout)
                game.stats = { error: true };
            }
        };

        // Sistema de Fila (Queue) com Limite de Concorrência
        // Isso evita que a API da Steam nos bloqueie por excesso de requisições
        const queue = [...gamesToScan];
        const workers = [];

        for (let i = 0; i < CONCURRENCY_LIMIT; i++) {
            workers.push((async () => {
                while (queue.length > 0) {
                    const game = queue.shift();
                    await processGame(game);
                }
            })());
        }

        await Promise.all(workers); // Espera todos acabarem

        console.log(`[Workers] Finalizado. Conquistas: ${totalAchievements}`);

        // --- LÓGICA DE XP ---
        const totalXp = (totalAchievements * 10) + (totalPlatinum * 1000);
        const level = totalXp > 0 ? Math.floor(Math.sqrt(totalXp / 100)) : 0;
        const xpForCurrentLevel = 100 * Math.pow(level, 2);
        const xpForNextLevel = 100 * Math.pow(level + 1, 2);

        const xpSql = `
            INSERT INTO user_xp (steam_id, level, xp, last_updated)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(steam_id) DO UPDATE SET
            level = excluded.level,
            xp = excluded.xp,
            last_updated = excluded.last_updated
        `;
        db.run(xpSql, [steamId, level, totalXp]);
        // --- FIM LÓGICA DE XP ---

        // Prepara resposta final
        const responseData = {
            user,
            games, // Jogos agora incluem a propriedade .stats
            friends,
            stats: {
                totalGames: games.length,
                totalPlatinum,
                totalAchievements,
                averageCompletion: gamesCounted > 0 ? Math.floor(completedSum / gamesCounted) : 0,
                xp: {
                    totalXp,
                    level,
                    xpForCurrentLevel,
                    xpForNextLevel
                }
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Erro geral:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Endpoint para buscar conquistas de um jogo específico (usado pelo Desafio Diário)
app.get('/api/achievements/:steamId/:appId', async (req, res) => {
    const { steamId, appId } = req.params;
    
    if (!steamId || !appId) {
        return res.status(400).json({ error: 'Steam ID e App ID são necessários' });
    }
    
    console.log(`[Achievements] Buscando conquistas para Steam ID: ${steamId}, App ID: ${appId}`);
    
    try {
        // Buscar conquistas do jogador para este jogo
        const achievementsRes = await axios.get(
            `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${appId}`,
            { timeout: 10000 }
        );
        
        if (!achievementsRes.data.playerstats || !achievementsRes.data.playerstats.achievements) {
            return res.status(404).json({ error: 'Jogo não possui conquistas ou dados não disponíveis' });
        }
        
        // Buscar porcentagens globais das conquistas
        let globalPercentages = {};
        try {
            const globalRes = await axios.get(
                `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
                { timeout: 5000 }
            );
            if (globalRes.data.achievementpercentages?.achievements) {
                globalRes.data.achievementpercentages.achievements.forEach(a => {
                    globalPercentages[a.name] = a.percent;
                });
            }
        } catch (e) {
            console.log('[Achievements] Não foi possível obter porcentagens globais');
        }
        
        const achievements = achievementsRes.data.playerstats.achievements.map(a => ({
            apiname: a.apiname,
            name: a.name || a.apiname,
            achieved: a.achieved === 1,
            unlocktime: a.unlocktime,
            percent: globalPercentages[a.apiname] || null
        }));
        
        const unlocked = achievements.filter(a => a.achieved).length;
        const total = achievements.length;
        
        console.log(`[Achievements] ${unlocked}/${total} conquistas desbloqueadas`);
        
        res.json({
            gameName: achievementsRes.data.playerstats.gameName,
            steamId: steamId,
            appId: appId,
            achievements: achievements,
            unlocked: unlocked,
            total: total,
            percent: total > 0 ? Math.round((unlocked / total) * 100) : 0
        });
        
    } catch (error) {
        console.error(`[Achievements] Erro: ${error.message}`);
        
        if (error.response?.status === 403) {
            return res.status(403).json({ error: 'Perfil privado ou dados de jogo não acessíveis' });
        }
        if (error.response?.status === 400) {
            return res.status(404).json({ error: 'Jogo não possui conquistas' });
        }
        
        res.status(500).json({ error: 'Erro ao buscar conquistas' });
    }
});

// Endpoint para buscar jogos de um usuário (usado pelo Desafio Diário)
app.get('/api/games/:steamId', async (req, res) => {
    const { steamId } = req.params;
    
    if (!steamId) {
        return res.status(400).json({ error: 'Steam ID é necessário' });
    }
    
    console.log(`[Games] Buscando jogos para Steam ID: ${steamId}`);
    
    try {
        const gamesRes = await axios.get(
            `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&format=json`,
            { timeout: 10000 }
        );
        
        if (!gamesRes.data.response?.games) {
            return res.status(404).json({ error: 'Nenhum jogo encontrado ou perfil privado' });
        }
        
        res.json({
            steamId: steamId,
            games: gamesRes.data.response.games,
            gameCount: gamesRes.data.response.game_count
        });
        
    } catch (error) {
        console.error(`[Games] Erro: ${error.message}`);
        res.status(500).json({ error: 'Erro ao buscar jogos' });
    }
});

app.get('/api/user-xp', (req, res) => {
    const { steamid } = req.query;
    if (!steamid) {
        return res.status(400).json({ error: 'Steam ID is required' });
    }

    const sql = "SELECT * FROM user_xp WHERE steam_id = ?";
    db.get(sql, [steamid], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

app.get('/api/friends-xp', async (req, res) => {
    const { steamid } = req.query;
    if (!steamid) {
        return res.status(400).json({ error: 'Steam ID is required' });
    }

    try {
        // 1. Get friend list from Steam
        const friendsRes = await axios.get(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend`);
        if (!friendsRes.data.friendslist) {
            return res.json([]); // Private friends list
        }
        const friendIds = friendsRes.data.friendslist.friends.map(f => f.steamid);

        // Include the user's own ID in the list for the leaderboard
        friendIds.push(steamid);

        // 2. Get player summaries for names and avatars
        const chunks = [];
        for (let i = 0; i < friendIds.length; i += 100) {
            chunks.push(friendIds.slice(i, i + 100).join(','));
        }
        
        const friendDetailsPromises = chunks.map(ids => 
            axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${ids}`)
        );
        
        const friendsDetailsRes = await Promise.all(friendDetailsPromises);
        const friendsMap = new Map();
        friendsDetailsRes.forEach(r => {
            if(r.data.response.players) {
                r.data.response.players.forEach(p => {
                    friendsMap.set(p.steamid, {
                        name: p.personaname,
                        avatar: p.avatar
                    });
                });
            }
        });

        // 3. Query our local DB for their XP
        const placeholders = friendIds.map(() => '?').join(',');
        const sql = `SELECT steam_id, level, xp FROM user_xp WHERE steam_id IN (${placeholders})`;

        db.all(sql, friendIds, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // 4. Combine data and sort
            const leaderboard = rows.map(row => ({
                steam_id: row.steam_id,
                level: row.level,
                xp: row.xp,
                name: friendsMap.get(row.steam_id)?.name || '?',
                avatar: friendsMap.get(row.steam_id)?.avatar || ''
            })).sort((a, b) => b.xp - a.xp);

            res.json(leaderboard);
        });

    } catch (error) {
        console.error('Error fetching friends XP:', error.message);
        res.status(500).json({ error: 'Failed to fetch friends XP data' });
    }
});

const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

app.get('/api/game-details/:appid', async (req, res) => {
    const { appid } = req.params;

    try {
        // 1. Check cache first
        const cacheSql = "SELECT * FROM game_details WHERE appid = ?";
        db.get(cacheSql, [appid], async (err, row) => {
            if (err) { return res.status(500).json({ error: err.message }); }

            // Cache is valid for 7 days
            if (row && (new Date() - new Date(row.last_updated)) < 7 * 24 * 60 * 60 * 1000) {
                return res.json({ source: 'cache', data: row });
            }

            // 2. If not in cache or stale, fetch from APIs
            let metacritic_score = null;
            let hltb_main = null;
            let gameName = '';

            // Fetch from Steam API
            const steamRes = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&filters=metacritic,name`);
            if (steamRes.data && steamRes.data[appid].success) {
                const steamData = steamRes.data[appid].data;
                gameName = steamData.name;
                if (steamData.metacritic) {
                    metacritic_score = steamData.metacritic.score;
                }
            } else {
                // If Steam API fails, we can't get the name to search HLTB
                return res.status(404).json({ error: 'Game not found on Steam Store' });
            }
            
            // Fetch from HLTB
            if (gameName) {
                try {
                    const hltbResult = await hltbService.search(gameName);
                    if (hltbResult.length > 0) {
                        // Assume the first result is the best match
                        hltb_main = hltbResult[0].gameplayMain;
                    }
                } catch (e) {
                    console.error(`HLTB search failed for "${gameName}":`, e.message);
                }
            }

            // 3. Update cache
            const updateSql = `
                INSERT INTO game_details (appid, metacritic_score, hltb_main, last_updated)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(appid) DO UPDATE SET
                metacritic_score = excluded.metacritic_score,
                hltb_main = excluded.hltb_main,
                last_updated = excluded.last_updated
            `;
            db.run(updateSql, [appid, metacritic_score, hltb_main]);
            
            const newData = { appid, metacritic_score, hltb_main };
            res.json({ source: 'api', data: newData });
        });
    } catch (error) {
        console.error(`Failed to get game-details for ${appid}:`, error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rota para detalhes do Modal (Schema)
app.get('/api/game/:appid', async (req, res) => {
    // Implementar se necessário para buscar detalhes finos, ou o front pode fazer
    // Mas vamos focar no scan principal acima.
    res.json({msg: "Use o frontend para detalhes específicos por enquanto"});
});

const db = require('./database.js');

app.use(express.json()); // Middleware para parsear JSON bodies

// Rota para popular/atualizar preços
app.post('/api/update-prices', async (req, res) => {
    const games = req.body; // Espera um array de { appid, name }
    if (!Array.isArray(games)) {
        return res.status(400).json({ error: 'Body should be an array of games' });
    }

    console.log(`[PriceUpdater] Recebido pedido para atualizar ${games.length} jogos.`);

    const updatePromises = games.map(game => async () => {
        try {
            // 1. Garante que o jogo existe na nossa tabela de jogos
            const gameSql = `INSERT OR IGNORE INTO games (appid, name) VALUES (?, ?)`;
            db.run(gameSql, [game.appid, game.name]);

            // 2. Busca o preço na API da Steam
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&cc=us&filters=price_overview`);
            const gameData = response.data[game.appid];

            if (gameData.success && gameData.data && gameData.data.price_overview) {
                const price = gameData.data.price_overview.final; // Preço em centavos (ex: 3999 para $39.99)

                // 3. Insere no histórico de preços
                const priceSql = `INSERT INTO price_history (appid, price_usd) VALUES (?, ?)`;
                db.run(priceSql, [game.appid, price]);
            }
        } catch (error) {
            // Ignora erros de jogos individuais (ex: jogo não vende mais, API falhou)
            // console.error(`Erro ao atualizar appid ${game.appid}: ${error.message}`);
        }
    });

    // Roda as atualizações em sequência para não sobrecarregar a API
    for (const promise of updatePromises) {
        await promise();
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay
    }
    
    console.log('[PriceUpdater] Atualização concluída.');
    res.json({ message: 'Price update process finished.' });
});


// Rota para buscar preços do nosso DB
app.get('/api/game-prices', (req, res) => {
    const sql = `
        SELECT g.appid, g.name, ph.price_usd, ph.timestamp
        FROM games g
        JOIN (
            SELECT appid, MAX(timestamp) as max_time
            FROM price_history
            GROUP BY appid
        ) as latest ON g.appid = latest.appid
        JOIN price_history ph ON latest.appid = ph.appid AND latest.max_time = ph.timestamp
        ORDER BY g.name
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// ===== HOWLONGTOBEAT INTEGRATION =====
// Busca tempo estimado de jogo via scraping do HowLongToBeat

async function searchHLTB(gameName) {
    try {
        // HowLongToBeat não tem API oficial, usamos o endpoint de busca
        const searchUrl = 'https://howlongtobeat.com/api/search';
        
        // O site usa um payload específico
        const payload = {
            searchType: 'games',
            searchTerms: gameName.split(' '),
            searchPage: 1,
            size: 5,
            searchOptions: {
                games: {
                    userId: 0,
                    platform: '',
                    sortCategory: 'popular',
                    rangeCategory: 'main',
                    rangeTime: { min: null, max: null },
                    gameplay: { perspective: '', flow: '', genre: '' },
                    rangeYear: { min: '', max: '' },
                    modifier: ''
                },
                users: { sortCategory: 'postcount' },
                filter: '',
                sort: 0,
                randomizer: 0
            }
        };
        
        const response = await axios.post(searchUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://howlongtobeat.com/',
                'Origin': 'https://howlongtobeat.com'
            },
            timeout: 10000
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            const game = response.data.data[0];
            return {
                found: true,
                name: game.game_name,
                imageUrl: game.game_image ? `https://howlongtobeat.com/games/${game.game_image}` : null,
                mainStory: game.comp_main ? Math.round(game.comp_main / 3600) : null, // segundos -> horas
                mainExtra: game.comp_plus ? Math.round(game.comp_plus / 3600) : null,
                completionist: game.comp_100 ? Math.round(game.comp_100 / 3600) : null,
                allStyles: game.comp_all ? Math.round(game.comp_all / 3600) : null
            };
        }
        
        return { found: false };
    } catch (error) {
        console.error('[HLTB] Erro:', error.message);
        return { found: false, error: error.message };
    }
}

// Endpoint para buscar tempo de jogo
app.get('/api/hltb/:gamename', async (req, res) => {
    const gameName = req.params.gamename;
    
    if (!gameName) {
        return res.status(400).json({ error: 'Nome do jogo é obrigatório' });
    }
    
    console.log(`[HLTB] Buscando: ${gameName}`);
    
    // Verificar cache no banco
    const cacheSql = "SELECT * FROM game_details WHERE appid = ?";
    
    // Como não temos appid aqui, vamos buscar direto
    const result = await searchHLTB(gameName);
    
    // Se encontrou, salvar no cache (precisaria do appid)
    if (result.found) {
        console.log(`[HLTB] Encontrado: ${result.name} - Main: ${result.mainStory}h`);
    }
    
    res.json(result);
});

// Endpoint para buscar HLTB por appid (com cache) - Usa pacote NPM howlongtobeat
app.get('/api/hltb/appid/:appid', async (req, res) => {
    const appid = req.params.appid;
    const gameName = req.query.name;
    
    if (!appid || !gameName) {
        return res.status(400).json({ error: 'AppID e nome são obrigatórios' });
    }
    
    console.log(`[HLTB] Buscando para: ${gameName} (appid: ${appid})`);
    
    // Verificar cache
    const cacheSql = "SELECT hltb_main, hltb_complete FROM game_details WHERE appid = ? AND hltb_main IS NOT NULL";
    
    db.get(cacheSql, [appid], async (err, row) => {
        if (row && row.hltb_main) {
            // Retornar do cache
            console.log(`[HLTB] Cache hit para ${gameName}: ${row.hltb_main}h`);
            return res.json({
                found: true,
                cached: true,
                mainStory: row.hltb_main,
                completionist: row.hltb_complete || row.hltb_main * 2
            });
        }
        
        try {
            // Buscar usando o pacote NPM (mais confiável)
            const cleanName = gameName
                .replace(/[™®©]/g, '')
                .replace(/\s*[-–—:]\s*(Definitive|Special|Complete|GOTY|Game of the Year|Remastered|Enhanced|Anniversary|Ultimate|Deluxe|Gold|Premium|Standard|Legacy|Extended|Director's Cut).*$/i, '')
                .replace(/\s*\(.*?\)/g, '')
                .trim();
                
            const results = await hltbService.search(cleanName);
            
            if (results && results.length > 0) {
                const game = results[0];
                const mainStory = Math.round(game.gameplayMain) || null;
                const completionist = Math.round(game.gameplayCompletionist) || Math.round(game.gameplayMain * 2);
                
                console.log(`[HLTB] Encontrado: ${game.name} - Main: ${mainStory}h, 100%: ${completionist}h`);
                
                // Salvar no cache
                if (mainStory) {
                    const updateSql = `
                        INSERT INTO game_details (appid, hltb_main, hltb_complete, last_updated)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                        ON CONFLICT(appid) DO UPDATE SET
                        hltb_main = excluded.hltb_main,
                        hltb_complete = excluded.hltb_complete,
                        last_updated = excluded.last_updated
                    `;
                    db.run(updateSql, [appid, mainStory, completionist]);
                }
                
                return res.json({
                    found: true,
                    cached: false,
                    name: game.name,
                    mainStory: mainStory,
                    completionist: completionist,
                    imageUrl: game.imageUrl
                });
            }
            
            // Fallback: tentar a busca manual
            const manualResult = await searchHLTB(gameName);
            if (manualResult.found && manualResult.mainStory) {
                const updateSql = `
                    INSERT INTO game_details (appid, hltb_main, hltb_complete, last_updated)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(appid) DO UPDATE SET
                    hltb_main = excluded.hltb_main,
                    hltb_complete = excluded.hltb_complete,
                    last_updated = excluded.last_updated
                `;
                db.run(updateSql, [appid, manualResult.mainStory, manualResult.completionist]);
            }
            res.json(manualResult);
            
        } catch (error) {
            console.error(`[HLTB] Erro para ${gameName}:`, error.message);
            res.json({ found: false, error: error.message });
        }
    });
});

app.listen(3000, () => {
    console.log('Server "Steam Workers" rodando na porta 3000');
    console.log('Endpoints disponíveis:');
    console.log('  - /api/profile?query=<steamid>');
    console.log('  - /api/hltb/<gamename>');
    console.log('  - /api/hltb/appid/<appid>?name=<gamename>');
});