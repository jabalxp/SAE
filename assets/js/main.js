/* --- SCRIPT EXTRACTED FROM INDEX.HTML --- */
// --- CONFIG ---
// Detectar automaticamente a base da API baseada na localização do script
const getApiBaseUrl = () => {
    const path = window.location.pathname;
    const base = path.substring(0, path.lastIndexOf('/') + 1);
    return window.location.origin + base + 'api/routes';
};
const API_BASE_URL = getApiBaseUrl();
console.log("🚀 SAE API Base URL:", API_BASE_URL);

let currentState = {
    userId: null, user: null, games: [], friends: [], friendsData: [],
    activeFilter: 'all', modalFilter: 'all',
    stats: { totalPlatinum: 0, totalAchievementsUnlocked: 0, sumPercentages: 0, gamesCounted: 0, totalPlayableGames: 0 },
    currentModalGame: null,
    scanPaused: false,
    failedGames: [],
    useCache: true,  // Usar cache IndexedDB
    cacheLoaded: false, // Cache carregado?
};
let fetchQueue = []; let activeRequests = 0; const MAX_CONCURRENT_REQUESTS = 15; // Aumentado para scan mais rápido
let friendFetchQueue = []; let activeFriendRequests = 0;

// HowLongToBeat - Cache local e busca dinâmica via API
const hltbCache = JSON.parse(localStorage.getItem('hltbCache') || '{}');
const hltbPending = {}; // Jogos sendo buscados no momento

// Fallback estático para jogos muito populares (evita requisições desnecessárias)
const hltbFallback = {
    72850: [34, 232], 489830: [34, 232], 1245620: [50, 130], 292030: [51, 173],
    1091500: [24, 100], 1174180: [50, 180], 271590: [32, 83], 377160: [27, 157],
    1086940: [75, 160], 367520: [27, 65], 1145360: [22, 97], 814380: [25, 70],
    374320: [32, 96], 570940: [25, 43], 1593500: [21, 53], 1151640: [22, 60],
    413150: [52, 170], 105600: [55, 200], 620: [9, 26], 400: [8, 15]
};

// Função para obter tempo HLTB (primeiro do cache, depois fallback)
function getHLTB(appid) {
    // 1. Tentar cache local
    if (hltbCache[appid] && hltbCache[appid].main > 0) {
        return { main: hltbCache[appid].main, complete: hltbCache[appid].complete };
    }
    // 2. Tentar fallback estático
    const fallback = hltbFallback[appid];
    if (fallback && fallback[0] > 0) {
        return { main: fallback[0], complete: fallback[1] };
    }
    return null;
}

// Busca HLTB do servidor e atualiza o card dinamicamente
async function fetchHLTB(appid, gameName, cardElement) {
    // Evitar requisições duplicadas
    if (hltbPending[appid]) return;
    if (hltbCache[appid]) return;

    hltbPending[appid] = true;

    try {
        // Limpar nome do jogo para busca
        const cleanName = gameName
            .replace(/[™®©]/g, '')
            .replace(/\s*[-–—:]\s*(Definitive|Special|Complete|GOTY|Game of the Year|Remastered|Enhanced|Anniversary|Ultimate|Deluxe|Gold|Premium|Standard|Legacy|Extended|Director's Cut).*$/i, '')
            .replace(/\s*\(.*?\)/g, '')
            .trim();

        let hltbData = null;
        try {
            // Modificação: Enviar nome do jogo limpo como Fallback, já que o backend vai extrair direto da Steam
            // Isso ajuda a localizar jogos removidos da steam ou IDs não-comerciais
            const response = await fetch(`${API_BASE_URL}/hltb.php?appid=${appid}&name=${encodeURIComponent(cleanName)}`);
            if (response.ok) {
                hltbData = await response.json();
            }
        } catch (e) {
            console.error("HLTB Fetch Error:", e);
        }

        if (hltbData && hltbData.found && hltbData.mainStory > 0) {
            // Salvar no cache
            hltbCache[appid] = {
                main: hltbData.mainStory,
                complete: hltbData.completionist || hltbData.mainStory * 2
            };
            localStorage.setItem('hltbCache', JSON.stringify(hltbCache));

            // Atualizar o card se existir
            if (cardElement) {
                const metaRight = cardElement.querySelector('.game-meta-right');
                if (!metaRight) {
                    const metaDiv = cardElement.querySelector('.game-meta');
                    if (metaDiv) {
                        const hltbDiv = document.createElement('div');
                        hltbDiv.className = 'game-meta-right';
                        hltbDiv.innerHTML = `
                                    <span class="hltb-label"><i class="fas fa-stopwatch"></i> HLTB</span>
                                    <span class="hltb-time" title="${t('hltbMain') || 'Zerar'}: ${hltbCache[appid].main}h | ${t('hltb100') || '100%'}: ${hltbCache[appid].complete}h">🎮 ${hltbCache[appid].main}h | 🏆 ${hltbCache[appid].complete}h</span>
                                `;
                        metaDiv.appendChild(hltbDiv);
                    }
                }
            }
        }
    } catch (e) {
        // Servidor não disponível, ignora silenciosamente
    } finally {
        delete hltbPending[appid];
    }
}

// Buscar HLTB para todos os jogos visíveis (com throttle)
let hltbFetchQueue = [];
let hltbFetching = false;

async function processHLTBQueue() {
    if (hltbFetching || hltbFetchQueue.length === 0) return;
    hltbFetching = true;

    while (hltbFetchQueue.length > 0) {
        const { appid, name, card } = hltbFetchQueue.shift();
        await fetchHLTB(appid, name, card);
        await new Promise(r => setTimeout(r, 300)); // 300ms entre requisições
    }

    hltbFetching = false;
}

function queueHLTBFetch(appid, gameName, cardElement) {
    // Só adicionar se não tiver no cache e não estiver na fila
    if (hltbCache[appid] || hltbFallback[appid]) return;
    if (hltbFetchQueue.some(q => q.appid === appid)) return;

    hltbFetchQueue.push({ appid, name: gameName, card: cardElement });
    processHLTBQueue();
}

window.onload = () => {
    loadFromHistory();
    setupEventListeners();

    // Suporte para carregar perfil via URL (Fase 3)
    if (window.INITIAL_STEAMID) {
        document.getElementById('steamInput').value = window.INITIAL_STEAMID;
        handleSearch(false);
    }
};

function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', () => handleSearch());
    document.getElementById('steamInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    document.getElementById('closeModalBtn').addEventListener('click', closeGameModal);
    document.getElementById('achievementModal').addEventListener('click', (e) => { if (e.target === document.getElementById('achievementModal')) closeGameModal(); });
}

// --- API CORE ---
// Agora substituímos a chamada direta à Steam via proxies por uma rota local
async function fetchFromSteam(endpoint, params = {}, retries = 3) {
    let url = `${API_BASE_URL}/proxy.php?endpoint=${encodeURIComponent(endpoint)}`;
    for (const [key, value] of Object.entries(params)) url += `&${key}=${encodeURIComponent(value)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `Erro ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg += `: ${errorData.message}`;
                else if (errorData.error) errorMsg += `: ${errorData.error}`;
            } catch (e) { }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (e) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            return fetchFromSteam(endpoint, params, retries - 1);
        }
        throw new Error(`Falha na API Local: ${e.message}`);
    }
}

// --- MAIN SEARCH ---
async function handleSearch(isRefresh = false, forceRefresh = false) {
    let input = isRefresh && currentState.userId ? currentState.userId : document.getElementById('steamInput').value.trim();
    if (!input) return showToast('Digite um Steam ID ou URL', 'warning');
    if (!isRefresh) { document.getElementById('profileContent').classList.add('hidden'); document.getElementById('searchSection').classList.add('active'); document.getElementById('loader').classList.remove('hidden'); } else { document.getElementById('profileContent').style.opacity = '0.5'; }

    try {
        resetGlobalStats();
        let steamId = input;
        if (isNaN(input)) {
            let vanity = input.includes('/id/') ? input.split('/id/')[1].split('/')[0] : input;
            const res = await fetchFromSteam('ISteamUser/ResolveVanityURL/v0001', { vanityurl: vanity });
            if (res.response && res.response.success === 1) steamId = res.response.steamid;
            else throw new Error("Usuário não encontrado.");
        }
        currentState.userId = steamId; saveToHistory(steamId);

        // ===== VERIFICAR CACHE PRIMEIRO =====
        if (currentState.useCache && !forceRefresh && window.SteamCache) {
            const cachedGames = await SteamCache.getGames(steamId);
            const cachedProfile = await SteamCache.getProfile(steamId);

            if (cachedGames.length > 0 && cachedProfile) {
                console.log('📦 Carregando do cache...');
                currentState.cacheLoaded = true;
                currentState.user = cachedProfile;
                currentState.games = cachedGames.map(g => ({
                    ...g,
                    header_image: g.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
                    playtime_hours: (g.playtime_forever / 60).toFixed(1)
                }));
                currentState.games.sort((a, b) => b.playtime_forever - a.playtime_forever);

                // Salvar também no localStorage para outras páginas
                localStorage.setItem('currentProfile', JSON.stringify(currentState.user));
                localStorage.setItem('currentGames', JSON.stringify(currentState.games));

                // Mostrar dados do cache imediatamente
                if (currentState.games.length > 0) setDynamicBackground(currentState.games[0].appid);

                // Reset e carregar amigos
                currentState.friends = []; currentState.friendsData = [];
                document.getElementById('friendsContainer').innerHTML = '';
                document.getElementById('rankGamesBody').innerHTML = '';
                document.getElementById('rankTimeBody').innerHTML = '';
                friendFetchQueue = []; activeFriendRequests = 0;
                fetchFriends(steamId);

                renderProfile();
                renderGamesGridFromCache(); // Renderiza com dados do cache

                document.getElementById('loader').classList.add('hidden');
                document.getElementById('profileContent').classList.remove('hidden');
                document.getElementById('profileContent').style.opacity = '1';

                // Buscar atualizações em background
                syncFromSteamInBackground(steamId);
                return;
            }
        }

        // ===== BUSCAR DA STEAM API =====
        const profileRes = await fetchFromSteam('ISteamUser/GetPlayerSummaries/v0002', { steamids: steamId });
        currentState.user = profileRes.response.players[0];

        // Salvar perfil no cache
        if (window.SteamCache) {
            await SteamCache.saveProfile(currentState.user);
        }

        // Salvar perfil no localStorage para outras páginas (wallpaper, museum, etc)
        localStorage.setItem('currentProfile', JSON.stringify(currentState.user));

        const gamesRes = await fetchFromSteam('IPlayerService/GetOwnedGames/v0001', { steamid: steamId, include_appinfo: true, format: 'json' });
        if (!gamesRes.response || !gamesRes.response.games) throw new Error("Perfil privado.");
        currentState.games = gamesRes.response.games.map(g => ({ ...g, header_image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`, playtime_hours: (g.playtime_forever / 60).toFixed(1), percent: -1, unlocked: 0, total: 0 }));
        currentState.games.sort((a, b) => b.playtime_forever - a.playtime_forever);

        // Salvar jogos no cache
        if (window.SteamCache) {
            await SteamCache.saveGames(steamId, currentState.games);
        }

        // Salvar jogos no localStorage para outras páginas
        localStorage.setItem('currentGames', JSON.stringify(currentState.games));

        if (currentState.games.length > 0) setDynamicBackground(currentState.games[0].appid);

        // Reset Friends
        currentState.friends = []; currentState.friendsData = [];
        document.getElementById('rankGamesBody').innerHTML = ''; document.getElementById('rankTimeBody').innerHTML = '';
        friendFetchQueue = []; activeFriendRequests = 0;

        fetchFriends(steamId);
        renderProfile(); renderGamesGrid();
        document.getElementById('loader').classList.add('hidden'); document.getElementById('profileContent').classList.remove('hidden'); document.getElementById('profileContent').style.opacity = '1';
    } catch (error) { console.error(error); showToast(error.message, 'error'); document.getElementById('loader').classList.add('hidden'); document.getElementById('profileContent').style.opacity = '1'; }
}

// Renderiza grid usando dados do cache (sem scanning)
function renderGamesGridFromCache() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    fetchQueue = [];
    activeRequests = 0;
    currentState.failedGames = [];
    currentState.scanPaused = false;

    // Contar jogos com stats já no cache
    let gamesWithStats = 0;
    let totalPlayable = 0;

    currentState.games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.id = `game-${game.appid}`;
        card.dataset.percent = game.percent;
        card.dataset.name = game.name.toLowerCase();
        card.onmouseenter = () => setDynamicBackground(game.appid);

        let loadingState = '', pctText = '', progText = '', width = '0%';

        if (game.percent !== -1 && game.percent !== undefined) {
            pctText = `${game.percent}%`;
            progText = `${game.unlocked}/${game.total}`;
            width = `${game.percent}%`;
            gamesWithStats++;
            totalPlayable++; // Jogo com conquistas já carregadas
            if (game.percent === 100) card.classList.add('platinum');
            else if (game.percent >= 70) card.classList.add('platinando');
        } else if (game.has_community_visible_stats) {
            loadingState = '<i class="fas fa-database" style="color:var(--primary-color)" title="Precisa sincronizar"></i>';
            totalPlayable++; // Jogo com conquistas que precisa sincronizar
            fetchQueue.push(game.appid);
        } else {
            loadingState = 'N/A'; // Jogo sem conquistas
        }

        // HLTB data
        const hltb = getHLTB(game.appid);
        let hltbHtml = '';
        if (hltb) {
            hltbHtml = `<div class="game-meta-right">
                        <span class="hltb-label"><i class="fas fa-stopwatch"></i> HLTB</span>
                        <span class="hltb-time" title="${t('hltbMain') || 'História principal'}: ${hltb.main}h | ${t('hltb100') || '100%'}: ${hltb.complete}h">🎮 ${hltb.main}h | 🏆 ${hltb.complete}h</span>
                    </div>`;
        }

        card.innerHTML = `<div class="platinum-badge" style="${game.percent === 100 ? 'display:block' : ''}"><i class="fas fa-trophy"></i> 100%</div><div class="platinando-badge" style="${(game.percent >= 70 && game.percent < 100) ? 'display:block' : ''}"><i class="fas fa-running"></i> ${t('inProgress') || 'Platinando'}</div><img data-src="${game.header_image}" class="game-banner lazy-img" loading="lazy" onerror="this.src='https://placehold.co/600x300/111/FFF?text=No+Image'"><div class="game-details"><div class="game-title">${game.name}</div><div class="game-meta"><div class="game-meta-left"><span><i class="fas fa-clock"></i> ${game.playtime_hours}h ${t('hoursPlayed') || 'jogadas'}</span></div>${hltbHtml}</div><div class="game-progress-info" id="prog-${game.appid}">${loadingState}</div><div class="game-progress-bar-bg"><div class="game-progress-bar-fill" id="bar-${game.appid}" style="width:${width}"></div></div><div class="game-stats-row"><span id="txt-prog-${game.appid}">${progText}</span><span id="txt-pct-${game.appid}">${pctText}</span></div></div>`;
        card.onclick = () => openGameModal(game);
        grid.appendChild(card);

        // Se não tem HLTB no cache, buscar dinamicamente do servidor
        if (!hltb) {
            queueHLTBFetch(game.appid, game.name, card);
        }
    });

    initLazyLoading(); // Iniciar lazy loading

    // Re-anexar listeners de soundtrack se o modo estiver ativo
    if (isSoundtrackModeEnabled) {
        attachSoundtrackListeners();
    }

    currentState.stats.totalPlayableGames = totalPlayable;
    currentState.stats.gamesCounted = gamesWithStats;

    // Recalcular stats com dados do cache
    recalculateTotalStats();

    // Se tem jogos para atualizar, mostrar painel
    if (fetchQueue.length > 0) {
        document.getElementById('scan-progress-container').style.display = 'block';
        showScanPanel();

        // Atualizar título do painel
        const titleEl = document.querySelector('.scan-status-title');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-sync fa-spin"></i> ATUALIZANDO CACHE';

        processQueue();
    } else {
        // Tudo já está no cache
        updateScanPanel();
        const cacheStats = { games: currentState.games.length, withStats: gamesWithStats };
        console.log('✅ Todos os dados carregados do cache:', cacheStats);
    }
}

// Sincroniza dados da Steam em background (para atualizar cache)
async function syncFromSteamInBackground(steamId) {
    console.log('🔄 Sincronizando em background...');
    try {
        // Buscar lista de jogos atualizada
        const gamesRes = await fetchFromSteam('IPlayerService/GetOwnedGames/v0001', { steamid: steamId, include_appinfo: true, format: 'json' });
        if (gamesRes.response && gamesRes.response.games) {
            const newGames = gamesRes.response.games;
            const currentIds = currentState.games.map(g => g.appid);
            const newGamesList = newGames.filter(g => !currentIds.includes(g.appid));

            if (newGamesList.length > 0) {
                console.log(`🆕 ${newGamesList.length} novos jogos encontrados!`);
                // Adicionar novos jogos ao estado e cache
                const formattedGames = newGamesList.map(g => ({
                    ...g,
                    header_image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
                    playtime_hours: (g.playtime_forever / 60).toFixed(1),
                    percent: -1,
                    unlocked: 0,
                    total: 0
                }));

                currentState.games.push(...formattedGames);
                if (window.SteamCache) {
                    await SteamCache.saveGames(steamId, formattedGames);
                }

                // Re-renderizar para mostrar novos jogos
                renderGamesGridFromCache();
            }
        }
    } catch (e) {
        console.log('Background sync error (ignorado):', e.message);
    }
}

// Força atualização completa (limpa cache)
async function forceFullRefresh() {
    if (!currentState.userId) return;
    if (window.SteamCache) {
        await SteamCache.clearUserCache(currentState.userId);
        console.log('🗑️ Cache limpo');
    }
    currentState.cacheLoaded = false;
    handleSearch(true, true);
}

async function fetchFriends(steamId) {
    try {
        const res = await fetchFromSteam('ISteamUser/GetFriendList/v0001', { steamid: steamId, relationship: 'friend' });
        if (res.friendslist && res.friendslist.friends) {
            const allIds = res.friendslist.friends.map(f => f.steamid);
            const container = document.getElementById('friendsContainer');
            if (container) container.innerHTML = '';
            const batchSize = 100;
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize).join(',');
                const profiles = await fetchFromSteam('ISteamUser/GetPlayerSummaries/v0002', { steamids: batch });
                renderFriendsList(profiles.response.players);
                profiles.response.players.forEach(f => { friendFetchQueue.push(f); });
            }
            processFriendQueue();
        }
    } catch (e) { console.log("Amigos privados"); }
}

function processFriendQueue() {
    if (friendFetchQueue.length === 0) { document.querySelectorAll('.ranking-loader').forEach(el => el.style.display = 'none'); return; }
    document.querySelectorAll('.ranking-loader').forEach(el => el.style.display = 'inline-block');
    while (activeFriendRequests < 6 && friendFetchQueue.length > 0) {
        const friend = friendFetchQueue.shift(); activeFriendRequests++;
        fetchOwnedGamesForFriend(friend).finally(() => { activeFriendRequests--; processFriendQueue(); });
    }
}

async function fetchOwnedGamesForFriend(friend) {
    try {
        const res = await fetchFromSteam('IPlayerService/GetOwnedGames/v0001', { steamid: friend.steamid, include_appinfo: false, include_played_free_games: false });
        if (res.response) {
            const gameCount = res.response.game_count || 0;
            let playtime = 0; if (res.response.games) res.response.games.forEach(g => playtime += g.playtime_forever);
            const hours = (playtime / 60).toFixed(0);
            currentState.friendsData.push({ ...friend, gameCount: gameCount, playtimeHours: parseInt(hours) });
            renderRankings();
        }
    } catch (e) { }
}

function renderRankings() {
    const gamesSorted = [...currentState.friendsData].sort((a, b) => b.gameCount - a.gameCount).slice(0, 50);
    const gamesBody = document.getElementById('rankGamesBody');
    if (gamesBody) {
        gamesBody.innerHTML = '';
        gamesSorted.forEach((f, index) => { gamesBody.innerHTML += `<tr class="rank-row"><td class="rank-pos">${index + 1}</td><td class="rank-user"><img src="${f.avatar}" class="rank-avatar">${f.personaname}</td><td class="rank-val">${f.gameCount}</td></tr>`; });
    }
    const timeSorted = [...currentState.friendsData].sort((a, b) => b.playtimeHours - a.playtimeHours).slice(0, 50);
    const timeBody = document.getElementById('rankTimeBody');
    if (timeBody) {
        timeBody.innerHTML = '';
        timeSorted.forEach((f, index) => { timeBody.innerHTML += `<tr class="rank-row"><td class="rank-pos">${index + 1}</td><td class="rank-user"><img src="${f.avatar}" class="rank-avatar">${f.personaname}</td><td class="rank-val">${f.playtimeHours}h</td></tr>`; });
    }
}

// --- RENDERIZAÇÃO ---
function renderProfile() {
    document.getElementById('userAvatar').src = currentState.user.avatarfull;
    document.getElementById('userNameText').innerText = currentState.user.personaname;
    document.getElementById('totalGames').innerText = currentState.games.length;
    updateHunterTitle();

    // Verificar se conta tem +10 anos para badge Old School
    const oldSchoolBadge = document.getElementById('oldSchoolBadge');
    const accountCreatedTimestamp = currentState.user.timecreated;

    if (accountCreatedTimestamp) {
        const accountAge = (Date.now() / 1000 - accountCreatedTimestamp) / (365.25 * 24 * 60 * 60);
        if (accountAge >= 10) {
            oldSchoolBadge.style.display = 'inline-flex';
            oldSchoolBadge.title = `Conta criada há ${Math.floor(accountAge)} anos`;
        } else {
            oldSchoolBadge.style.display = 'none';
        }
    } else {
        // Tentar detectar conta antiga pelo Steam ID (contas antigas tem IDs menores)
        // Steam ID 64 = 76561197960265728 + ID32
        // Contas criadas antes de 2015 (10+ anos atrás) geralmente tem steamid64 menor
        const steamId64 = BigInt(currentState.user.steamid || '0');
        const baseId = BigInt('76561197960265728'); // Base do Steam ID 64

        // Aproximação: contas criadas até ~2015 (para ter 10+ anos em 2025)
        // Threshold aproximado para contas de 2014-2015
        const threshold10Years = BigInt('76561198150000000'); // ~2014-2015

        if (steamId64 > 0 && steamId64 < threshold10Years) {
            // Conta provavelmente antiga (10+ anos)
            oldSchoolBadge.style.display = 'inline-flex';
            oldSchoolBadge.title = 'Conta veterana do Steam (10+ anos estimado pelo ID)';
        } else {
            oldSchoolBadge.style.display = 'none';
        }
    }

    // Adicionar badge de cache se carregou do cache
    const profileHero = document.querySelector('.profile-hero');
    const existingBadge = profileHero.querySelector('.cache-badge');
    if (existingBadge) existingBadge.remove();

    if (currentState.cacheLoaded) {
        const badge = document.createElement('div');
        badge.className = 'cache-badge';
        badge.innerHTML = '<i class="fas fa-database"></i> CACHE';
        badge.title = 'Dados carregados do cache local (instantâneo!)';
        profileHero.appendChild(badge);
    }

    // Carregar badges do site (Fase 3)
    loadUserBadges(currentState.userId);
}

function updateHunterTitle() {
    const plats = currentState.stats.totalPlatinum;
    const el = document.getElementById('hunterTitle');
    if (!el) return;
    let title = "Iniciante"; let cls = "";
    if (plats >= 50) { title = "DEUS DA PLATINA"; cls = "legendary"; }
    else if (plats >= 20) { title = "Colecionador de Elite"; }
    else if (plats >= 5) { title = "Caçador de Troféus"; }
    el.innerText = title; el.className = "hunter-title " + cls;
}

function renderGamesGrid() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = ''; fetchQueue = []; activeRequests = 0;
    currentState.failedGames = []; // Reset failed games
    currentState.scanPaused = false;
    currentState.stats.totalPlayableGames = currentState.games.filter(g => g.has_community_visible_stats).length;
    updateGlobalStatsUI();

    // Show scan panel and progress bar
    document.getElementById('scan-progress-container').style.display = 'block';
    showScanPanel();

    currentState.games.forEach(game => {
        const card = document.createElement('div'); card.className = 'game-card'; card.id = `game-${game.appid}`; card.dataset.percent = game.percent; card.dataset.name = game.name.toLowerCase();
        card.onmouseenter = () => setDynamicBackground(game.appid);
        let loadingState = '', pctText = '', progText = '', width = '0%';
        if (game.percent !== -1) { pctText = `${game.percent}%`; progText = `${game.unlocked}/${game.total}`; width = `${game.percent}%`; if (game.percent === 100) card.classList.add('platinum'); else if (game.percent >= 70) card.classList.add('platinando'); } else if (game.has_community_visible_stats) { loadingState = '<i class="fas fa-spinner fa-spin"></i>'; } else { loadingState = 'N/A'; }

        // HLTB data
        // Removendo o HLTB Batch Fetching daqui da listagem Principal para não causar Rate Limit no Scraper
        // Carregaremos as horas do jogo APENAS quando o usuário abrir o modal "openGameModal"
        let hltbHtml = '';
        const hltb = getHLTB(game.appid); // Check if HLTB data is already in cache
        if (hltb) {
            hltbHtml = `<div class="game-meta-right">
                        <span class="hltb-label"><i class="fas fa-stopwatch"></i> HLTB</span>
                        <span class="hltb-time" title="${t('hltbMain') || 'História principal'}: ${hltb.main}h | ${t('hltb100') || '100%'}: ${hltb.complete}h">🎮 ${hltb.main}h | 🏆 ${hltb.complete}h</span>
                    </div>`;
        } else {
            // Placeholder for HLTB data if not in cache
            hltbHtml = `<div class="game-meta-right">
                        <span class="hltb-label"><i class="fas fa-stopwatch"></i> HLTB</span>
                        <span class="hltb-time hltb-unavailable" title="Tempo de zeramento será carregado ao abrir o modal">--h | --h</span>
                    </div>`;
        }

        card.innerHTML = `
                    <div class="platinum-badge" style="${game.percent === 100 ? 'display:block' : ''}"><i class="fas fa-trophy"></i> 100%</div>
                    <div class="platinando-badge" style="${(game.percent >= 70 && game.percent < 100) ? 'display:block' : ''}"><i class="fas fa-running"></i> ${t('inProgress') || 'Platinando'}</div>
                    <img data-src="${game.header_image}" class="game-banner lazy-img" loading="lazy" onerror="this.src='https://placehold.co/600x300/111/FFF?text=No+Image'">
                    <div class="game-details">
                        <div class="game-title">${game.name}</div>
                        <div class="game-meta">
                            <div class="game-meta-left"><span><i class="fas fa-clock"></i> ${game.playtime_hours}h ${t('hoursPlayed') || 'jogadas'}</span></div>
                            ${hltbHtml}
                        </div>
                        <div class="game-progress-info" id="prog-${game.appid}">${loadingState}</div>
                        <div class="game-progress-bar-bg"><div class="game-progress-bar-fill" id="bar-${game.appid}" style="width:${width}"></div></div>
                        <div class="game-stats-row"><span id="txt-prog-${game.appid}">${progText}</span><span id="txt-pct-${game.appid}">${pctText}</span></div>
                    </div>`;
        card.onclick = () => openGameModal(game); grid.appendChild(card);

        // Se não tem HLTB no cache, buscar dinamicamente do servidor
        if (!hltb) {
            queueHLTBFetch(game.appid, game.name, card);
        }

        if (game.has_community_visible_stats && game.percent === -1) fetchQueue.push(game.appid);
    });
    initLazyLoading(); // Iniciar lazy loading
    processQueue();

    // Re-anexar listeners de soundtrack se o modo estiver ativo
    if (isSoundtrackModeEnabled) {
        attachSoundtrackListeners();
    }
}

function processQueue() {
    if (currentState.scanPaused) return; // Paused

    updateScanPanel(); // Update stats

    if (fetchQueue.length === 0 && activeRequests === 0) {
        // Scan complete
        document.getElementById('scan-progress-container').style.display = 'none';
        finishScan();
        return;
    }

    const processed = currentState.stats.gamesCounted;
    const total = currentState.stats.totalPlayableGames;
    const barWidth = total > 0 ? (processed / total) * 100 : 0;
    document.getElementById('scan-progress-bar').style.width = `${barWidth}%`;

    while (activeRequests < MAX_CONCURRENT_REQUESTS && fetchQueue.length > 0) {
        const appId = fetchQueue.shift(); activeRequests++;
        fetchGameStats(appId).finally(() => { activeRequests--; processQueue(); });
    }
}

async function fetchGameStats(appId) {
    const progEl = document.getElementById(`prog-${appId}`);
    const card = document.getElementById(`game-${appId}`);
    if (!progEl) return;

    try {
        const res = await fetchFromSteam('ISteamUserStats/GetPlayerAchievements/v0001', { steamid: currentState.userId, appid: appId }, 4);
        if (res.playerstats && res.playerstats.achievements) {
            const achievements = res.playerstats.achievements;
            const total = achievements.length;
            const unlocked = achievements.filter(a => a.achieved === 1).length;
            const percent = total > 0 ? Math.floor((unlocked / total) * 100) : 0;
            const gameIdx = currentState.games.findIndex(g => g.appid === appId);
            if (gameIdx > -1) {
                currentState.games[gameIdx].percent = percent;
                currentState.games[gameIdx].unlocked = unlocked;
                currentState.games[gameIdx].total = total;
            }

            // ===== SALVAR NO CACHE =====
            if (window.SteamCache) {
                // Salvar stats do jogo
                await SteamCache.updateGameStats(currentState.userId, appId, { percent, unlocked, total });
                // Salvar conquistas individuais
                await SteamCache.saveAchievements(currentState.userId, appId, achievements);
            }

            if (progEl && card) {
                progEl.innerHTML = '<i class="fas fa-database" style="color:var(--success)" title="Salvo no cache"></i>';
                document.getElementById(`txt-prog-${appId}`).innerText = `${unlocked}/${total}`;
                document.getElementById(`txt-pct-${appId}`).innerText = `${percent}%`;
                document.getElementById(`bar-${appId}`).style.width = `${percent}%`;
                card.dataset.percent = percent;
                if (percent === 100) card.classList.add('platinum');
                else if (percent >= 70) card.classList.add('platinando');
            }

            // ===== SINCRONIZAR COM O SERVIDOR (Fase 3) =====
            fetch(`${API_BASE_URL}/sync_game.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    steamid: currentState.userId,
                    appid: appId,
                    unlocked: unlocked,
                    total: total,
                    percent: percent,
                    playtime: currentState.games.find(g => g.appid === appId)?.playtime_forever || 0
                })
            }).catch(e => console.log("Sync Error", e));

            recalculateTotalStats();
        } else {
            if (progEl) progEl.innerText = "Sem Conquistas";
            if (card) card.dataset.percent = 0;
        }
    } catch (e) {
        // Failed - add to retry list
        currentState.failedGames.push(appId);
        if (progEl) progEl.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:var(--warning)"></i>';
        if (card) card.dataset.percent = 0;
    } finally {
        currentState.stats.gamesCounted++;
        if (currentState.activeFilter !== 'all') filterGames();
    }
}

// === SCAN PANEL FUNCTIONS ===
function showScanPanel() {
    const panel = document.getElementById('scanStatusPanel');
    if (panel) {
        panel.classList.add('active');
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pausar';
        document.getElementById('retryBtn').disabled = true;
    }
}

function closeScanPanel() {
    const panel = document.getElementById('scanStatusPanel');
    if (panel) panel.classList.remove('active');
}

function updateScanPanel() {
    const totalAllEl = document.getElementById('scanTotalAllGames');
    const noAchievementsEl = document.getElementById('scanNoAchievements');
    const completedEl = document.getElementById('scanCompleted');
    const achievementsEl = document.getElementById('scanAchievements');
    const failedEl = document.getElementById('scanFailed');
    const cacheEl = document.getElementById('scanCacheSize');

    const totalGames = currentState.games.length;
    const gamesWithAchievements = currentState.stats.totalPlayableGames;
    const gamesWithoutAchievements = totalGames - gamesWithAchievements;

    if (totalAllEl) totalAllEl.innerText = totalGames;
    if (noAchievementsEl) noAchievementsEl.innerText = gamesWithoutAchievements;
    if (completedEl) completedEl.innerText = currentState.stats.gamesCounted;
    if (achievementsEl) achievementsEl.innerText = currentState.stats.totalAchievementsUnlocked.toLocaleString();
    if (failedEl) failedEl.innerText = currentState.failedGames.length;

    // Atualizar tamanho do cache
    if (cacheEl && window.SteamCache) {
        SteamCache.getCacheSize().then(size => {
            cacheEl.innerText = `${size.usedMB} MB`;
        });
    }
}

function finishScan() {
    const titleEl = document.querySelector('.scan-status-title');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success)"></i> COMPLETO';

    const retryBtn = document.getElementById('retryBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    if (retryBtn) retryBtn.disabled = currentState.failedGames.length === 0;
    if (pauseBtn) pauseBtn.disabled = true;

    updateScanPanel();
}

function pauseResumeScan() {
    currentState.scanPaused = !currentState.scanPaused;
    const btn = document.getElementById('pauseBtn');
    if (currentState.scanPaused) {
        btn.innerHTML = '<i class="fas fa-play"></i> Retomar';
    } else {
        btn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        processQueue(); // Resume
    }
}

function retryScanFailed() {
    if (currentState.failedGames.length === 0) return;

    const titleEl = document.querySelector('.scan-status-title');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-sync fa-spin"></i> RETRY';

    // Add failed games back to queue
    fetchQueue = [...currentState.failedGames];
    currentState.failedGames = [];
    currentState.scanPaused = false;

    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('retryBtn').disabled = true;
    document.getElementById('scan-progress-container').style.display = 'block';

    processQueue();
}

function recalculateTotalStats() {
    let tPlat = 0, tAch = 0, sumPct = 0, count = 0;
    currentState.games.forEach(g => { if (g.percent !== -1 && g.total > 0) { tAch += g.unlocked; sumPct += g.percent; count++; if (g.percent === 100) tPlat++; } });
    document.getElementById('totalPlatinum').innerText = tPlat; document.getElementById('totalAchievements').innerText = tAch.toLocaleString();
    const completionRateEl = document.getElementById('completionRate'); if (completionRateEl) { const avg = count > 0 ? (sumPct / count).toFixed(0) : 0; completionRateEl.innerText = `${avg}%`; }
    currentState.stats.totalPlatinum = tPlat; currentState.stats.totalAchievementsUnlocked = tAch;
    currentState.stats.gamesCounted = count;
    updateHunterTitle();
    updateHeaderXP();

    // Atualizar localStorage de jogos a cada 10 atualizações para outras páginas usarem
    if (count % 10 === 0 || tPlat > 0) {
        localStorage.setItem('currentGames', JSON.stringify(currentState.games));
    }
}

function updateHeaderXP() {
    const stats = currentState.stats;
    // Fórmula de XP: conquistas * 10 + platinas * 500 + jogos escaneados * 25
    const totalXP = (stats.totalAchievementsUnlocked || 0) * 10 + (stats.totalPlatinum || 0) * 500 + (stats.gamesCounted || 0) * 25;
    // Fórmula de level: sqrt(xp / 100) - progressão quadrática
    const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
    const xpForCurrent = 100 * (level * level);
    const xpForNext = 100 * ((level + 1) * (level + 1));
    const xpInLevel = totalXP - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    const percent = xpNeeded > 0 ? Math.max(0, Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))) : 0;

    const container = document.getElementById('headerXpContainer');
    if (!container) return;
    document.getElementById('hLvl').innerText = `Lv ${level}`;
    document.getElementById('hBar').style.width = `${percent}%`;
    document.getElementById('hText').innerText = `${xpInLevel}/${xpNeeded}`;
    container.style.display = 'flex';

    // Salvar no localStorage para outras páginas
    localStorage.setItem('userStats', JSON.stringify({
        totalAchievementsUnlocked: stats.totalAchievementsUnlocked,
        totalPlatinum: stats.totalPlatinum,
        gamesCounted: stats.gamesCounted,
        totalXP: totalXP,
        level: level
    }));

    // Atualizar heatmap e radar se tiver dados
    if (window.SteamCache && currentState.userId) {
        updateHeatmap();
        updateRadarChart();
    }
}

// ===== RADAR DE GÊNEROS =====
let genreRadarChartInstance = null;
let radarFetching = false;

async function updateRadarChart() {
    if (!currentState.userId || currentState.games.length === 0 || radarFetching) return;

    // Só atualiza quando tivermos uma base boa (ex: cache carregado ou scan quase pronto)
    if (currentState.stats.gamesCounted < 5 && fetchQueue.length > 0) return;

    radarFetching = true;
    try {
        // Pegar os top 20 jogos mais jogados do usuário
        const topGames = [...currentState.games]
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            .slice(0, 15);

        if (topGames.length === 0) {
            document.getElementById('radarSection').style.display = 'none';
            return;
        }

        document.getElementById('radarSection').style.display = 'block';

        // Contar gêneros
        const genreCounts = {};

        // Buscar gêneros via nossa API PHP
        const genrePromises = topGames.map(g => fetch(`${API_BASE_URL}/genre.php?appid=${g.appid}`).then(r => r.json()));
        const results = await Promise.allSettled(genrePromises);

        results.forEach(res => {
            if (res.status === 'fulfilled' && res.value && res.value.success) {
                res.value.genres.forEach(g => {
                    if (!genreCounts[g]) genreCounts[g] = 0;
                    genreCounts[g]++;
                });
            }
        });

        // Pegar os top 6-8 gêneros para o Radar não ficar poluído
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        const labels = sortedGenres.map(g => g[0]);
        const data = sortedGenres.map(g => g[1]);

        if (labels.length === 0) return;

        const ctx = document.getElementById('genreRadarChart');
        if (!ctx) return;

        // Se já existe, destrói para recriar
        if (genreRadarChartInstance) {
            genreRadarChartInstance.destroy();
        }

        // Configuração visual Dark/Neon do Chart.js
        Chart.defaults.color = '#ccc';
        Chart.defaults.font.family = "'Rajdhani', sans-serif";

        genreRadarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gêneros Mais Jogados',
                    data: data,
                    backgroundColor: 'rgba(102, 192, 244, 0.2)',
                    borderColor: 'rgba(102, 192, 244, 1)',
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(102, 192, 244, 1)',
                    pointHoverBackgroundColor: 'rgba(102, 192, 244, 1)',
                    pointHoverBorderColor: '#fff',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { font: { size: 14 } },
                        ticks: { display: false, stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (e) {
        console.error("Erro no Radar Chart", e);
    } finally {
        radarFetching = false;
    }
}

// ===== HEATMAP CALENDAR =====
let heatmapTooltip = null;

async function updateHeatmap() {
    if (!window.SteamCache || !currentState.userId) return;

    try {
        // Buscar todas as conquistas do cache
        const games = await SteamCache.getGames(currentState.userId);
        const allAchievements = [];

        for (const game of games) {
            const achs = await SteamCache.getAchievements(currentState.userId, game.appid);
            allAchievements.push(...achs.filter(a => a.unlocked && a.unlocktime > 0));
        }

        if (allAchievements.length === 0) {
            document.getElementById('heatmapSection').style.display = 'none';
            return;
        }

        // Mostrar seção
        document.getElementById('heatmapSection').style.display = 'block';

        // Agrupar conquistas por dia
        const achByDay = {};
        allAchievements.forEach(ach => {
            const date = new Date(ach.unlocktime * 1000);
            const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!achByDay[key]) achByDay[key] = [];
            achByDay[key].push(ach);
        });

        // Calcular streak atual
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const key = checkDate.toISOString().split('T')[0];
            if (achByDay[key]) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        // Atualizar stats
        document.getElementById('heatmapTotal').innerText = `${allAchievements.length} conquistas`;
        document.getElementById('heatmapStreak').innerText = `🔥 ${streak} dias de streak`;

        // Renderizar grid (último ano)
        renderHeatmapGrid(achByDay);

    } catch (e) {
        console.error('Erro ao atualizar heatmap:', e);
    }
}

function renderHeatmapGrid(achByDay) {
    const grid = document.getElementById('heatmapGrid');
    const monthsContainer = document.getElementById('heatmapMonths');
    grid.innerHTML = '';
    monthsContainer.innerHTML = '';

    // Gerar últimas 52 semanas (364 dias)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Ajustar para começar no domingo
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Meses
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    let currentMonth = -1;
    let monthSpans = [];
    let weekCount = 0;

    // Gerar células
    const cells = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
        const month = currentDate.getMonth();
        if (month !== currentMonth) {
            if (monthSpans.length > 0) {
                monthSpans[monthSpans.length - 1].weeks = weekCount;
            }
            monthSpans.push({ name: months[month], weeks: 0 });
            currentMonth = month;
            weekCount = 0;
        }

        if (currentDate.getDay() === 0) weekCount++;

        const key = currentDate.toISOString().split('T')[0];
        const count = achByDay[key] ? achByDay[key].length : 0;
        let level = 0;
        if (count >= 10) level = 4;
        else if (count >= 6) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${level}`;
        cell.dataset.date = key;
        cell.dataset.count = count;

        // Eventos de tooltip
        cell.addEventListener('mouseenter', showHeatmapTooltip);
        cell.addEventListener('mouseleave', hideHeatmapTooltip);

        grid.appendChild(cell);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Finalizar último mês
    if (monthSpans.length > 0) {
        monthSpans[monthSpans.length - 1].weeks = weekCount;
    }

    // Renderizar labels de meses
    monthSpans.forEach(m => {
        const span = document.createElement('span');
        span.innerText = m.name;
        span.style.width = `${m.weeks * 14}px`;
        monthsContainer.appendChild(span);
    });
}

function showHeatmapTooltip(e) {
    const cell = e.target;
    const date = cell.dataset.date;
    const count = parseInt(cell.dataset.count);

    if (!heatmapTooltip) {
        heatmapTooltip = document.createElement('div');
        heatmapTooltip.className = 'heatmap-tooltip';
        document.body.appendChild(heatmapTooltip);
    }

    const dateObj = new Date(date + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    heatmapTooltip.innerHTML = `<strong>${count} conquista${count !== 1 ? 's' : ''}</strong> em ${formattedDate}`;
    heatmapTooltip.style.display = 'block';

    const rect = cell.getBoundingClientRect();
    heatmapTooltip.style.left = `${rect.left + window.scrollX - heatmapTooltip.offsetWidth / 2 + 6}px`;
    heatmapTooltip.style.top = `${rect.top + window.scrollY - heatmapTooltip.offsetHeight - 8}px`;
}

function hideHeatmapTooltip() {
    if (heatmapTooltip) {
        heatmapTooltip.style.display = 'none';
    }
}

function updateGlobalStatsUI() { }
function resetGlobalStats() { currentState.stats = { totalPlatinum: 0, totalAchievementsUnlocked: 0, sumPercentages: 0, gamesCounted: 0, totalPlayableGames: 0 }; document.getElementById('totalPlatinum').innerText = '0'; document.getElementById('totalAchievements').innerText = '0'; const completionRateEl = document.getElementById('completionRate'); if (completionRateEl) completionRateEl.innerText = '0%'; fetchQueue = []; activeRequests = 0; }
function retryModalLoad() { if (currentState.currentModalGame) openGameModal(currentState.currentModalGame); }

async function openGameModal(game) {
    currentState.currentModalGame = game;
    const modal = document.getElementById('achievementModal');
    const title = document.getElementById('modalGameTitle');
    const list = document.getElementById('achievementsList');
    const loader = document.getElementById('modalLoader');
    title.innerText = game.name;
    list.innerHTML = '';
    list.classList.add('hidden');
    loader.classList.remove('hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Injetar estrutura base para Metacritic e HLTB
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        const gameInfo = modalBody.querySelector('.game-info');
        if (gameInfo) {
            // Garantir que temos o container para o Metacritic ao lado do título/stats
            let metaCont = document.getElementById('modal-metacritic-container');
            if (!metaCont) {
                metaCont = document.createElement('div');
                metaCont.id = 'modal-metacritic-container';
                gameInfo.appendChild(metaCont);
            }
            // Limpar conteúdo anterior
            metaCont.innerHTML = '';

            // Garantir que temos o container para o HLTB
            let hltbCont = document.getElementById('modal-hltb-container');
            if (!hltbCont) {
                hltbCont = document.createElement('div');
                hltbCont.id = 'modal-hltb-container';
                hltbCont.className = 'hltb-loading';
                gameInfo.appendChild(hltbCont);
            }
            hltbCont.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando tempos...';
        }
    }

    // Disparar a busca HLTB on-demand para não trancar a grade de jogos
    fetch(`${API_BASE_URL}/hltb.php?appid=${game.appid}&name=${encodeURIComponent(game.name)}`)
        .then(res => res.json())
        .then(data => {
            const gridHltb = document.getElementById(`hltb-grid-${game.appid}`);
            if (data && data.found) {
                const main = data.mainStory || '--';
                const comp = data.completionist || '--';
                const ht = `<span class="hltb-main"><i class="fas fa-clock"></i> ${main}h</span> | <span class="hltb-comp"><i class="fas fa-trophy"></i> ${comp}h</span>`;
                if (gridHltb) gridHltb.innerHTML = ht;
                // Cache para próximas aberturas
                hltbCache[game.appid] = { main: main, complete: comp };
                localStorage.setItem('hltbCache', JSON.stringify(hltbCache));
            } else {
                if (gridHltb) gridHltb.innerHTML = '<span class="hltb-unavailable">Sem dados</span>';
            }
        }).catch(err => console.error("HLTB Fetch Error:", err));

    // Disparar a busca Metacritic on-demand (Assíncrono para não travar o modal)
    fetch(`${API_BASE_URL}/metacritic.php?appid=${game.appid}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('modal-metacritic-container');
            if (data && data.found) {
                let colorClass = 'mc-green';
                if (data.score < 75) colorClass = 'mc-yellow';
                if (data.score < 50) colorClass = 'mc-red';

                if (container) {
                    container.innerHTML = `
                        <a href="${data.url}" target="_blank" class="metacritic-badge ${colorClass}" title="Ver review oficial do Metacritic">
                            <span class="mc-score">${data.score}</span>
                        </a>
                    `;
                }
            } else {
                if (container) container.innerHTML = ''; // Se não achar esconde
            }
        }).catch(err => console.error("Metacritic Fetch Error:", err));

    try {
        let playerAch = [];
        let schemaAch = [];
        let globalPerc = {};
        let fromCache = false;
        let needsSchemaFetch = false;

        // ===== TENTAR CACHE PRIMEIRO =====
        if (window.SteamCache) {
            const cachedAch = await SteamCache.getAchievements(currentState.userId, game.appid);
            if (cachedAch.length > 0) {
                console.log(`📦 ${cachedAch.length} conquistas carregadas do cache`);
                fromCache = true;

                // Verificar se cache tem dados completos (nome real, não só apiname)
                const hasCompleteData = cachedAch.some(a => a.name && a.name !== a.apiname && a.percent);

                if (hasCompleteData) {
                    // Converter do formato de cache completo
                    playerAch = cachedAch.map(a => ({
                        apiname: a.apiname,
                        achieved: a.unlocked || a.achieved ? 1 : 0,
                        unlocktime: a.unlocktime
                    }));
                    cachedAch.forEach(a => {
                        if (a.percent) globalPerc[a.apiname] = a.percent;
                    });
                    schemaAch = cachedAch.map(a => ({
                        name: a.apiname,
                        displayName: a.name || a.apiname,
                        description: a.description || 'Conquista Secreta',
                        icon: a.icon || '',
                        icongray: a.icongray || ''
                    }));
                } else {
                    // Cache incompleto - tem só dados básicos, precisa buscar schema
                    console.log('⚠️ Cache incompleto, buscando schema...');
                    playerAch = cachedAch.map(a => ({
                        apiname: a.apiname || a.name,
                        achieved: a.unlocked || a.achieved ? 1 : 0,
                        unlocktime: a.unlocktime
                    }));
                    needsSchemaFetch = true;
                }
            }
        }

        // ===== SE NÃO TEM NO CACHE OU CACHE INCOMPLETO, BUSCAR DA API =====
        if (!fromCache || needsSchemaFetch) {
            // Se não tem playerAch, buscar
            if (!fromCache) {
                const playerRes = await fetchFromSteam('ISteamUserStats/GetPlayerAchievements/v0001', { steamid: currentState.userId, appid: game.appid });
                if (!playerRes.playerstats || !playerRes.playerstats.achievements) throw new Error("Sem dados.");
                playerAch = playerRes.playerstats.achievements;
            }

            // Buscar schema com nomes em português
            const schemaRes = await fetchFromSteam('ISteamUserStats/GetSchemaForGame/v0002', { appid: game.appid, l: 'brazilian' });
            schemaAch = schemaRes.game && schemaRes.game.availableGameStats ? schemaRes.game.availableGameStats.achievements : [];

            // Buscar porcentagens globais
            try {
                const globalRes = await fetchFromSteam('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002', { gameid: game.appid });
                if (globalRes.achievementpercentages) {
                    globalRes.achievementpercentages.achievements.forEach(a => { globalPerc[a.name] = a.percent; });
                }
            } catch (e) { console.log('Porcentagens globais não disponíveis'); }

            // Salvar dados completos no cache
            if (window.SteamCache) {
                const achToSave = playerAch.map(p => {
                    const schema = schemaAch.find(s => s.name === p.apiname) || {};
                    return {
                        apiname: p.apiname,
                        name: schema.displayName || p.apiname,
                        description: schema.description || 'Conquista Secreta',
                        icon: schema.icon || '',
                        icongray: schema.icongray || '',
                        unlocked: p.achieved === 1,
                        unlocktime: p.unlocktime || 0,
                        percent: globalPerc[p.apiname] || 0
                    };
                });
                await SteamCache.saveAchievements(currentState.userId, game.appid, achToSave);
                await SteamCache.saveGameSchema(game.appid, { achievements: schemaAch });
            }
        }

        const fullList = playerAch.map(p => {
            const schema = schemaAch.find(s => s.name === p.apiname) || {};
            let rawPercent = globalPerc[p.apiname]; let percent = "N/A";
            if (typeof rawPercent === 'number') { percent = rawPercent.toFixed(1); } else if (typeof rawPercent === 'string' && !isNaN(parseFloat(rawPercent))) { percent = parseFloat(rawPercent).toFixed(1); rawPercent = parseFloat(rawPercent); }
            let rClass = 'rarity-common'; let rText = 'Comum';
            if (percent !== "N/A") { if (rawPercent < 10) { rClass = 'rarity-ultra'; rText = 'Ultra Rara'; } else if (rawPercent < 30) { rClass = 'rarity-rare'; rText = 'Rara'; } }
            return { api: p.apiname, unlocked: p.achieved === 1, name: schema.displayName || p.apiname, desc: schema.description || "Conquista Secreta", icon: p.achieved ? schema.icon : schema.icongray, percent: percent, rarityClass: rClass, rarityText: rText };
        });
        renderAchievementList(fullList); list.dataset.fullData = JSON.stringify(fullList); loader.classList.add('hidden'); list.classList.remove('hidden');
    } catch (error) { console.error(error); }
}

function renderAchievementList(list) {
    const container = document.getElementById('achievementsList'); container.innerHTML = '';
    list.forEach(ach => {
        if (currentState.modalFilter === 'unlocked' && !ach.unlocked) return; if (currentState.modalFilter === 'locked' && ach.unlocked) return;
        container.innerHTML += `<div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}"><img src="${ach.icon}" class="ach-icon" onerror="this.src='https://placehold.co/64/black/white?text=?'"><div class="ach-info"><div class="ach-name">${ach.name} <span class="rarity-tag ${ach.rarityClass}">${ach.rarityText} (${ach.percent}%)</span></div><div class="ach-desc">${ach.desc}</div></div><div class="ach-status"><i class="fas ${ach.unlocked ? 'fa-check-circle' : 'fa-lock'}"></i></div></div>`;
    });
}

function renderFriendsList(friends) {
    const container = document.getElementById('friendsContainer');
    friends.forEach(f => {
        container.innerHTML += `<button class="friend-card" onclick="triggerSearch('${f.steamid}')" title="${f.personaname}"><img src="${f.avatarfull}" class="friend-avatar"><div class="friend-name">${f.personaname}</div></button>`;
    });
}

/* --- EXTRAS --- */
function openSignatureModal() {
    if (!currentState.userId) return showToast(t('toast_enterSteamId') || 'Pesquise um perfil primeiro', 'warning');
    const select = document.getElementById('sigGameSelect'); select.innerHTML = '';
    const validGames = currentState.games.filter(g => g.name);
    validGames.forEach(g => { const opt = document.createElement('option'); opt.value = g.appid; opt.innerText = g.name; select.appendChild(opt); });
    if (validGames.length > 0) updateSignaturePreview(validGames[0].appid);
    document.getElementById('signatureModal').classList.add('open');
}

function updateSignaturePreview(appId) {
    const game = currentState.games.find(g => g.appid == appId); if (!game) return;
    document.getElementById('sigBg').style.backgroundImage = `url('${game.header_image}')`;
    document.getElementById('sigAvatar').src = currentState.user.avatarfull;
    document.getElementById('sigName').innerText = currentState.user.personaname;
    document.getElementById('sigGames').innerText = currentState.stats.gamesCounted;
    document.getElementById('sigPlat').innerText = currentState.stats.totalPlatinum;
    document.getElementById('sigAch').innerText = currentState.stats.totalAchievementsUnlocked.toLocaleString();
    document.getElementById('sigGameName').innerText = game.name;
    const unlocked = game.unlocked || 0; const total = game.total || 0; const percent = game.percent > -1 ? game.percent : 0;
    document.getElementById('sigGameProg').innerText = `${unlocked}/${total}`;
    document.getElementById('sigGamePct').innerText = `${percent}%`;
    document.getElementById('sigGameBar').style.width = `${percent}%`;
}

function downloadSignature() {
    const element = document.getElementById('signature-card-element');
    html2canvas(element, { useCORS: true, allowTaint: true, backgroundColor: null }).then(canvas => { const link = document.createElement('a'); link.download = `steam_card_${currentState.userId}.png`; link.href = canvas.toDataURL('image/png'); link.click(); });
}

// ===== MONTHLY GOAL SYSTEM =====
function openMonthlyGoalModal() {
    if (!currentState.userId) return showToast('Pesquise um perfil primeiro', 'warning');
    loadMonthlyGoals();
    document.getElementById('monthlyGoalModal').classList.add('open');
}

function loadMonthlyGoals() {
    const saved = localStorage.getItem('monthlyGoals');
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

    let goals = saved ? JSON.parse(saved) : { month: currentMonth, platinums: 0, achievements: 0, hours: 0, targets: { platinums: 5, achievements: 50, hours: 30 } };

    // Resetar se é um novo mês
    if (goals.month !== currentMonth) {
        goals = { month: currentMonth, platinums: 0, achievements: 0, hours: 0, targets: goals.targets };
    }

    // Atualizar valores dos inputs
    document.getElementById('goalPlatinumTarget').value = goals.targets.platinums;
    document.getElementById('goalAchievementTarget').value = goals.targets.achievements;
    document.getElementById('goalHoursTarget').value = goals.targets.hours;

    // Atualizar progresso visual (usando platinas como principal)
    const progress = Math.min(100, (currentState.stats.totalPlatinum / goals.targets.platinums) * 100);
    const circumference = 2 * Math.PI * 65;
    const offset = circumference - (progress / 100) * circumference;

    document.getElementById('goalProgressCircle').style.strokeDashoffset = offset;
    document.getElementById('goalCurrentValue').textContent = currentState.stats.totalPlatinum;
    document.getElementById('goalLabel').textContent = `de ${goals.targets.platinums} platinas`;
}

function saveMonthlyGoals() {
    const now = new Date();
    const goals = {
        month: `${now.getFullYear()}-${now.getMonth()}`,
        platinums: currentState.stats.totalPlatinum,
        achievements: currentState.stats.totalAchievementsUnlocked,
        hours: 0,
        targets: {
            platinums: parseInt(document.getElementById('goalPlatinumTarget').value) || 5,
            achievements: parseInt(document.getElementById('goalAchievementTarget').value) || 50,
            hours: parseInt(document.getElementById('goalHoursTarget').value) || 30
        }
    };
    localStorage.setItem('monthlyGoals', JSON.stringify(goals));
    showToast('Metas salvas com sucesso!', 'success');
    loadMonthlyGoals();
}

// ===== DISCORD INTEGRATION =====
function openDiscordModal() {
    if (!currentState.userId) return showToast('Pesquise um perfil primeiro', 'warning');

    // Carregar webhook salvo
    const savedWebhook = localStorage.getItem('discordWebhook');
    if (savedWebhook) {
        document.getElementById('discordWebhook').value = savedWebhook;
    }

    // Atualizar preview
    document.getElementById('discordPlayerName').textContent = currentState.user?.personaname || '-';
    document.getElementById('discordPlatinas').textContent = currentState.stats.totalPlatinum;
    document.getElementById('discordConquistas').textContent = currentState.stats.totalAchievementsUnlocked;

    document.getElementById('discordModal').classList.add('open');
}

async function sendToDiscord() {
    const webhookUrl = document.getElementById('discordWebhook').value.trim();
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks')) {
        return showToast('URL do webhook inválida', 'error');
    }

    // Salvar webhook para uso futuro
    localStorage.setItem('discordWebhook', webhookUrl);

    const shareType = document.querySelector('input[name="discordShareType"]:checked').value;

    let embed = {
        title: '🎮 Steam Achievements Explorer',
        color: 5793266, // Cor azul/roxo
        thumbnail: { url: currentState.user?.avatarfull },
        footer: { text: 'Steam Achievements Explorer • github.com/jabalxp/SAE' },
        timestamp: new Date().toISOString()
    };

    if (shareType === 'profile') {
        embed.description = `**${currentState.user?.personaname}** está caçando conquistas!`;
        embed.fields = [
            { name: '🏆 Platinas', value: currentState.stats.totalPlatinum.toString(), inline: true },
            { name: '⭐ Conquistas', value: currentState.stats.totalAchievementsUnlocked.toLocaleString(), inline: true },
            { name: '🎮 Jogos', value: currentState.games.length.toString(), inline: true }
        ];
    } else if (shareType === 'platinum') {
        const lastPlatinum = currentState.games.find(g => g.percent === 100);
        embed.description = lastPlatinum
            ? `**${currentState.user?.personaname}** zerou **${lastPlatinum.name}**! 🏆`
            : `**${currentState.user?.personaname}** ainda não tem platinas!`;
        if (lastPlatinum) {
            embed.image = { url: lastPlatinum.header_image };
        }
    } else {
        const avgPercent = currentState.stats.gamesCounted > 0
            ? Math.floor(currentState.stats.sumPercentages / currentState.stats.gamesCounted) : 0;
        embed.description = `📊 Estatísticas completas de **${currentState.user?.personaname}**`;
        embed.fields = [
            { name: '🏆 Total de Platinas', value: currentState.stats.totalPlatinum.toString(), inline: true },
            { name: '⭐ Conquistas Desbloqueadas', value: currentState.stats.totalAchievementsUnlocked.toLocaleString(), inline: true },
            { name: '📈 Média de Conclusão', value: `${avgPercent}%`, inline: true },
            { name: '🎮 Jogos na Biblioteca', value: currentState.games.length.toString(), inline: true },
            { name: '✅ Jogos Analisados', value: currentState.stats.gamesCounted.toString(), inline: true }
        ];
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });

        if (response.ok) {
            showToast('Enviado para o Discord com sucesso!', 'success');
            document.getElementById('discordModal').classList.remove('open');
        } else {
            throw new Error('Falha no envio');
        }
    } catch (e) {
        showToast('Erro ao enviar para o Discord. Verifique a URL do webhook.', 'error');
    }
}

function openChartsModal() { document.getElementById('chartsModal').classList.add('open'); renderCharts(); }
let chartsInstance = {};
function renderCharts() {
    const ctxPie = document.getElementById('gamesPieChart').getContext('2d'); const ctxBar = document.getElementById('playtimeBarChart').getContext('2d');
    if (chartsInstance.pie) chartsInstance.pie.destroy(); if (chartsInstance.bar) chartsInstance.bar.destroy();
    const platinums = currentState.stats.totalPlatinum; const started = currentState.stats.gamesCounted - platinums; const unplayed = currentState.games.length - currentState.stats.gamesCounted;
    chartsInstance.pie = new Chart(ctxPie, { type: 'doughnut', data: { labels: ['Platinados', 'Iniciados', 'Não Jogados'], datasets: [{ data: [platinums, started, unplayed], backgroundColor: ['#ffd700', '#00f3ff', '#333'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } } } });
    const topGames = currentState.games.slice(0, 10);
    chartsInstance.bar = new Chart(ctxBar, { type: 'bar', data: { labels: topGames.map(g => g.name.substring(0, 15) + '...'), datasets: [{ label: 'Horas', data: topGames.map(g => g.playtime_hours), backgroundColor: '#bc13fe' }] }, options: { responsive: true, plugins: { legend: { display: false }, tooltip: { mode: 'index' } }, scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } } });
}

function filterModal(type) { currentState.modalFilter = type; document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); const list = document.getElementById('achievementsList'); if (list.dataset.fullData) renderAchievementList(JSON.parse(list.dataset.fullData)); }
function closeGameModal() {
    document.getElementById('achievementModal').classList.remove('open');
    document.body.style.overflow = 'auto';
    document.getElementById('dynamic-bg').style.opacity = '0';
    // Parar música ao fechar modal
    stopModalSoundtrack();
}

// ===== SOUNDTRACK SYSTEM =====
let soundtrackAudio = null;
let isSoundtrackModeEnabled = false;
let currentPlayingAppId = null;
let isModalSoundtrackPlaying = false;

// URLs de trilhas sonoras diretas (arquivos de áudio gratuitos ou samples)
// Usando trilhas temáticas genéricas para jogos que não temos
const gameSoundtrackUrls = {
    // Para uma implementação real, usaríamos URLs de arquivos de áudio
    // Por agora, usamos o YouTube como fallback no modal
};

// IDs do YouTube para trilhas (usado no modal e hover)
const gameSoundtracksYT = {
    1245620: 'DgpYfCnLhAo', // Elden Ring - Main Theme
    1593500: 'y9hh91-2qaA', // God of War
    1091500: '294UYpnL3zY', // Cyberpunk 2077
    1174180: 'DKuFA8LhpMk', // Red Dead Redemption 2
    1145360: 'Yko-0MpTwPM', // Hades - Good Riddance
    367520: 'WZPAfSGlGbQ', // Hollow Knight - Greenpath
    292030: 'NknjE2SBPxw', // The Witcher 3
    814380: 'pKUaHfoMoFg', // Sekiro
    374320: 'stWae6r7Blw', // Dark Souls III
    504230: 'iDVM9KED46Q', // Celeste
    268910: 'HGH4yJ-BSXk', // Cuphead
    588650: 'k5IYgbAJlJQ', // Dead Cells
    570: 'HmZYgqBp1gI', // Dota 2
    730: 'mB6fq9Aadwk', // CS:GO
    271590: '8XLUuqC8wvA', // GTA V
    377160: 'qdFmSlLdjms', // Fallout 4
    582010: 'qlZNRrD2eB8', // Monster Hunter World
    1817070: 'WVnUR5WL2bc', // Hogwarts Legacy
    730: 'fM3pFBDXhDQ', // CS2/CSGO Menu Theme
    440: 'b8maq4Bb8xU', // Team Fortress 2
    578080: 'xYvX1VknChU', // PUBG
    1172470: 'UDxZ7bU4SAs', // Apex Legends
    252490: 'AoFoAuCl2Xo', // Rust
    1086940: 'TYxFYnhGjLA', // Baldur's Gate 3
    105600: 'gsNaR6FRuO0', // Terraria
    413150: 'WXfUPuVSeYo', // Stardew Valley
    1238810: '3sQlQn-gFRA', // Battlefield 2042
    1238060: 'X3CKNVJmUoI', // PowerWash Simulator
    1172380: '6hDIvBt_gmI', // Star Wars Jedi
    1222670: '_4Xpb2F3Rr4', // The Sims 4
    1517290: 'pOPVjsRRqaY', // Forza Horizon 5
};

// Criar elemento de áudio global
function initSoundtrackSystem() {
    if (!soundtrackAudio) {
        soundtrackAudio = document.createElement('audio');
        soundtrackAudio.id = 'globalSoundtrack';
        soundtrackAudio.volume = 0.3;
        soundtrackAudio.loop = true;
        document.body.appendChild(soundtrackAudio);
    }
}

// Toggle modo soundtrack (hover em game cards)
function toggleSoundtrackMode() {
    isSoundtrackModeEnabled = !isSoundtrackModeEnabled;
    const toggle = document.getElementById('soundtrackToggle');

    if (isSoundtrackModeEnabled) {
        toggle.classList.add('active');
        initSoundtrackSystem();
        attachSoundtrackListeners();
    } else {
        toggle.classList.remove('active', 'playing');
        removeSoundtrackListeners();
        stopHoverSoundtrack();
    }

    // Salvar preferência
    localStorage.setItem('soundtrackMode', isSoundtrackModeEnabled);
}

// Anexar listeners de hover nos game cards
function attachSoundtrackListeners() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mouseenter', onGameCardHover);
        card.addEventListener('mouseleave', onGameCardLeave);
    });
}

function removeSoundtrackListeners() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.removeEventListener('mouseenter', onGameCardHover);
        card.removeEventListener('mouseleave', onGameCardLeave);
    });
}

function onGameCardHover(e) {
    if (!isSoundtrackModeEnabled) return;

    const cardId = e.currentTarget.id;
    const appId = cardId.replace('game-', '');

    if (currentPlayingAppId === appId) return; // Já está tocando esse

    playHoverSoundtrack(appId);
}

function onGameCardLeave(e) {
    // Deixar tocando até outro card ser hoverado ou modo desativado
}

async function playHoverSoundtrack(appId) {
    const toggle = document.getElementById('soundtrackToggle');
    const game = currentState.games?.find(g => g.appid == appId);

    if (!game) return;

    currentPlayingAppId = appId;
    toggle.classList.add('playing');

    // Mostrar toast com nome do jogo
    showOSTToast(game.name);

    // Tocar áudio real via YouTube IFrame (oculto)
    playYouTubeAudio(game.name, appId);
}

// Sistema de YouTube Player oculto
let ytPlayer = null;
let ytPlayerReady = false;

function loadYouTubeAPI() {
    if (window.YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
    ytPlayerReady = true;
};

async function playYouTubeAudio(gameName, appId) {
    // Verificar se temos um ID de vídeo mapeado
    const youtubeId = gameSoundtracksYT[appId];

    if (youtubeId) {
        createOrUpdateYTPlayer(youtubeId);
    } else {
        // Buscar vídeo da OST automaticamente
        searchAndPlayYouTubeOST(gameName);
    }
}

function createOrUpdateYTPlayer(videoId) {
    // Criar container se não existir
    let container = document.getElementById('ytPlayerContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ytPlayerContainer';
        container.style.cssText = 'position: fixed; bottom: -1000px; left: -1000px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
        document.body.appendChild(container);

        const iframe = document.createElement('div');
        iframe.id = 'ytPlayer';
        container.appendChild(iframe);
    }

    if (window.YT && window.YT.Player) {
        if (ytPlayer && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(videoId);
            ytPlayer.setVolume(30);
        } else {
            ytPlayer = new YT.Player('ytPlayer', {
                height: '1',
                width: '1',
                videoId: videoId,
                playerVars: { autoplay: 1, controls: 0 },
                events: {
                    onReady: (e) => { e.target.setVolume(30); e.target.playVideo(); }
                }
            });
        }
    }
}

async function searchAndPlayYouTubeOST(gameName) {
    // Para evitar rate limits, usar áudio local ou placeholder
    console.log(`🎵 Searching OST for: ${gameName}`);
    // Em produção, você pode usar a YouTube Data API para buscar vídeos
}

function stopYouTubeAudio() {
    if (ytPlayer && ytPlayer.pauseVideo) {
        ytPlayer.pauseVideo();
    }
}

// Carregar API do YouTube ao iniciar
loadYouTubeAPI();

// Toast genérico para substituir alerts
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.sae-toast');
    if (existingToast) existingToast.remove();

    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const toast = document.createElement('div');
    toast.className = `sae-toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Toast de OST - fica acima do painel de cache
function showOSTToast(gameName) {
    // Remover toast existente
    const existingToast = document.querySelector('.ost-toast');
    if (existingToast) existingToast.remove();

    // Calcular posição: acima do scan-status-panel se visível
    const scanPanel = document.getElementById('scanStatusPanel');
    const bottomPos = scanPanel && scanPanel.classList.contains('active') ? '140px' : '100px';

    const toast = document.createElement('div');
    toast.className = 'ost-toast';
    toast.innerHTML = `<i class="fas fa-volume-up fa-beat"></i> <span>${gameName}</span>`;
    toast.style.cssText = `
                position: fixed; bottom: ${bottomPos}; right: 20px; z-index: 9999;
                background: rgba(0,0,0,0.95); border: 1px solid var(--primary-color);
                padding: 12px 20px; border-radius: 25px; color: var(--primary-color);
                font-family: var(--font-body); font-size: 14px; display: flex;
                align-items: center; gap: 10px; animation: slideInRight 0.3s ease;
                box-shadow: 0 0 20px rgba(0,243,255,0.3);
            `;
    document.body.appendChild(toast);

    // Remover após 3s
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function stopHoverSoundtrack() {
    const toggle = document.getElementById('soundtrackToggle');
    toggle.classList.remove('playing');
    currentPlayingAppId = null;

    // Parar YouTube player
    stopYouTubeAudio();

    // Parar áudio HTML5 se existir
    if (soundtrackAudio) {
        soundtrackAudio.pause();
        soundtrackAudio.currentTime = 0;
    }

    // Remover toast
    const toast = document.querySelector('.ost-toast');
    if (toast) toast.remove();
}

// Restaurar preferência de soundtrack
function restoreSoundtrackPreference() {
    const saved = localStorage.getItem('soundtrackMode');
    if (saved === 'true') {
        setTimeout(() => toggleSoundtrackMode(), 1000);
    }
}

// Modal soundtrack - toggle play/pause
function toggleSoundtrack() {
    const btn = document.getElementById('soundtrackBtn');
    const icon = document.getElementById('soundtrackIcon');

    if (isModalSoundtrackPlaying) {
        stopModalSoundtrack();
    } else {
        playModalSoundtrack();
    }
}

function playModalSoundtrack() {
    if (!currentState.currentModalGame) return;

    const appId = currentState.currentModalGame.appid;
    const gameName = currentState.currentModalGame.name;
    const youtubeId = gameSoundtracksYT[appId];

    const btn = document.getElementById('soundtrackBtn');
    const icon = document.getElementById('soundtrackIcon');

    btn.classList.add('playing');
    icon.className = 'fas fa-pause';
    isModalSoundtrackPlaying = true;

    // Mostrar toast
    showOSTToast(gameName);

    if (youtubeId) {
        // Tocar via YouTube IFrame
        createOrUpdateYTPlayer(youtubeId);
    } else {
        // Abrir busca do YouTube em nova aba como fallback
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' soundtrack OST')}`, '_blank');

        setTimeout(() => {
            btn.classList.remove('playing');
            icon.className = 'fas fa-music';
            isModalSoundtrackPlaying = false;
        }, 2000);
    }
}

function stopModalSoundtrack() {
    const btn = document.getElementById('soundtrackBtn');
    const icon = document.getElementById('soundtrackIcon');

    // Parar YouTube
    stopYouTubeAudio();

    if (btn) btn.classList.remove('playing');
    if (icon) icon.className = 'fas fa-music';
    isModalSoundtrackPlaying = false;

    // Remover toast
    const toast = document.querySelector('.ost-toast');
    if (toast) toast.remove();
}

// Inicializar sistema de soundtrack
document.addEventListener('DOMContentLoaded', () => {
    restoreSoundtrackPreference();
    initLanguage();
});
// ===== FIM SOUNDTRACK SYSTEM =====
function filterGames() { const term = document.getElementById('gameSearchInput').value.toLowerCase(); document.querySelectorAll('.game-card').forEach(card => { const pct = parseFloat(card.dataset.percent); let show = card.dataset.name.includes(term); if (currentState.activeFilter === 'platinado' && pct < 100) show = false; if (currentState.activeFilter === 'platinando' && (pct < 70 || pct === 100)) show = false; show ? card.classList.remove('hidden-card') : card.classList.add('hidden-card'); }); }
function setFilter(type) { currentState.activeFilter = type; document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === type)); filterGames(); }
function sortGames() { const type = document.getElementById('sortSelect').value; if (type === 'playtime') currentState.games.sort((a, b) => b.playtime_forever - a.playtime_forever); if (type === 'completion') currentState.games.sort((a, b) => b.percent - a.percent); if (type === 'name') currentState.games.sort((a, b) => a.name.localeCompare(b.name)); renderGamesGrid(); }
function filterFriends() { const term = document.getElementById('friendSearchInput').value.toLowerCase(); document.querySelectorAll('.friend-card').forEach(c => c.dataset.name.includes(term) ? c.classList.remove('hidden') : c.classList.add('hidden')); }
function toggleTheme() { const b = document.body; if (!b.className) b.className = 'theme-matrix'; else if (b.className === 'theme-matrix') b.className = 'theme-fire'; else b.className = ''; }

function changeTheme(theme) {
    // Limpar apenas classes de tema (não sazonais)
    document.body.classList.remove('theme-rgb', 'theme-retro', 'theme-light', 'theme-dark', 'theme-cyberpunk', 'theme-glassmorphism', 'theme-minimalista');

    // Aplicar novo tema
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }

    localStorage.setItem('selectedTheme', theme);

    // Re-aplicar sazonal se estiver ativo
    applySeasonalTheme();
}

function changeLanguage(lang) {
    if (typeof setLanguage === 'function') {
        setLanguage(lang);
    }
    localStorage.setItem('preferredLanguage', lang);
    document.getElementById('langSelector').value = lang;
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'pt';
    document.getElementById('langSelector').value = savedLang;
    if (typeof setLanguage === 'function') {
        setLanguage(savedLang);
    }
}

function toggleSeasonalTheme() {
    const isEnabled = localStorage.getItem('seasonalEnabled') === 'true';
    localStorage.setItem('seasonalEnabled', !isEnabled);
    applySeasonalTheme();
}

function applySeasonalTheme() {
    const isEnabled = localStorage.getItem('seasonalEnabled') === 'true';
    const btn = document.getElementById('seasonalToggleBtn');
    const icon = document.getElementById('seasonalIcon');

    // Remove efeitos sazonais
    document.body.classList.remove('theme-seasonal-christmas', 'theme-seasonal-halloween');
    btn.classList.remove('active', 'christmas', 'halloween');

    if (!isEnabled) {
        icon.className = 'fas fa-snowflake';
        return;
    }

    // Determinar qual tema sazonal aplicar baseado na data
    const month = new Date().getMonth(); // 0-11
    const day = new Date().getDate();

    // Outubro = Halloween, Dezembro = Natal, outras datas = Natal como padrão para teste
    if (month === 9 || (month === 10 && day <= 2)) { // Outubro até 2 Nov
        document.body.classList.add('theme-seasonal-halloween');
        btn.classList.add('active', 'halloween');
        icon.className = 'fas fa-ghost';
        console.log('🎃 Tema Halloween ativado!');
    } else if (month === 11 || month === 0) { // Dezembro e Janeiro
        document.body.classList.add('theme-seasonal-christmas');
        btn.classList.add('active', 'christmas');
        icon.className = 'fas fa-snowflake';
        console.log('🎄 Tema Natal ativado!');
    } else {
        // Fora de época - permite escolher qual quer testar
        document.body.classList.add('theme-seasonal-christmas');
        btn.classList.add('active', 'christmas');
        icon.className = 'fas fa-snowflake';
        console.log('❄️ Modo sazonal ativo (Natal fora de época)');
    }
}

function setDynamicBackground(appId) { const bg = document.getElementById('dynamic-bg'); bg.style.backgroundImage = `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/page_bg_generated_v6b.jpg')`; bg.style.opacity = '0.3'; }
function saveToHistory(id) {
    localStorage.setItem('lastSteamId', id);
    localStorage.setItem('steamId', id); // Também salvar como steamId para outras páginas
}
function loadFromHistory() {
    const last = localStorage.getItem('lastSteamId');
    if (last) document.getElementById('steamInput').value = last;
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    if (savedTheme !== 'default') document.body.classList.add(`theme-${savedTheme}`);
    document.getElementById('themeSelector').value = savedTheme;

    // Aplicar tema sazonal se estiver ativado
    applySeasonalTheme();
}

// ===== LAZY LOADING =====
let lazyLoadObserver = null;
function initLazyLoading() {
    // Se já tem um observer, desconectar
    if (lazyLoadObserver) lazyLoadObserver.disconnect();

    const options = {
        root: null, // viewport
        rootMargin: '100px', // carregar 100px antes de aparecer
        threshold: 0.01
    };

    lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    lazyLoadObserver.unobserve(img);
                }
            }
        });
    }, options);

    // Observar todas as imagens lazy
    document.querySelectorAll('img.lazy-img').forEach(img => {
        if (!img.src || img.src === '') {
            lazyLoadObserver.observe(img);
        }
    });

    console.log('📷 Lazy loading inicializado');
}

function triggerSearch(id) { document.getElementById('steamInput').value = id; handleSearch(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function refreshData() { if (currentState.userId) handleSearch(true); }
function openVersusModal() { document.getElementById('vsInput1').value = currentState.userId || ""; document.getElementById('versusModal').classList.add('open'); }
async function runVersus() {
    const id1 = currentState.userId; const input2 = document.getElementById('vsInput2').value;
    if (!id1 || !input2) return showToast('Carregue seu perfil primeiro e digite o ID do oponente', 'warning');
    document.getElementById('versusContent').innerHTML = '<div class="loader"></div>';
    try {
        let id2 = input2; if (isNaN(input2)) { const r = await fetchFromSteam('ISteamUser/ResolveVanityURL/v0001', { vanityurl: input2 }); id2 = r.response.steamid; }
        const [p1, p2, g1, g2] = await Promise.all([fetchFromSteam('ISteamUser/GetPlayerSummaries/v0002', { steamids: id1 }), fetchFromSteam('ISteamUser/GetPlayerSummaries/v0002', { steamids: id2 }), fetchFromSteam('IPlayerService/GetOwnedGames/v0001', { steamid: id1 }), fetchFromSteam('IPlayerService/GetOwnedGames/v0001', { steamid: id2 })]);
        const user1 = p1.response.players[0]; const user2 = p2.response.players[0];
        const games1 = g1.response.game_count || 0; const games2 = g2.response.game_count || 0;
        let time1 = 0; if (g1.response.games) g1.response.games.forEach(g => time1 += g.playtime_forever); time1 = (time1 / 60).toFixed(0);
        let time2 = 0; if (g2.response.games) g2.response.games.forEach(g => time2 += g.playtime_forever); time2 = (time2 / 60).toFixed(0);
        let score1 = games1 + parseInt(time1); let score2 = games2 + parseInt(time2);
        let totalScore = score1 + score2; let p1Width = totalScore > 0 ? (score1 / totalScore) * 100 : 50;
        document.getElementById('versusContent').innerHTML = `<div class="vs-player ${count1 > count2 ? 'winner-bg' : ''}"><img src="${user1.avatarfull}" class="vs-avatar ${count1 > count2 ? 'winner' : ''}"><h3>${user1.personaname}</h3><div class="vs-stat-row"><span class="vs-stat-label">Jogos</span><span class="vs-stat-val ${count1 > count2 ? 'win' : ''}">${count1}</span></div><div class="vs-stat-row"><span class="vs-stat-label">Horas</span><span class="vs-stat-val ${parseInt(time1) > parseInt(time2) ? 'win' : ''}">${time1}h</span></div></div><div class="vs-divider">VS</div><div class="vs-player ${count2 > count1 ? 'winner-bg' : ''}"><img src="${user2.avatarfull}" class="vs-avatar ${count2 > count1 ? 'winner' : ''}"><h3>${user2.personaname}</h3><div class="vs-stat-row"><span class="vs-stat-label">Jogos</span><span class="vs-stat-val ${count2 > count1 ? 'win' : ''}">${count2}</span></div><div class="vs-stat-row"><span class="vs-stat-label">Horas</span><span class="vs-stat-val ${parseInt(time2) > parseInt(time1) ? 'win' : ''}">${time2}h</span></div></div>`;
        document.getElementById('tugContainer').style.display = 'block';
        document.getElementById('tugBarP1').style.width = `${p1Width}%`;
    } catch (e) { showToast('Erro ao comparar: ' + e.message, 'error'); }
}

// ==================== SERVICE WORKER REGISTRATION ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/SAE/sw.js', { scope: '/SAE/' });
            console.log('✅ Service Worker registrado:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                            newWorker.postMessage('skipWaiting');
                            window.location.reload();
                        }
                    }
                });
            });
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    });
}

// ===== SHARE FUNCTIONS =====
function toggleShareMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('shareMenu');
    menu.classList.toggle('active');

    // Atualizar link do perfil público
    if (currentState.steamId) {
        document.getElementById('publicProfileLink').href = `profile.html?id=${currentState.steamId}`;
    }

    // Fechar ao clicar fora
    document.addEventListener('click', closeShareMenu);
}

function closeShareMenu(e) {
    const menu = document.getElementById('shareMenu');
    const btn = document.querySelector('.share-btn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
        document.removeEventListener('click', closeShareMenu);
    }
}

function shareTwitter() {
    const username = document.getElementById('userNameText').innerText;
    const platinas = document.getElementById('totalPlatinum').innerText;
    const conquistas = document.getElementById('totalAchievements').innerText;
    const url = `${window.location.origin}/profile.html?id=${currentState.steamId}`;
    const text = `🎮 Perfil Steam de ${username}\n🏆 ${platinas} Platinas | ⭐ ${conquistas} Conquistas\n\nConfira meu perfil no Steam Explorer!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    document.getElementById('shareMenu').classList.remove('active');
}

function shareDiscord() {
    copyProfileLink();
    showToast('Link copiado! Cole no Discord para compartilhar', 'success');
}

function copyProfileLink() {
    const url = `${window.location.origin}/profile.html?id=${currentState.steamId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copiado!', 'success');
        const copyItem = document.querySelector('.share-item.copy');
        if (copyItem) {
            const originalText = copyItem.innerHTML;
            copyItem.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            setTimeout(() => { copyItem.innerHTML = originalText; }, 2000);
        }
    }).catch(() => {
        // Fallback silencioso
    });
    document.getElementById('shareMenu').classList.remove('active');
}

// Install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show install button after profile loads
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'btn btn-secondary';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: none;';
    installBtn.onclick = async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA install:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    };
    document.body.appendChild(installBtn);
    // Show after 5 seconds
    setTimeout(() => { if (deferredPrompt) installBtn.style.display = 'block'; }, 5000);
});

// ===== LEADERBOARD SYSTEM (Fase 3) =====
async function openLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    const body = document.getElementById('leaderboardBody');
    body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Carregando ranking...</td></tr>';
    modal.classList.add('open');

    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard.php`);
        const result = await response.json();

        if (result.success && result.data) {
            body.innerHTML = '';
            result.data.forEach((user, index) => {
                const tr = document.createElement('tr');
                const isCurrent = user.steamid === currentState.userId ? 'style="background: rgba(139, 92, 246, 0.1);"' : '';
                tr.innerHTML = `
                    <td ${isCurrent}>${index + 1}</td>
                    <td ${isCurrent}>
                        <div class="rank-user-info">
                            <img src="${user.avatarfull}" class="rank-avatar" onerror="this.src='assets/images/placeholder.jpg'">
                            <span style="font-weight:bold; cursor:pointer;" onclick="viewPublicProfile('${user.steamid}')">${user.personaname}</span>
                        </div>
                    </td>
                    <td ${isCurrent} class="gold" style="font-weight:bold;">${user.platinums}</td>
                    <td ${isCurrent} class="purple">${parseInt(user.total_achievements).toLocaleString()}</td>
                `;
                body.appendChild(tr);
            });
        } else {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Ranking indisponível no momento.</td></tr>';
        }
    } catch (e) {
        console.error("Leaderboard Error:", e);
        body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Erro ao carregar ranking.</td></tr>';
    }
}

function viewPublicProfile(steamid) {
    window.location.href = `index.php?steamid=${steamid}`;
}

// ===== SITE BADGES SYSTEM (Fase 3) =====
async function loadUserBadges(steamid) {
    const container = document.getElementById('userSiteBadges');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/badges.php?steamid=${steamid}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            container.innerHTML = '';
            result.data.forEach(badge => {
                const badgeEl = document.createElement('div');
                badgeEl.className = 'site-badge-icon';
                badgeEl.title = `${badge.name}: ${badge.description}`;

                // Se a badge tiver um ícone definido (URL), usa imagem, senão usa ícone default de medalha
                if (badge.icon) {
                    badgeEl.innerHTML = `<img src="${badge.icon}" alt="${badge.name}">`;
                } else {
                    badgeEl.innerHTML = `<i class="fas fa-award"></i>`;
                }

                container.appendChild(badgeEl);
            });
        } else {
            container.innerHTML = ''; // Nenhuma badge ainda
        }
    } catch (e) {
        console.error("Badges Error:", e);
    }
}

// Chamar loadUserBadges no final do handleSearch e refreshData
// Adicionado nos hooks de renderização de perfil
