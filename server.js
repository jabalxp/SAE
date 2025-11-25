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

        // Prepara resposta final
        const responseData = {
            user,
            games, // Jogos agora incluem a propriedade .stats
            friends,
            stats: {
                totalGames: games.length,
                totalPlatinum,
                totalAchievements,
                averageCompletion: gamesCounted > 0 ? Math.floor(completedSum / gamesCounted) : 0
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Erro geral:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota para detalhes do Modal (Schema)
app.get('/api/game/:appid', async (req, res) => {
    // Implementar se necessário para buscar detalhes finos, ou o front pode fazer
    // Mas vamos focar no scan principal acima.
    res.json({msg: "Use o frontend para detalhes específicos por enquanto"});
});

app.listen(3000, () => {
    console.log('Server "Steam Workers" rodando na porta 3000');
});