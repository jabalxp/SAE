<?php 
// timeline.php
include 'api/header.php'; 
?>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">The Journey</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Uma retrospectiva visual da sua vida digital. Suas conquistas, marcos e o DNA do jogador que você se tornou.</p>
    </div>

    <!-- Persona Card -->
    <div id="personaSection" class="glass-card" style="display: none; padding: 3rem; margin-bottom: 3rem;">
        <div style="display: flex; align-items: center; gap: 3rem; flex-wrap: wrap;">
            <div style="position: relative;">
                <img id="pAvatar" src="" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid var(--accent); box-shadow: 0 0 30px var(--accent-glow);">
                <div id="pLevel" style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: #000; padding: 5px 15px; border-radius: 20px; font-weight: 800; font-size: 0.8rem;">LVL ??</div>
            </div>
            <div style="flex: 1; min-width: 300px;">
                <h4 class="premium-font" style="color: var(--primary); font-size: 0.9rem; letter-spacing: 2px;">ARQUÉTIPO DE JOGADOR</h4>
                <h2 id="pArchetype" class="premium-font" style="font-size: 2.5rem; margin-bottom: 1rem;">CALCULANDO...</h2>
                <p id="pDesc" style="color: var(--text-muted); line-height: 1.6; border-left: 2px solid var(--accent); padding-left: 1.5rem;">Sincronizando dados com a nuvem Steam para determinar sua personalidade gamer dominante...</p>
                <div style="display: flex; gap: 2rem; margin-top: 2rem;">
                    <div>
                        <div id="pYearStart" class="premium-font" style="font-size: 1.5rem; color: #fff;">----</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">ANO INICIAL</div>
                    </div>
                    <div>
                        <div id="pTotalHours" class="premium-font" style="font-size: 1.5rem; color: #fff;">0h</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">TOTAL JOGADO</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 3rem;">
        <div class="glass-card" style="padding: 2rem;">
            <h4 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-chart-line"></i> ATIVIDADE ANUAL</h4>
            <div style="height: 350px;">
                <canvas id="timelineChart"></canvas>
            </div>
        </div>
        <div class="glass-card" style="padding: 2rem;">
            <h4 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-bullseye"></i> DNA GAMER</h4>
            <div style="height: 350px;">
                <canvas id="genreRadar"></canvas>
            </div>
        </div>
    </div>

    <!-- Journey Timeline -->
    <section style="margin-top: 5rem;">
        <h2 class="premium-font" style="text-align: center; margin-bottom: 4rem; letter-spacing: 5px; color: var(--accent);">LINHA DO TEMPO</h2>
        <div id="journeyContainer" style="position: relative; max-width: 900px; margin: 0 auto;">
            <!-- Linha central vertical -->
            <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.05); transform: translateX(-50%);"></div>
            <!-- Eventos injetados por JS -->
        </div>
    </section>

    <!-- Badges -->
    <section style="margin-top: 5rem; padding-bottom: 5rem;">
        <h2 class="premium-font" style="text-align: center; margin-bottom: 3rem; letter-spacing: 5px;">BADGES DE CONQUISTA</h2>
        <div id="badgesContainer" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem;">
            <!-- Badges injetadas por JS -->
        </div>
    </section>
</div>

<script>
Chart.defaults.color = 'rgba(255,255,255,0.5)';
Chart.defaults.font.family = "'Rajdhani', sans-serif";

window.addEventListener('DOMContentLoaded', async () => {
    const steamId = localStorage.getItem('lastSteamId');
    const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}');
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const games = JSON.parse(localStorage.getItem('currentGames') || '[]');

    if(!profile.steamid) return window.location.href = 'index.php';

    document.getElementById('pAvatar').src = profile.avatarfull;
    document.getElementById('pLevel').innerText = `LVL ${stats.level || 1}`;
    document.getElementById('pTotalHours').innerText = `${Math.floor((stats.totalPlaytime || 0)/60)}h`;
    document.getElementById('personaSection').style.display = 'block';

    processTimelineData(games, stats);
});

function processTimelineData(games, stats) {
    // Mocking radar data for demo
    const ctxRadar = document.getElementById('genreRadar').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['RPG', 'FPS', 'Indie', 'Estratégia', 'Ação', 'Simulação'],
            datasets: [{
                label: 'Afinidade',
                data: [85, 60, 95, 40, 75, 50],
                backgroundColor: 'rgba(0, 243, 255, 0.2)',
                borderColor: '#00f3ff',
                pointBackgroundColor: '#fff'
            }]
        },
        options: { scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, ticks: { display: false } } } }
    });

    // Mocking activity data
    const ctxLine = document.getElementById('timelineChart').getContext('2d');
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Conquistas',
                data: [120, 250, 480, 320, 890, 450],
                borderColor: '#bc13fe',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(188, 19, 254, 0.1)'
            }]
        }
    });

    renderMockJourney();
    renderMockBadges();
}

function renderMockJourney() {
    const container = document.getElementById('journeyContainer');
    const events = [
        { date: 'OUT 2018', title: 'O DESPERTAR', desc: 'Sua conta Steam foi criada. A jornada começou.', icon: 'power-off', side: 'left' },
        { date: 'JUL 2020', title: 'PRIMEIRA PLATINA', desc: 'The Witcher 3: Wild Hunt. Você se tornou um mestre.', icon: 'trophy', side: 'right' },
        { date: 'MAR 2023', title: 'COLECIONADOR ELITE', desc: 'Marca de 100 jogos atingida.', icon: 'layer-group', side: 'left' }
    ];

    events.forEach(e => {
        const item = document.createElement('div');
        item.style.cssText = `display:flex; justify-content:${e.side === 'left' ? 'flex-end' : 'flex-start'}; width:100%; margin-bottom:3rem; position:relative;`;
        item.innerHTML = `
            <div class="glass-card" style="width:40%; padding:1.5rem; text-align:${e.side};">
                <div class="premium-font" style="color:var(--accent); font-size:0.7rem;">${e.date}</div>
                <h4 class="premium-font" style="margin:0.5rem 0;">${e.title}</h4>
                <p style="color:var(--text-muted); font-size:0.8rem;">${e.desc}</p>
            </div>
            <div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:40px; height:40px; background:var(--bg-dark); border:2px solid var(--accent); border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:2; box-shadow:0 0 10px var(--accent-glow);">
                <i class="fas fa-${e.icon}" style="color:var(--accent);"></i>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderMockBadges() {
    const container = document.getElementById('badgesContainer');
    const badges = [
        { name: 'VETERANO', desc: '5 anos de serviço', icon: 'shield-alt', color: '#00f3ff' },
        { name: 'PLATINADOR', desc: '10+ platinas', icon: 'crown', color: '#bc13fe' },
        { name: 'SEM VIDA', desc: '500h jogadas', icon: 'skull', color: '#ffbd2e' },
        { name: 'CAÇADOR', desc: '1000+ conquistas', icon: 'crosshairs', color: '#ff0055' }
    ];

    badges.forEach(b => {
        container.innerHTML += `
            <div class="glass-card" style="padding:1.5rem; text-align:center; transition:0.3s; cursor:pointer;" onmouseover="this.style.borderColor='${b.color}'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
                <div style="width:60px; height:60px; margin:0 auto 1rem; background:rgba(0,0,0,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid ${b.color}; box-shadow:0 0 15px ${b.color}44;">
                    <i class="fas fa-${b.icon}" style="color:${b.color}; font-size:1.5rem;"></i>
                </div>
                <h4 class="premium-font" style="font-size:0.8rem;">${b.name}</h4>
                <p style="color:var(--text-muted); font-size:0.7rem; margin-top:0.3rem;">${b.desc}</p>
            </div>
        `;
    });
}
</script>

<?php include 'api/footer.php'; ?>
