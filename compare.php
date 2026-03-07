<?php 
// compare.php
include 'api/header.php'; 
?>

<div class="animate-in">
    <div style="text-align: center; padding: 3rem 0;">
        <h1 class="hero-title" style="font-size: 3.5rem;">Battle Arena</h1>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">Compare suas conquistas lado a lado com qualquer outro jogador Steam.</p>
    </div>

    <div class="glass-card" style="padding: 3rem; margin-bottom: 3rem;">
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; align-items: center;">
            <div class="premium-input-group">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; color: var(--primary);">PLAYER 1</label>
                <input type="text" id="player1" class="premium-input" placeholder="Steam ID ou URL..." style="width: 100%;">
            </div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 20px var(--accent-glow);">VS</div>
            <div class="premium-input-group">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; color: var(--secondary);">PLAYER 2</label>
                <input type="text" id="player2" class="premium-input" placeholder="Steam ID ou URL..." style="width: 100%;">
            </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn-premium" onclick="compareProfiles()" style="padding: 1rem 3rem; font-size: 1.1rem;">
                <i class="fas fa-bolt"></i> INICIAR CONFRONTO
            </button>
        </div>
    </div>

    <div id="loader" class="hidden" style="text-align: center; padding: 2rem;">
        <i class="fas fa-circle-notch fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted);">Analisando perfis...</p>
    </div>

    <div id="comparisonArea" class="hidden">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <!-- Player 1 Card -->
            <div id="profile1Card" class="glass-card" style="padding: 2.5rem; text-align: center; position: relative; overflow: hidden;">
                <div id="crown1" style="display:none; position: absolute; top: 1rem; right: 1rem; font-size: 2rem; color: gold;"><i class="fas fa-crown"></i></div>
                <img id="avatar1" src="" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--primary); margin-bottom: 1.5rem;">
                <h2 id="name1" style="font-size: 1.8rem; margin-bottom: 2rem;">-</h2>
                
                <div style="display: grid; gap: 1rem; text-align: left;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Jogos</span>
                        <span id="games1" class="premium-font">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Horas</span>
                        <span id="hours1" class="premium-font">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Platinas</span>
                        <span id="platinums1" class="premium-font" style="color: gold;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Média %</span>
                        <span id="completion1" class="premium-font" style="color: var(--accent);">0%</span>
                    </div>
                </div>
            </div>

            <!-- Player 2 Card -->
            <div id="profile2Card" class="glass-card" style="padding: 2.5rem; text-align: center; position: relative; overflow: hidden;">
                <div id="crown2" style="display:none; position: absolute; top: 1rem; right: 1rem; font-size: 2rem; color: gold;"><i class="fas fa-crown"></i></div>
                <img id="avatar2" src="" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--secondary); margin-bottom: 1.5rem;">
                <h2 id="name2" style="font-size: 1.8rem; margin-bottom: 2rem;">-</h2>
                
                <div style="display: grid; gap: 1rem; text-align: left;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Jogos</span>
                        <span id="games2" class="premium-font">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Horas</span>
                        <span id="hours2" class="premium-font">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Platinas</span>
                        <span id="platinums2" class="premium-font" style="color: gold;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                        <span style="color: var(--text-muted);">Média %</span>
                        <span id="completion2" class="premium-font" style="color: var(--accent);">0%</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-card" style="margin-top: 3rem; padding: 2rem;">
            <h3 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-chart-pie" style="color: var(--primary);"></i> Análise Radar</h3>
            <div style="height: 400px; display: flex; align-items: center; justify-content: center;">
                <canvas id="radarChart"></canvas>
            </div>
        </div>

        <div class="glass-card" style="margin-top: 2rem; padding: 2rem;">
            <h3 class="premium-font" style="margin-bottom: 1.5rem;"><i class="fas fa-handshake" style="color: var(--secondary);"></i> Jogos em Comum</h3>
            <div id="commonGamesList" style="display: grid; gap: 1rem;">
                <!-- Lista de jogos em comum -->
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Logic Injected from original compare.html
<?php 
$original_compare = file_get_contents('compare.php');
if (preg_match('/<script>(.*?)<\/script>/s', $original_compare, $matches)) {
    echo $matches[1];
}
?>
</script>

<?php include 'api/footer.php'; ?>
