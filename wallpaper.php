<?php 
// wallpaper.php
include 'api/header.php'; 
?>

<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Wallpaper Forge</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Crie artes exclusivas para seu desktop usando seus dados do Steam e a nossa estética Cyber-Premium.</p>
    </div>

    <div class="grid" style="grid-template-columns: 350px 1fr; gap: 2rem; align-items: start;">
        <!-- Sidebar Controls -->
        <aside class="glass-card" style="padding: 2rem; position: sticky; top: 6rem;">
            <h4 class="premium-font" style="margin-bottom: 1.5rem; color: var(--primary);"><i class="fas fa-palette"></i> CONFIGURAÇÃO</h4>
            
            <div style="margin-bottom: 2rem;">
                <label style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">TEMPLATE VISUAL</label>
                <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                    <button class="glass-card active" onclick="setTemplate('cyber')" style="aspect-ratio: 16/9; cursor: pointer; border-color: var(--accent); background: var(--accent-glow);"></button>
                    <button class="glass-card" onclick="setTemplate('fire')" style="aspect-ratio: 16/9; cursor: pointer; background: linear-gradient(135deg, #ff0055, #ffd700);"></button>
                    <button class="glass-card" onclick="setTemplate('matrix')" style="aspect-ratio: 16/9; cursor: pointer; background: linear-gradient(135deg, #00ff41, #008f11);"></button>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <label style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">RESOLUÇÃO</label>
                <select id="resSelect" class="btn-premium" style="width: 100%; padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #fff; font-family: 'Rajdhani';">
                    <option value="1920x1080">1080p (Desktop)</option>
                    <option value="2560x1440">1440p (2K)</option>
                    <option value="3840x2160">2160p (4K)</option>
                    <option value="1080x1920">Mobile (Portrait)</option>
                </select>
            </div>

            <div style="margin-bottom: 2rem;">
                 <label style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">ELEMENTOS VISÍVEIS</label>
                 <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem;">
                        <input type="checkbox" checked onchange="updatePreview()"> Mostrar Avatar
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem;">
                        <input type="checkbox" checked onchange="updatePreview()"> Mostrar Estatísticas
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem;">
                        <input type="checkbox" onchange="updatePreview()"> Arte do Jogo Favorito
                    </label>
                 </div>
            </div>

            <button class="btn-premium" onclick="generateAndSave()" style="width: 100%; padding: 1.2rem; font-size: 1rem;">
                <i class="fas fa-magic"></i> GERAR & BAIXAR
            </button>
        </aside>

        <!-- Preview Area -->
        <main class="glass-card" style="padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h4 class="premium-font"><i class="fas fa-eye"></i> PREVISÃO REAL-TIME</h4>
            </div>
            
            <div id="wallpaperPreview" style="width: 100%; aspect-ratio: 16/9; background: #050b14; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
                 <!-- Background Elements -->
                 <div id="wpBg" style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.1), #050b14);"></div>
                 
                 <!-- Content Layout -->
                 <div id="wpContent" style="position: relative; height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: #fff; text-align: center;">
                    <div style="margin-bottom: 1.5rem;">
                        <img id="wpAvatar" src="" style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--accent); box-shadow: 0 0 20px var(--accent-glow);">
                    </div>
                    <h2 id="wpName" class="premium-font" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent);">STEAM EXPLORER</h2>
                    <div style="display: flex; gap: 3rem;">
                        <div>
                            <div id="wpStatPlat" class="premium-font" style="font-size: 1.8rem;">24</div>
                            <div style="font-size: 0.6rem; color: var(--text-muted); letter-spacing: 2px;">PLATINAS</div>
                        </div>
                        <div>
                            <div id="wpStatAch" class="premium-font" style="font-size: 1.8rem;">1.4k</div>
                            <div style="font-size: 0.6rem; color: var(--text-muted); letter-spacing: 2px;">CONQUISTAS</div>
                        </div>
                    </div>
                    
                    <div style="position: absolute; bottom: 2rem; right: 3rem; opacity: 0.3;">
                        <h4 class="premium-font" style="font-size: 0.8rem; letter-spacing: 5px;">STEAM EXPLORER // GENERATED ART</h4>
                    </div>
                 </div>
            </div>
            
            <p style="margin-top: 2rem; color: var(--text-muted); font-size: 0.8rem; text-align: center;">
                <i class="fas fa-info-circle"></i> O wallpaper será exportado na resolução exata selecionada no painel lateral.
            </p>
        </main>
    </div>
</div>

<script>
window.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}');
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');

    if(profile.personaname) {
        document.getElementById('wpName').innerText = profile.personaname.toUpperCase();
        document.getElementById('wpAvatar').src = profile.avatarfull;
        document.getElementById('wpStatPlat').innerText = stats.totalPlatinum || 0;
        document.getElementById('wpStatAch').innerText = stats.totalAchievementsUnlocked || 0;
    }
});

function setTemplate(t) {
    const bg = document.getElementById('wpBg');
    const name = document.getElementById('wpName');
    const avatar = document.getElementById('wpAvatar');

    if(t === 'cyber') {
        bg.style.background = 'radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.15), #050b14)';
        name.style.color = 'var(--accent)';
        avatar.style.borderColor = 'var(--accent)';
    } else if(t === 'fire') {
        bg.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.15), #050b14)';
        name.style.color = '#ff0055';
        avatar.style.borderColor = '#ff0055';
    } else if(t === 'matrix') {
        bg.style.background = 'radial-gradient(circle at 50% 50%, rgba(0, 255, 65, 0.15), #000)';
        name.style.color = '#00ff41';
        avatar.style.borderColor = '#00ff41';
    }
}

function generateAndSave() {
    const btn = event.currentTarget;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> RENDERIZANDO...';

    const element = document.getElementById('wallpaperPreview');
    const [w, h] = document.getElementById('resSelect').value.split('x').map(Number);

    html2canvas(element, {
        width: 1920, // Simulando 1080p por padrão no render mas baixamos no scale
        height: 1080,
        scale: w / 1920, 
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `SAE-Wallpaper-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> GERAR & BAIXAR';
    });
}

function updatePreview() {
    // Implementar toggles de visibilidade se necessário
}
</script>

<?php include 'api/footer.php'; ?>
