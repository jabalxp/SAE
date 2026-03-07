<?php 
// level.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Level System</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Sua jornada épica no Steam Explorer. Ganhe XP analisando jogos e conquistando platinas.</p>
    </div>

    <!-- XP HERO -->
    <div class="glass-card" style="padding: 3rem; text-align: center; position: relative; overflow: hidden; margin-bottom: 3rem; border: 1px solid var(--primary);">
        <div style="position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%); opacity: 0.1;"></div>
        
        <div style="display: inline-flex; width: 150px; height: 150px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 0 50px var(--primary-glow);">
            <div style="width: 130px; height: 130px; background: var(--bg-dark); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span id="displayLvl" class="premium-font" style="font-size: 4rem; line-height: 1;">1</span>
                <span style="font-size: 0.8rem; letter-spacing: 2px; color: var(--text-muted);">LEVEL</span>
            </div>
        </div>

        <div style="max-width: 600px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: flex-end;">
                <span class="premium-font" style="color: var(--primary);">XP ATUAL: <span id="displayXp">0</span></span>
                <span id="nextLvlInfo" style="font-size: 0.8rem; color: var(--text-muted);">Próximo: 0 XP</span>
            </div>
            <div class="xp-bar-bg" style="height: 15px; background: rgba(255,255,255,0.05);">
                <div id="progBar" class="xp-bar-fill" style="width: 0%;"></div>
            </div>
            <div id="progPercent" class="premium-font" style="margin-top: 1rem; color: var(--accent); font-size: 1.5rem;">0%</div>
        </div>
    </div>

    <!-- XP BREAKDOWN -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 4rem;">
        <div class="glass-card" style="padding: 2rem; text-align: center; border-bottom: 4px solid var(--primary);">
            <i class="fas fa-medal" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h3 class="premium-font" id="statAch">0</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Conquistas Desbloqueadas</p>
        </div>
        <div class="glass-card" style="padding: 2rem; text-align: center; border-bottom: 4px solid var(--accent);">
            <i class="fas fa-trophy" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
            <h3 class="premium-font" id="statPlat">0</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Platinas (100%)</p>
        </div>
        <div class="glass-card" style="padding: 2rem; text-align: center; border-bottom: 4px solid var(--secondary);">
            <i class="fas fa-gamepad" style="font-size: 2.5rem; color: var(--secondary); margin-bottom: 1rem;"></i>
            <h3 class="premium-font" id="statGames">0</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Jogos Analisados</p>
        </div>
    </div>

    <!-- LEVELS LIST -->
    <h2 class="premium-font" style="margin-bottom: 2rem;"><i class="fas fa-star" style="color: var(--warning);"></i> Tabela de Progressão</h2>
    <div id="levelsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem;">
        <!-- Injetado via JS -->
    </div>
</div>

<script>
const LEVELS = [
    { level: 1, name: "Novato", xp: 0, icon: "seedling" },
    { level: 5, name: "Dedicado", xp: 2500, icon: "fire" },
    { level: 10, name: "Elite", xp: 10000, icon: "chess-king" },
    { level: 20, name: "Transcendente", xp: 40000, icon: "eye" }
];

function updateLevelUI() {
    const statsJson = localStorage.getItem('userStats');
    if (!statsJson) return;

    const stats = JSON.parse(statsJson);
    const xpFromAch = (stats.totalAchievementsUnlocked || 0) * 10;
    const xpFromPlat = (stats.totalPlatinum || 0) * 500;
    const xpFromGames = (stats.gamesCounted || 0) * 25;
    const totalXP = xpFromAch + xpFromPlat + xpFromGames;

    const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
    const xpForCurrent = 100 * (level * level);
    const xpForNext = 100 * ((level + 1) * (level + 1));
    const xpInLevel = totalXP - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    const percent = Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));

    document.getElementById('displayLvl').innerText = level;
    document.getElementById('displayXp').innerText = totalXP.toLocaleString();
    document.getElementById('progBar').style.width = percent + '%';
    document.getElementById('progPercent').innerText = percent + '%';
    document.getElementById('nextLvlInfo').innerText = `Próximo: ${xpForNext.toLocaleString()} XP`;

    document.getElementById('statAch').innerText = (stats.totalAchievementsUnlocked || 0).toLocaleString();
    document.getElementById('statPlat').innerText = stats.totalPlatinum || 0;
    document.getElementById('statGames').innerText = stats.gamesCounted || 0;

    renderLevels(level, totalXP);
}

function renderLevels(current, total) {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';
    
    for(let i=1; i<=20; i++) {
        const xpReq = 100 * (i * i);
        const unlocked = total >= xpReq;
        const active = i === current;
        
        const card = document.createElement('div');
        card.className = `glass-card-hover animate-in ${active ? 'active-level' : ''}`;
        card.style = `padding: 1.5rem; text-align: center; border: 1px solid ${unlocked ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; opacity: ${unlocked ? 1 : 0.4};`;
        
        card.innerHTML = `
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">LEVEL ${i}</div>
            <div class="premium-font" style="font-size: 1.2rem; color: ${unlocked ? 'var(--primary)' : '#fff'};">${xpReq.toLocaleString()} XP</div>
            ${active ? '<div style="font-size: 0.6rem; color: var(--accent); font-weight: 800; margin-top: 0.5rem;">VOCÊ ESTÁ AQUI</div>' : ''}
        `;
        grid.appendChild(card);
    }
}

window.addEventListener('DOMContentLoaded', updateLevelUI);
</script>

<style>
.active-level {
    background: rgba(0,243,255,0.05) !important;
    box-shadow: 0 0 30px var(--primary-glow) !important;
}
.glass-card-hover:hover {
    transform: scale(1.05);
}
</style>

<?php include 'api/footer.php'; ?>
