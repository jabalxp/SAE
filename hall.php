<?php 
// hall.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Platinum Gallery</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">A elite das conquistas. Veja todos os seus jogos platinados em um só lugar.</p>
    </div>

    <div class="glass-card" style="padding: 2.5rem; margin-bottom: 3rem;">
        <div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
            <div class="search-box-premium" style="width: 400px; padding: 0.3rem 1rem;">
                <i class="fas fa-search" style="color: var(--text-muted);"></i>
                <input type="text" id="hallInput" class="premium-input" placeholder="Steam ID ou Custom URL..." style="border:none; background:transparent;">
            </div>
            <button class="btn-premium" onclick="startSearch()" style="padding: 0.8rem 2.5rem;">
                <i class="fas fa-bolt"></i> SCANNER
            </button>
        </div>
        <div style="text-align: center; margin-top: 1.5rem;">
            <span class="premium-font" style="color: var(--accent); font-size: 1.2rem;">
                <i class="fas fa-trophy"></i> Total de Platinas: <span id="platCount">0</span>
            </span>
        </div>
    </div>

    <div id="loader" class="hidden" style="text-align: center; padding: 4rem;">
        <div class="loader-spinner"></div>
        <p id="scan-text" style="margin-top: 1.5rem; color: var(--text-muted); font-family: var(--font-display);">INICIALIZANDO VARREDURA DA BIBLIOTECA...</p>
    </div>

    <div id="hallGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 2rem;">
        <!-- Cards de platinas injetados via JS -->
    </div>
</div>

<script>
// Logic Injected and Adapted from original hall.php
const API_KEY = '8B07FE7C9405216BF61C1F439E93922B';
const PROXIES = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];
let gamesToScan = []; 
let activeWorkers = 0; 
const MAX_WORKERS = 12;
let platinums = 0;

async function fetchSteam(url) {
    for (const proxy of PROXIES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            if (res.ok) return await res.json();
        } catch (e) {}
    }
    return null;
}

async function startSearch() {
    const input = document.getElementById('hallInput').value;
    if(!input) return;
    
    document.getElementById('hallGrid').innerHTML = '';
    document.getElementById('platCount').innerText = '0';
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('scan-text').innerText = "CALIBRANDO SENSORES...";
    platinums = 0;

    let steamId = input;
    if(isNaN(input)) {
        const r = await fetchSteam(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${input}`);
        if(r && r.response.success === 1) steamId = r.response.steamid;
    }

    const data = await fetchSteam(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${steamId}&include_appinfo=1&format=json`);
    
    if(data && data.response && data.response.games) {
        gamesToScan = data.response.games.filter(g => g.playtime_forever > 60);
        document.getElementById('scan-text').innerText = `ANALISANDO ${gamesToScan.length} ALVOS IDENTIFICADOS...`;
        for(let i=0; i<MAX_WORKERS; i++) processQueue(steamId);
    } else {
        document.getElementById('scan-text').innerText = "SINAL PERDIDO: PERFIL PRIVADO.";
        setTimeout(() => document.getElementById('loader').classList.add('hidden'), 3000);
    }
}

async function processQueue(steamId) {
    if(gamesToScan.length === 0) {
        if(activeWorkers === 0) {
            document.getElementById('scan-text').innerText = "VARREDURA COMPLETA!";
            setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2000);
        }
        return;
    }

    activeWorkers++;
    const game = gamesToScan.shift();

    try {
        const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${API_KEY}&steamid=${steamId}&appid=${game.appid}`;
        const res = await fetchSteam(url);

        if(res && res.playerstats && res.playerstats.achievements) {
            const all = res.playerstats.achievements;
            const unlocked = all.filter(a => a.achieved === 1).length;
            if(all.length > 0 && unlocked === all.length) {
                addCard(game);
            }
        }
    } catch(e) {} finally {
        activeWorkers--;
        processQueue(steamId);
    }
}

function addCard(game) {
    platinums++;
    document.getElementById('platCount').innerText = platinums;
    const grid = document.getElementById('hallGrid');
    const card = document.createElement('div');
    card.className = 'glass-card-hover animate-in';
    card.style = 'position: relative; aspect-ratio: 2/3; border-radius: 12px; overflow: hidden; border: 1px solid var(--accent);';
    card.innerHTML = `
        <img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900_2x.jpg" 
             style="width: 100%; height: 100%; object-fit: cover;"
             onerror="this.src='https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg'">
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: 1.5rem; text-align: center;">
            <div style="font-size: 0.9rem; font-weight: bold; color: #fff; font-family: var(--font-display);">${game.name}</div>
            <div style="color: var(--accent); font-size: 0.7rem; margin-top: 0.5rem;"><i class="fas fa-certificate"></i> PLATINADO</div>
        </div>
    `;
    grid.appendChild(card);
}

window.addEventListener('DOMContentLoaded', () => {
    const last = localStorage.getItem('lastSteamId');
    if(last) {
        document.getElementById('hallInput').value = last;
        startSearch();
    }
});
</script>

<style>
.loader-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255,255,255,0.05);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
</style>

<?php include 'api/footer.php'; ?>
