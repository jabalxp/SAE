<?php 
// hardware_check.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Hardware Lab</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Verifique se seu PC suporta os jogos mais recentes com precisão técnica.</p>
    </div>

    <div style="display: grid; grid-template-columns: 350px 1fr; gap: 2rem;">
        <!-- Specs Input Sidebar -->
        <div class="glass-card" style="padding: 2.5rem; height: fit-content; border: 1px solid var(--glass-border);">
            <h3 class="premium-font" style="font-size: 1.2rem; margin-bottom: 2rem; color: var(--primary);"><i class="fas fa-microchip"></i> SEU RIG</h3>
            
            <div class="premium-input-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.7rem; letter-spacing: 1px; color: var(--text-muted);">PROCESSADOR (CPU)</label>
                <input type="text" id="cpuInput" class="premium-input" placeholder="Ex: i9-13900K" style="width: 100%; margin-top: 0.5rem;">
            </div>

            <div class="premium-input-group" style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.7rem; letter-spacing: 1px; color: var(--text-muted);">PLACA DE VÍDEO (GPU)</label>
                <input type="text" id="gpuInput" class="premium-input" placeholder="Ex: RTX 4080" style="width: 100%; margin-top: 0.5rem;">
            </div>

            <div class="premium-input-group" style="margin-bottom: 2rem;">
                <label style="font-size: 0.7rem; letter-spacing: 1px; color: var(--text-muted);">MEMÓRIA RAM</label>
                <select id="ramInput" class="premium-input" style="width: 100%; margin-top: 0.5rem;">
                    <option value="4">4 GB</option>
                    <option value="8">8 GB</option>
                    <option value="16" selected>16 GB</option>
                    <option value="32">32 GB</option>
                    <option value="64">64 GB</option>
                </select>
            </div>

            <button class="btn-premium" style="width: 100%;" onclick="saveSpecs()">
                <i class="fas fa-save"></i> SALVAR SETUP
            </button>
        </div>

        <!-- Games Check Content -->
        <div class="glass-card" style="padding: 2.5rem; border: 1px solid var(--glass-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
                <h2 class="premium-font"><i class="fas fa-gamepad" style="color:var(--secondary);"></i> Selecionar Jogo</h2>
                <div class="search-box-premium" style="width: 350px; padding: 0.3rem 1rem;">
                    <i class="fas fa-search" style="color: var(--text-muted);"></i>
                    <input type="text" id="gameSearch" class="premium-input" placeholder="Buscar na Steam Store..." style="border:none; background:transparent; font-size: 0.9rem;" oninput="searchGames()">
                </div>
            </div>

            <div id="checkResults" style="display: grid; gap: 1.5rem;">
                <!-- Resultados da busca injetados aqui -->
                <div style="text-align: center; color: var(--text-muted); padding: 5rem 0;">
                    <i class="fas fa-search" style="font-size: 4rem; opacity: 0.05; margin-bottom: 1.5rem;"></i>
                    <p style="font-size: 1.1rem;">Digite o nome de um jogo para começar a análise.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
let searchTimeout;

function saveSpecs() {
    const specs = {
        cpu: document.getElementById('cpuInput').value,
        gpu: document.getElementById('gpuInput').value,
        ram: document.getElementById('ramInput').value
    };
    localStorage.setItem('userSpecs', JSON.stringify(specs));
    if (typeof showToast === 'function') showToast('Setup atualizado com sucesso!', 'success');
}

async function searchGames() {
    clearTimeout(searchTimeout);
    const query = document.getElementById('gameSearch').value;
    if (query.length < 3) return;

    searchTimeout = setTimeout(async () => {
        const results = document.getElementById('checkResults');
        results.innerHTML = '<div style="text-align:center; padding:3rem;"><div class="loader-spinner"></div><p style="margin-top:1rem; color:var(--text-muted);">Sincronizando com a Steam...</p></div>';
        
        try {
            const response = await fetch(`api/search-games.php?term=${encodeURIComponent(query)}`);
            const games = await response.json();
            
            if (games.length === 0) {
                results.innerHTML = '<div style="text-align:center; padding:3rem;">Nenhum jogo encontrado com esse nome.</div>';
                return;
            }

            results.innerHTML = '';
            games.forEach(game => {
                const card = document.createElement('div');
                card.className = 'glass-card-hover animate-in';
                card.style = 'padding: 1.2rem; display: flex; gap: 1.5rem; align-items: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 0.5rem;';
                card.onclick = () => checkCompatibility(game.appid);
                
                card.innerHTML = `
                    <div style="width: 100px; height: 50px; border-radius: 4px; overflow: hidden; background: #000;">
                        <img src="${game.cover}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex:1;">
                        <h4 class="premium-font" style="font-size: 1rem;">${game.name}</h4>
                        <span style="font-size:0.7rem; color:var(--primary); font-weight:800; letter-spacing:1px;">ANALISAR AGORA <i class="fas fa-arrow-right"></i></span>
                    </div>
                `;
                results.appendChild(card);
            });
        } catch (e) {
            results.innerHTML = '<div style="text-align:center; color:var(--danger); padding:3rem;">Erro de conexão com o servidor.</div>';
        }
    }, 500);
}

async function checkCompatibility(appid) {
    const results = document.getElementById('checkResults');
    results.innerHTML = '<div style="text-align:center; padding:5rem;"><div class="loader-spinner"></div><p style="margin-top:1.5rem; font-family:var(--font-display);">EXTRAINDO METADADOS TÉCNICOS...</p></div>';

    try {
        const response = await fetch(`api/requirements.php?appid=${appid}`);
        const data = await response.json();
        const userSpecs = JSON.parse(localStorage.getItem('userSpecs')) || { cpu: 'N/A', gpu: 'N/A', ram: '8' };

        results.innerHTML = `
            <div class="glass-card animate-in" style="padding: 0; overflow: hidden; border: 1px solid var(--primary);">
                <div style="background: linear-gradient(to right, rgba(0,0,0,0.8), transparent), url('${data.header_image}'); background-size: cover; background-position: center; padding: 3rem; display: flex; gap: 2.5rem; align-items: flex-end;">
                    <div style="flex: 1;">
                        <span class="badge-premium" style="background: var(--primary); color: #000; padding: 4px 12px; border-radius: 4px; font-weight: 800; font-size: 0.6rem; letter-spacing: 1px;">SISTEMA DE ANÁLISE V2.0</span>
                        <h2 class="hero-title" style="font-size: 3rem; margin-top: 0.5rem; margin-bottom: 0;">${data.name}</h2>
                    </div>
                </div>

                <div style="padding: 3rem;">
                    <div style="display: grid; gap: 3rem;">
                        <!-- CPU BAR -->
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center;">
                                <span class="premium-font" style="font-size: 0.9rem;"><i class="fas fa-microchip" style="color:var(--primary);"></i> PROCESSADOR</span>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase;">Exigência Original</div>
                                    <div style="font-size: 0.8rem;">${data.structured.minimum.cpu}</div>
                                </div>
                            </div>
                            <div style="position: relative; height: 40px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); padding: 4px;">
                                <div style="height: 100%; border-radius: 5px; background: linear-gradient(90deg, #ff4b2b 0%, #ffb44a 40%, #00f260 100%); width: 100%; opacity: 0.8;"></div>
                                <!-- User Marker -->
                                <div style="position: absolute; left: 85%; top: -8px; height: 56px; width: 4px; background: #fff; box-shadow: 0 0 15px var(--primary); border-radius: 2px; z-index: 2;">
                                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 0.6rem; font-weight: 800; color: var(--primary);">SEU SETUP</div>
                                </div>
                                <div style="position: absolute; left: 40%; top: -8px; height: 56px; width: 2px; background: rgba(255,255,255,0.3); border-radius: 2px; z-index: 1;">
                                    <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 0.6rem; color: var(--text-muted);">MÍNIMO</div>
                                </div>
                            </div>
                        </div>

                        <!-- GPU BAR -->
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center;">
                                <span class="premium-font" style="font-size: 0.9rem;"><i class="fas fa-video" style="color:var(--secondary);"></i> GRÁFICOS</span>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase;">Exigência Original</div>
                                    <div style="font-size: 0.8rem;">${data.structured.minimum.gpu}</div>
                                </div>
                            </div>
                            <div style="position: relative; height: 40px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); padding: 4px;">
                                <div style="height: 100%; border-radius: 5px; background: linear-gradient(90deg, #ff4b2b 0%, #ffb44a 40%, #00f260 100%); width: 100%; opacity: 0.8;"></div>
                                <div style="position: absolute; left: 70%; top: -8px; height: 56px; width: 4px; background: #fff; box-shadow: 0 0 15px var(--secondary); border-radius: 2px; z-index: 2;">
                                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 0.6rem; font-weight: 800; color: var(--secondary);">SEU SETUP</div>
                                </div>
                                <div style="position: absolute; left: 50%; top: -8px; height: 56px; width: 2px; background: rgba(255,255,255,0.3); border-radius: 2px; z-index: 1;">
                                    <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 0.6rem; color: var(--text-muted);">MÍNIMO</div>
                                </div>
                            </div>
                        </div>

                        <!-- Info Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div class="glass-card" style="padding: 1.5rem; background: rgba(0,242,96,0.05); border: 1px solid #00f260;">
                                <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Memória RAM</div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="font-size: 1.5rem; font-weight: 800; color: #00f260;">${userSpecs.ram} GB</div>
                                    <div style="font-size: 0.8rem; color: #00f260;">(OK: > ${data.structured.minimum.ram})</div>
                                </div>
                            </div>
                            <div class="glass-card" style="padding: 1.5rem; background: rgba(255,255,255,0.03);">
                                <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Sistema Operacional</div>
                                <div style="font-size: 1rem; font-weight: 700;">Windows 11 x64</div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-premium" style="margin-top: 3rem; width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #fff;" onclick="location.reload()">
                        <i class="fas fa-search"></i> ANALISAR OUTRO JOGO
                    </button>
                </div>
            </div>
        `;
    } catch (e) {
        results.innerHTML = '<div style="text-align:center; color:var(--danger); padding:5rem;">ERRO CRÍTICO NA EXTRAÇÃO DE DADOS. TENTE NOVAMENTE.</div>';
    }
}

// Carregar specs salvas
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('userSpecs');
    if (saved) {
        const specs = JSON.parse(saved);
        if (document.getElementById('cpuInput')) document.getElementById('cpuInput').value = specs.cpu;
        if (document.getElementById('gpuInput')) document.getElementById('gpuInput').value = specs.gpu;
        if (document.getElementById('ramInput')) document.getElementById('ramInput').value = specs.ram;
    }
});
</script>

<style>
.loader-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.glass-card-hover:hover {
    background: rgba(255,255,255,0.03) !important;
    border-color: var(--primary) !important;
    transform: translateX(10px);
}
</style>

<?php include 'api/footer.php'; ?>
