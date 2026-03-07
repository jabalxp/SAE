<?php 
// roleta.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Backlog Roulette</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Não sabe o que jogar? Deixe que o destino (e o nosso algoritmo) escolha o seu próximo desafio.</p>
    </div>

    <div class="glass-card" style="padding: 2.5rem; margin-bottom: 3rem; text-align: center;">
        <div class="filter-options" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
            <button class="btn-premium active" onclick="setMode('backlog', this)" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">BACKLOG (< 2H)</button>
            <button class="btn-premium" onclick="setMode('unplayed', this)" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">NUNCA JOGADOS (0H)</button>
            <button class="btn-premium" onclick="setMode('all', this)" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">QUALQUER UM</button>
        </div>

        <div id="slotMachine" class="glass-card" style="height: 400px; overflow: hidden; position: relative; border: 2px solid var(--accent); background: #000; box-shadow: 0 0 50px var(--accent-glow);">
            <div id="currentDisplay" style="width: 100%; height: 100%; background-size: cover; background-position: center; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 3rem; transition: opacity 0.1s;">
                 <div style="background: rgba(0,0,0,0.85); padding: 1.5rem 3rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                    <h2 id="resultTitle" class="premium-font" style="font-size: 2rem; color: #fff; margin: 0;"><i class="fas fa-dice" style="color: var(--accent);"></i> O QUE JOGAR?</h2>
                    <p id="resultMeta" style="color: var(--text-muted); margin-top: 0.5rem;">Gire para descobrir sua próxima jornada</p>
                 </div>
            </div>
            <!-- Glow Overlay -->
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); pointer-events: none;"></div>
        </div>

        <div style="margin-top: 3rem;">
            <button id="spinBtn" class="btn-premium" onclick="spin()" style="padding: 1.5rem 4rem; font-size: 1.5rem; letter-spacing: 5px;">
                <i class="fas fa-bolt"></i> GIRAR!
            </button>
        </div>

        <div style="margin-top: 1.5rem;">
            <a id="steamLink" href="#" target="_blank" class="premium-font" style="display: none; color: var(--primary); text-decoration: none; font-size: 0.9rem;">
                <i class="fab fa-steam"></i> ABRIR NA LOJA STEAM
            </a>
        </div>
    </div>
</div>

<script>
let allGames = [];
let filteredGames = [];
let currentMode = 'backlog';
let isSpinning = false;

window.addEventListener('DOMContentLoaded', async () => {
    const steamId = localStorage.getItem('lastSteamId');
    if(!steamId) return;

    const data = JSON.parse(localStorage.getItem(`steamGames_${steamId}`) || '[]');
    if(data.length > 0) {
        allGames = data;
        applyFilter();
        document.getElementById('resultMeta').innerText = `Pool detectado: ${filteredGames.length} jogos disponíveis no seu backlog.`;
    }
});

function setMode(mode, btn) {
    if(isSpinning) return;
    currentMode = mode;
    document.querySelectorAll('.filter-options .btn-premium').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter();
    document.getElementById('resultMeta').innerText = `Filtro aplicado: ${filteredGames.length} alvos identificados.`;
}

function applyFilter() {
    if(currentMode === 'backlog') filteredGames = allGames.filter(g => g.playtime_forever > 0 && g.playtime_forever < 120);
    else if(currentMode === 'unplayed') filteredGames = allGames.filter(g => g.playtime_forever === 0);
    else filteredGames = allGames;

    if(filteredGames.length === 0) filteredGames = allGames;
}

function spin() {
    if(isSpinning || filteredGames.length === 0) return;
    isSpinning = true;
    
    const display = document.getElementById('currentDisplay');
    const title = document.getElementById('resultTitle');
    const meta = document.getElementById('resultMeta');
    const btn = document.getElementById('spinBtn');
    const link = document.getElementById('steamLink');
    
    btn.disabled = true;
    btn.innerText = "GIRANDO...";
    link.style.display = 'none';

    let iterations = 0;
    const maxIterations = 25;
    let speed = 60;
    
    const loop = () => {
        const game = filteredGames[Math.floor(Math.random() * filteredGames.length)];
        display.style.backgroundImage = `url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg')`;
        title.innerText = game.name;
        meta.innerText = `${(game.playtime_forever/60).toFixed(1)}h jogadas no total.`;
        
        iterations++;
        if(iterations < maxIterations) {
            if(iterations > maxIterations - 8) speed += 40;
            setTimeout(loop, speed);
        } else {
            isSpinning = false;
            btn.disabled = false;
            btn.innerText = "GIRAR DE NOVO";
            link.href = `https://store.steampowered.com/app/${game.appid}`;
            link.style.display = 'inline-block';
        }
    };
    loop();
}
</script>

<style>
.active { border-color: var(--accent) !important; background: var(--accent-glow) !important; color: #fff !important; }
</style>

<?php include 'api/footer.php'; ?>
