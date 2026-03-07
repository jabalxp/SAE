<?php 
// desafio.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <!-- Hero Section -->
    <div class="glass-card" style="padding: 4rem; text-align: center; margin-bottom: 3rem; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
        <div class="premium-font" id="challengeDate" style="color: var(--accent); font-size: 0.9rem; letter-spacing: 3px; margin-bottom: 1rem;">CARREGANDO DATA...</div>
        <h1 class="hero-title" style="font-size: 3.5rem; margin-bottom: 1rem;">Daily Nexus</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto; margin-bottom: 3rem;">Sincronize suas habilidades. Complete missões diárias para forjar sua lenda e acumular XP extra.</p>
        
        <div style="display: flex; justify-content: center; gap: 1.5rem;">
            <div class="glass-card" style="padding: 1.5rem 2.5rem; background: rgba(0,0,0,0.4);">
                <div class="premium-font" id="timerHours" style="font-size: 2.5rem; color: var(--primary);">23</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">HORAS</div>
            </div>
            <div class="glass-card" style="padding: 1.5rem 2.5rem; background: rgba(0,0,0,0.4);">
                <div class="premium-font" id="timerMinutes" style="font-size: 2.5rem; color: var(--primary);">59</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">MINUTOS</div>
            </div>
            <div class="glass-card" style="padding: 1.5rem 2.5rem; background: rgba(0,0,0,0.4);">
                <div class="premium-font" id="timerSeconds" style="font-size: 2.5rem; color: var(--primary);">59</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">SEGUNDOS</div>
            </div>
        </div>
    </div>

    <!-- Challenge Selection -->
    <div id="challengeTypes" class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 4rem;">
        <div class="glass-card challenge-card-hover" onclick="selectChallengeType('easy')" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: 0.4s;">
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🎮</div>
            <h3 class="premium-font" style="font-size: 1.2rem; margin-bottom: 1rem;">NÍVEL: INICIANTE</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Missões rápidas para aquecimento térmico do processador.</p>
            <div class="premium-font" style="color: var(--accent); font-size: 1rem;">+100 XP</div>
        </div>
        <div class="glass-card challenge-card-hover" onclick="selectChallengeType('medium')" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: 0.4s; border-color: var(--primary);">
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🏆</div>
            <h3 class="premium-font" style="font-size: 1.2rem; margin-bottom: 1rem;">NÍVEL: VETERANO</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Desafios balanceados que exigem foco e precisão técnica.</p>
            <div class="premium-font" style="color: var(--accent); font-size: 1rem;">+300 XP</div>
        </div>
        <div class="glass-card challenge-card-hover" onclick="selectChallengeType('hard')" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: 0.4s;">
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">💎</div>
            <h3 class="premium-font" style="font-size: 1.2rem; margin-bottom: 1rem;">NÍVEL: ELITE</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Para jogadores que buscam a perfeição absoluta e raridade.</p>
            <div class="premium-font" style="color: var(--accent); font-size: 1rem;">+500 XP</div>
        </div>
    </div>

    <!-- Current Challenge Details -->
    <div id="currentChallenge" class="glass-card" style="display: none; padding: 3rem; margin-bottom: 4rem; border: 2px solid var(--accent); box-shadow: 0 0 30px var(--accent-glow);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem;">
            <div>
                <h4 class="premium-font" style="color: var(--accent); letter-spacing: 2px; font-size: 0.8rem; margin-bottom: 0.5rem;">MISSÃO ATIVA</h4>
                <h2 id="challengeObjective" class="premium-font" style="font-size: 2rem;">CARREGANDO OBJETIVO...</h2>
            </div>
            <div id="challengeXP" class="glass-card" style="padding: 1rem 2rem; background: var(--accent); color: #000; font-weight: 800; border-radius: 40px;">+0 XP</div>
        </div>

        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 3rem; align-items: center;">
            <div style="position: relative;">
                <img id="challengeGameImg" src="" style="width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <div id="challengeGameName" class="premium-font" style="position: absolute; bottom: 1rem; left: 1rem; right: 1rem; background: rgba(0,0,0,0.8); padding: 0.5rem; font-size: 0.9rem; text-align: center; border-radius: 5px;">GAME NAME</div>
            </div>
            <div>
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">PROGRESSO DA MISSÃO</span>
                        <span id="progressText" class="premium-font" style="color: var(--accent);">0/0</span>
                    </div>
                    <div style="height: 12px; background: rgba(0,0,0,0.3); border-radius: 10px; overflow: hidden;">
                        <div id="progressBar" style="height: 100%; background: linear-gradient(90deg, var(--accent), var(--primary)); width: 0%; transition: 1s;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn-premium" onclick="checkProgress()" style="flex: 1; padding: 1.2rem;"><i class="fas fa-sync-alt"></i> SINCRONIZAR</button>
                    <button class="btn-premium" id="completeBtn" onclick="markCompleted()" style="flex: 1; padding: 1.2rem; background: var(--accent); color: #000;"><i class="fas fa-check"></i> VALIDAR</button>
                    <button class="btn-premium" onclick="regenerateChallenge()" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-redo"></i> RESET</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats & History -->
    <div class="grid" style="grid-template-columns: 1fr 2fr; gap: 3rem;">
        <div class="glass-card" style="padding: 2.5rem;">
            <h4 class="premium-font" style="margin-bottom: 2rem; color: var(--primary);">CONQUISTAS DO NEXUS</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div style="text-align: center;">
                    <div id="statStreak" class="premium-font" style="font-size: 1.8rem; color: var(--accent);">0</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">STREAK 🔥</div>
                </div>
                <div style="text-align: center;">
                    <div id="statCompleted" class="premium-font" style="font-size: 1.8rem;">0</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">TOTAL ✅</div>
                </div>
            </div>
            <div style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem;">
                 <label style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 1rem;">ESTATÍSTICAS TOTAIS</label>
                 <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                    <span style="font-size: 0.8rem;">XP Acumulado</span>
                    <span id="statXPEarned" style="color: var(--accent);">0</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 0.8rem;">Maior Streak</span>
                    <span id="statBestStreak" style="color: var(--primary);">0</span>
                 </div>
            </div>
        </div>
        
        <div class="glass-card" style="padding: 2.5rem;">
            <h4 class="premium-font" style="margin-bottom: 2rem; color: var(--primary);">LOG DE OPERAÇÕES</h4>
            <div id="historyList" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- History Items -->
            </div>
        </div>
    </div>
</div>

<style>
.challenge-card-hover:hover {
    transform: translateY(-10px);
    border-color: var(--accent);
    box-shadow: 0 20px 40px rgba(0, 243, 255, 0.1);
}
.history-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
    background: rgba(0,0,0,0.2);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
}
.history-item.success { border-left: 3px solid #00ff9d; }
.history-item.failed { border-left: 3px solid #ff0055; opacity: 0.7; }
</style>

<script>
let currentChallenge = null;
let challengeStats = { streak: 0, completed: 0, xpEarned: 0, bestStreak: 0, history: [] };
let userGames = [];

const challengeTypesConfigs = {
    easy: { name: 'Fácil', xp: 100, objectives: [{ text: 'Jogue {game} por 30 minutos', type: 'playtime' }, { text: 'Desbloqueie 1 conquista em {game}', type: 'achievements', count: 1 }] },
    medium: { name: 'Médio', xp: 300, objectives: [{ text: 'Desbloqueie 3 conquistas em {game}', type: 'achievements', count: 3 }, { text: 'Alcance 50% em {game}', type: 'progress' }] },
    hard: { name: 'Difícil', xp: 500, objectives: [{ text: 'Desbloqueie uma conquista rara em {game}', type: 'rare' }, { text: 'Complete 5 conquistas em {game}', type: 'achievements', count: 5 }] }
};

window.addEventListener('DOMContentLoaded', () => {
    loadUserGames();
    loadChallengeStats();
    updateDate();
    startTimer();
    checkTodayChallenge();
});

function loadUserGames() {
    const saved = localStorage.getItem('currentGames');
    if (saved) userGames = JSON.parse(saved);
}

function loadChallengeStats() {
    const saved = localStorage.getItem('challengeStats');
    if (saved) {
        challengeStats = JSON.parse(saved);
        updateStatsUI();
        renderHistory();
    }
}

function updateStatsUI() {
    document.getElementById('statStreak').textContent = challengeStats.streak;
    document.getElementById('statCompleted').textContent = challengeStats.completed;
    document.getElementById('statXPEarned').textContent = challengeStats.xpEarned.toLocaleString();
    document.getElementById('statBestStreak').textContent = challengeStats.bestStreak;
}

function updateDate() {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('challengeDate').textContent = new Date().toLocaleDateString('pt-BR', options).toUpperCase();
}

function startTimer() {
    const update = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        document.getElementById('timerHours').textContent = Math.floor(diff / 36e5).toString().padStart(2, '0');
        document.getElementById('timerMinutes').textContent = Math.floor((diff % 36e5) / 6e4).toString().padStart(2, '0');
        document.getElementById('timerSeconds').textContent = Math.floor((diff % 6e4) / 1e3).toString().padStart(2, '0');
    };
    update(); setInterval(update, 1000);
}

function checkTodayChallenge() {
    const saved = localStorage.getItem('todayChallenge');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.date === new Date().toDateString()) {
            currentChallenge = data;
            showCurrentChallenge();
        }
    }
}

function selectChallengeType(type) {
    if (!userGames.length) return alert('Carregue sua biblioteca primeiro!');
    const config = challengeTypesConfigs[type];
    const eligible = userGames.filter(g => g.percent < 100 && g.percent > 0);
    const game = (eligible.length ? eligible : userGames)[Math.floor(Math.random() * (eligible.length || userGames.length))];
    const objective = config.objectives[Math.floor(Math.random() * config.objectives.length)];
    
    currentChallenge = {
        date: new Date().toDateString(),
        type, game,
        objective: objective.text.replace('{game}', game.name),
        objectiveType: objective.type,
        objectiveCount: objective.count || 1,
        xp: config.xp,
        progress: 0,
        completed: false,
        initialUnlocked: game.unlocked,
        initialPercent: game.percent,
        initialPlaytime: game.playtime_forever || 0
    };
    localStorage.setItem('todayChallenge', JSON.stringify(currentChallenge));
    showCurrentChallenge();
}

function showCurrentChallenge() {
    document.getElementById('currentChallenge').style.display = 'block';
    document.getElementById('challengeGameName').textContent = currentChallenge.game.name;
    document.getElementById('challengeGameImg').src = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${currentChallenge.game.appid}/header.jpg`;
    document.getElementById('challengeObjective').textContent = currentChallenge.objective;
    document.getElementById('challengeXP').textContent = `+${currentChallenge.xp} XP`;
    updateProgressUI();
}

function updateProgressUI() {
    const percent = Math.min(100, (currentChallenge.progress / currentChallenge.objectiveCount) * 100);
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').textContent = `${currentChallenge.progress}/${currentChallenge.objectiveCount}`;
}

async function checkProgress() {
    // Logic for checking Steam API
    alert("Sincronizando dados com a Steam...");
    // Simulated check for now
    currentChallenge.progress = Math.min(currentChallenge.objectiveCount, currentChallenge.progress + 1);
    localStorage.setItem('todayChallenge', JSON.stringify(currentChallenge));
    updateProgressUI();
}

function markCompleted() {
    if(currentChallenge.progress < currentChallenge.objectiveCount) return alert("Missão incompleta!");
    currentChallenge.completed = true;
    challengeStats.completed++;
    challengeStats.xpEarned += currentChallenge.xp;
    challengeStats.streak++;
    challengeStats.history.unshift({
        date: new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}),
        game: currentChallenge.game.name,
        success: true
    });
    localStorage.setItem('challengeStats', JSON.stringify(challengeStats));
    localStorage.setItem('todayChallenge', JSON.stringify(currentChallenge));
    updateStatsUI();
    renderHistory();
    alert("PARABÉNS! Missão Cumprida.");
}

function renderHistory() {
    const container = document.getElementById('historyList');
    container.innerHTML = challengeStats.history.slice(0, 5).map(item => `
        <div class="history-item ${item.success ? 'success' : 'failed'}">
            <div style="font-size: 0.7rem; color: var(--text-muted); min-width: 60px;">${item.date}</div>
            <div style="flex: 1; font-size: 0.9rem;">${item.game}</div>
            <div class="premium-font" style="font-size: 0.7rem; color: ${item.success ? '#00ff9d' : '#ff0055'}">${item.success ? 'CONCLUÍDO' : 'FALHOU'}</div>
        </div>
    `).join('') || '<p style="text-align:center; color:var(--text-muted);">Nenhum log disponível.</p>';
}

function regenerateChallenge() {
    if(confirm('Gerar novo desafio? O progresso atual será perdido.')) selectChallengeType(currentChallenge.type);
}
</script>

<?php include 'api/footer.php'; ?>
