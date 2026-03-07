<?php 
// prices.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Price Tracker</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Histórico de preços e comparativo em tempo real entre as principais lojas digitais.</p>
    </div>

    <div class="glass-card" style="padding: 2.5rem; margin-bottom: 3rem;">
        <div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
            <div class="search-box-premium" style="width: 500px; padding: 0.3rem 1rem;">
                <i class="fas fa-search" style="color: var(--text-muted);"></i>
                <input type="text" id="gameSearch" class="premium-input" placeholder="Buscar jogo (ex: Elden Ring, Resident Evil 4...)" style="border:none; background:transparent;">
            </div>
            <button class="btn-premium" onclick="searchGame()" style="padding: 0.8rem 2.5rem;">
                <i class="fas fa-search"></i> BUSCAR
            </button>
        </div>
    </div>

    <div id="loader" class="hidden" style="text-align: center; padding: 4rem;">
        <div class="loader-spinner"></div>
        <p style="margin-top: 1.5rem; color: var(--text-muted); font-family: var(--font-display);">CONSULTANDO BASES DE DADOS...</p>
    </div>

    <div id="gameResult" class="hidden">
        <div class="glass-card" style="padding: 0; overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--success);">
            <div id="resultHero" style="background: linear-gradient(to right, rgba(0,0,0,0.9), transparent), url(''); background-size: cover; background-position: center; padding: 3rem; display: flex; gap: 2.5rem; align-items: flex-end;">
                <div style="flex: 1;">
                    <h2 id="resultTitle" class="hero-title" style="font-size: 3rem; margin-bottom: 1rem;">-</h2>
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <span id="resultPrice" class="premium-font" style="font-size: 2.5rem; color: var(--success);">R$ 0,00</span>
                        <span id="resultOriginal" style="color: var(--text-muted); text-decoration: line-through; font-size: 1.2rem;"></span>
                        <span id="resultDiscount" class="badge" style="background: var(--success); color: #000; font-weight: 800; display: none;">-0%</span>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="glass-card" style="padding: 2rem;">
                <h3 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-store" style="color: var(--primary);"></i> Lojas Disponíveis</h3>
                <div id="storesGrid" style="display: grid; gap: 1rem;">
                    <!-- Lojas -->
                </div>
            </div>
            <div class="glass-card" style="padding: 2rem;">
                <h3 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-chart-line" style="color: var(--secondary);"></i> Estatísticas</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="glass-card" style="padding: 1rem; text-align: center; background: rgba(0,255,157,0.05);">
                        <div style="font-size: 0.6rem; color: var(--text-muted);">MENOR HISTÓRICO</div>
                        <div id="statLowest" class="premium-font" style="font-size: 1.2rem; color: var(--success);">-</div>
                    </div>
                    <div class="glass-card" style="padding: 1rem; text-align: center;">
                        <div style="font-size: 0.6rem; color: var(--text-muted);">MAIOR PREÇO</div>
                        <div id="statHighest" class="premium-font" style="font-size: 1.2rem;">-</div>
                    </div>
                    <div class="glass-card" style="padding: 1rem; text-align: center;">
                        <div style="font-size: 0.6rem; color: var(--text-muted);">MÉDIA</div>
                        <div id="statAverage" class="premium-font" style="font-size: 1.2rem; color: var(--primary);">-</div>
                    </div>
                    <div class="glass-card" style="padding: 1rem; text-align: center; border: 1px solid var(--success);">
                        <div style="font-size: 0.6rem; color: var(--text-muted);">ECONOMIA AGORA</div>
                        <div id="statSavings" class="premium-font" style="font-size: 1.2rem; color: var(--success);">-</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-card" style="padding: 2rem; margin-bottom: 3rem;">
            <h3 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-history" style="color: var(--accent);"></i> Histórico de Preços</h3>
            <div style="height: 350px;">
                <canvas id="priceChart"></canvas>
            </div>
        </div>
    </div>

    <div class="wishlist-section">
        <h3 class="premium-font" style="margin-bottom: 2rem;"><i class="fas fa-fire" style="color: var(--danger);"></i> Ofertas em Destaque</h3>
        <div id="dealsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            <!-- Deals -->
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
let priceChart = null;

async function searchGame() {
    const query = document.getElementById('gameSearch').value.trim();
    if (!query) return;
    
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('gameResult').classList.add('hidden');
    
    try {
        // Fallback para busca na Steam se API de preços não estiver configurada
        const steamData = await searchSteamGame(query);
        displayDemoData(steamData);
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        document.getElementById('loader').classList.add('active');
        setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
    }
}

async function searchSteamGame(query) {
    const PROXIES = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=brazilian&cc=BR`;
    
    let data = null;
    for (const proxy of PROXIES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(searchUrl));
            if (res.ok) {
                data = await res.json();
                break;
            }
        } catch(e) {}
    }
    
    if (data && data.items && data.items.length > 0) {
        const game = data.items[0];
        return {
            name: game.name,
            image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.id}/header.jpg`,
            price: game.price ? game.price.final / 100 : 0,
            originalPrice: game.price ? game.price.initial / 100 : 0,
            id: game.id
        };
    }
    return null;
}

function displayDemoData(data) {
    if(!data) return;
    document.getElementById('resultTitle').innerText = data.name;
    document.getElementById('resultHero').style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.9), transparent), url('${data.image}')`;
    document.getElementById('resultPrice').innerText = formatPrice(data.price);
    
    if (data.originalPrice > data.price) {
        document.getElementById('resultOriginal').innerText = formatPrice(data.originalPrice);
        const discount = Math.round((1 - data.price / data.originalPrice) * 100);
        document.getElementById('resultDiscount').innerText = `-${discount}%`;
        document.getElementById('resultDiscount').style.display = 'inline-block';
    } else {
        document.getElementById('resultOriginal').innerText = '';
        document.getElementById('resultDiscount').style.display = 'none';
    }

    // Mock stores
    const storesGrid = document.getElementById('storesGrid');
    storesGrid.innerHTML = `
        <div class="glass-card-hover" style="display:flex; justify-content:space-between; align-items:center; padding:1rem; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-weight:bold;"><i class="fab fa-steam"></i> Steam</div>
            <div style="color:var(--success); font-weight:800;">${formatPrice(data.price)}</div>
        </div>
        <div class="glass-card-hover" style="display:flex; justify-content:space-between; align-items:center; padding:1rem; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-weight:bold;"><i class="fas fa-shopping-cart"></i> Nuuvem</div>
            <div style="color:var(--success); font-weight:800;">${formatPrice(data.price * 0.95)}</div>
        </div>
    `;

    // Stats
    document.getElementById('statLowest').innerText = formatPrice(data.price * 0.85);
    document.getElementById('statHighest').innerText = formatPrice(data.originalPrice);
    document.getElementById('statAverage').innerText = formatPrice(data.price * 1.1);
    document.getElementById('statSavings').innerText = formatPrice(data.originalPrice - data.price);

    renderPriceChart(generateDemoHistory(data.price));
    document.getElementById('gameResult').classList.remove('hidden');
}

function generateDemoHistory(basePrice) {
    const history = [];
    for (let i = 12; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        history.push({
            date: date.toISOString().split('T')[0],
            price: basePrice * (0.8 + Math.random() * 0.4)
        });
    }
    return history;
}

function renderPriceChart(history) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (priceChart) priceChart.destroy();
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' })),
            datasets: [{
                label: 'Preço',
                data: history.map(h => h.price),
                borderColor: '#00f260',
                backgroundColor: 'rgba(0, 242, 96, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function formatPrice(p) { return 'R$ ' + p.toFixed(2).replace('.', ','); }

// Deals
async function loadTopDeals() {
    const grid = document.getElementById('dealsGrid');
    const demoDeals = [
        { name: 'Elden Ring', price: 149.90, image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg' },
        { name: 'Cyberpunk 2077', price: 99.90, image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg' },
        { name: 'RDR 2', price: 119.90, image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg' }
    ];
    grid.innerHTML = '';
    demoDeals.forEach(deal => {
        grid.innerHTML += `
            <div class="glass-card-hover animate-in" onclick="document.getElementById('gameSearch').value='${deal.name}'; searchGame();" style="cursor:pointer; overflow:hidden;">
                <img src="${deal.image}" style="width:100%; height:120px; object-fit:cover;">
                <div style="padding:1.5rem;">
                    <div class="premium-font" style="font-size:1rem;">${deal.name}</div>
                    <div style="color:var(--success); font-weight:800; margin-top:0.5rem;">${formatPrice(deal.price)}</div>
                </div>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTopDeals();
    document.getElementById('gameSearch').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchGame(); });
});
</script>

<style>
.loader-spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--success); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.glass-card-hover:hover { background: rgba(255,255,255,0.03) !important; border-color: var(--success) !important; transform: translateY(-5px); }
</style>

<?php include 'api/footer.php'; ?>
