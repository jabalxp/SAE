<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SteamTrack | Lab de Hardware</title>
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Rajdhani:wght@300;400;600;700&family=Press+Start+2P&family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script src="languages.js"></script>
    
    <style>
        :root {
            --primary-color: #00f3ff;
            --secondary-color: #bc13fe;
            --bg-dark: #050b14;
            --bg-panel: rgba(16, 26, 46, 0.95);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text-main: #e0e6ed;
            --text-dim: #94a3b8;
            --success: #00ff9d;
            --warning: #ffbd2e;
            --danger: #ff0055;
            --font-display: 'Orbitron', sans-serif;
            --font-body: 'Rajdhani', sans-serif;
            /* Hardware page specific */
            --steam-blue: #66c0f4;
            --steam-green: #a4d007;
            --border-color: rgba(255,255,255,0.1);
            --accent-gradient: linear-gradient(90deg, #06BFFF 0%, #2D73FF 100%);
            --btn-hover: linear-gradient(90deg, #33c9ff 0%, #4da3ff 100%);
        }

        /* TEMAS */
        body.theme-matrix { --primary-color: #00ff41; --secondary-color: #008f11; --bg-dark: #000000; --bg-panel: rgba(0, 20, 0, 0.95); }
        body.theme-fire { --primary-color: #ffbd2e; --secondary-color: #ff0055; --bg-dark: #1a0505; --bg-panel: rgba(40, 10, 10, 0.95); }
        body.theme-retro { --primary-color: #fca311; --secondary-color: #14213d; --bg-dark: #101010; --bg-panel: #1a1a1a; --font-display: 'Press Start 2P', cursive; }
        body.theme-light { --primary-color: #007bff; --secondary-color: #6c757d; --bg-dark: #f8f9fa; --bg-panel: #ffffff; --text-main: #212529; --text-dim: #6c757d; }
        body.theme-dark { --primary-color: #e83e8c; --secondary-color: #6f42c1; --bg-dark: #000000; --bg-panel: rgba(20, 20, 20, 0.95); }
        @keyframes rgb-color-cycle { 0% { --primary-color: #ff00de; } 25% { --primary-color: #00ffde; } 50% { --primary-color: #de00ff; } 75% { --primary-color: #ffde00; } 100% { --primary-color: #ff00de; } }
        body.theme-rgb { animation: rgb-color-cycle 8s linear infinite; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: var(--font-body);
            background: linear-gradient(135deg, var(--bg-dark) 0%, #0a1628 50%, var(--bg-dark) 100%);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        /* --- HEADER (SAE PATTERN) --- */
        .main-header {
            background: var(--bg-panel);
            border-bottom: 1px solid rgba(0,243,255,0.2);
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .logo-area { display: flex; align-items: center; gap: 15px; text-decoration: none; }
        .logo-area:hover .site-title { color: var(--primary-color); }
        .logo-icon { font-size: 28px; color: var(--primary-color); filter: drop-shadow(0 0 10px var(--primary-color)); }
        .site-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }
        
        .main-nav { display: flex; gap: 10px; align-items: center; }
        .nav-btn { background: transparent; border: 1px solid transparent; color: var(--text-dim); padding: 8px 16px; border-radius: 20px; cursor: pointer; font-family: var(--font-display); text-decoration: none; font-size: 11px; transition: 0.3s; }
        .nav-btn:hover, .nav-btn.active { background: rgba(255,255,255,0.1); color: var(--primary-color); }
        .nav-btn.primary { background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: #000; font-weight: bold; padding: 8px 20px; border: none; }
        .nav-btn.primary:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(0,243,255,0.5); }
        
        .nav-menu-container { position: relative; }
        .nav-menu-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(0,243,255,0.3); color: var(--text-main); padding: 8px 15px; border-radius: 15px; cursor: pointer; font-family: var(--font-display); font-size: 11px; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
        .nav-menu-btn:hover { background: rgba(255,255,255,0.15); color: var(--primary-color); }
        .nav-menu-dropdown { position: absolute; top: 100%; right: 0; margin-top: 10px; background: rgba(16, 26, 46, 0.98); border: 1px solid rgba(0,243,255,0.2); border-radius: 12px; min-width: 200px; padding: 10px 0; box-shadow: 0 10px 40px rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s ease; z-index: 1000; }
        .nav-menu-container:hover .nav-menu-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
        .nav-menu-dropdown a { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: var(--text-main); text-decoration: none; font-size: 14px; transition: 0.2s; }
        .nav-menu-dropdown a:hover { background: rgba(0,243,255,0.1); color: var(--primary-color); }
        .nav-menu-dropdown a i { width: 20px; text-align: center; color: var(--primary-color); }
        
        .header-controls { display: flex; gap: 15px; align-items: center; }
        .theme-select { background: rgba(255,255,255,0.1); border: 1px solid rgba(0,243,255,0.3); color: var(--text-main); padding: 8px 12px; border-radius: 8px; cursor: pointer; font-family: var(--font-display); font-size: 11px; }
        .theme-select:focus { outline: none; border-color: var(--primary-color); }
        .seasonal-toggle { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-dim); }
        .seasonal-toggle input { cursor: pointer; }

        @media (max-width: 768px) {
            .main-header { flex-direction: column; padding: 15px; }
            .main-nav { flex-wrap: wrap; justify-content: center; gap: 8px; }
            .header-controls { flex-wrap: wrap; justify-content: center; }
        }

        /* --- LAYOUT PRINCIPAL --- */
        .main-content {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .page-header {
            margin-bottom: 40px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
            text-align: center; /* Centralizado para combinar com a navbar limpa */
        }

        .page-header h1 {
            color: white;
            font-weight: 300;
            font-size: 2.5rem;
            margin: 0;
        }

        .page-header h1 b { font-weight: 800; color: var(--steam-blue); text-shadow: 0 0 20px rgba(102, 192, 244, 0.3); }

        /* --- CARDS E INPUTS --- */
        .lab-card {
            background-color: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 4px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .search-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }

        @media(min-width: 768px) {
            .search-grid { grid-template-columns: 1fr 1fr; }
            .full-width { grid-column: span 2; }
        }

        .input-group label {
            display: block;
            color: var(--steam-blue);
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .input-wrapper {
            position: relative;
        }

        .steam-input {
            width: 100%;
            background-color: rgba(0, 0, 0, 0.2);
            border: 1px solid #000;
            color: white;
            padding: 12px 15px;
            border-radius: 2px;
            font-family: 'Inter', sans-serif;
            font-size: 15px;
            transition: all 0.2s;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
        }

        .steam-input:focus {
            background-color: #2a3f5a;
            border-color: var(--steam-blue);
            outline: none;
        }

        .steam-input::placeholder { color: rgba(199, 213, 224, 0.3); }

        .btn-action {
            width: 100%;
            padding: 18px;
            background: var(--accent-gradient);
            border: none;
            color: white;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 16px;
            border-radius: 2px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: 0.2s;
            letter-spacing: 1px;
        }

        .btn-action:hover {
            background: var(--btn-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4);
        }

        /* --- AUTOCOMPLETE --- */
        .autocomplete-results {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: #3d4450;
            border: 1px solid #101215;
            z-index: 50;
            max-height: 250px;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: none;
        }

        .ac-item {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid rgba(0,0,0,0.2);
            color: #c7d5e0;
            font-size: 14px;
        }

        .ac-item:hover {
            background-color: var(--steam-blue);
            color: white;
        }
        
        .ac-item small { display: block; font-size: 11px; opacity: 0.6; margin-top: 2px;}

        /* --- RESULTADOS --- */
        .result-panel {
            display: none; /* Inicialmente oculto */
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .game-hero {
            background: linear-gradient(to right, rgba(0,0,0,0.6), transparent), url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg?t=1695287664'); /* Fallback */
            background-size: cover;
            background-position: center;
            height: 150px;
            border-radius: 4px 4px 0 0;
            display: flex;
            align-items: flex-end;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            border-bottom: none;
            position: relative;
        }

        .game-hero-content {
            z-index: 2;
        }
        
        .game-hero h2 {
            margin: 0;
            font-size: 28px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            color: white;
        }

        .verdict-bar {
            padding: 20px;
            text-align: center;
            background: #101215;
            border-left: 1px solid rgba(255,255,255,0.1);
            border-right: 1px solid rgba(255,255,255,0.1);
        }

        .status-pill {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 3px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 1px;
        }
        
        .pill-green { background: rgba(164, 208, 7, 0.15); color: #a4d007; border: 1px solid #a4d007; }
        .pill-red { background: rgba(255, 76, 76, 0.15); color: #ff4c4c; border: 1px solid #ff4c4c; }

        .specs-comparison {
            display: grid;
            grid-template-columns: 1fr;
            background: #222b35;
            border: 1px solid rgba(255,255,255,0.1);
            border-top: none;
            border-radius: 0 0 4px 4px;
        }

        @media(min-width: 768px) {
            .specs-comparison { grid-template-columns: 1fr 1fr 1fr; }
        }

        .spec-col {
            padding: 25px;
            border-right: 1px solid rgba(255,255,255,0.05);
            text-align: center;
            position: relative;
        }
        
        .spec-col:last-child { border-right: none; }

        .spec-col i {
            font-size: 24px;
            color: var(--steam-blue);
            margin-bottom: 15px;
            opacity: 0.8;
        }

        .spec-title { font-size: 12px; text-transform: uppercase; color: var(--text-dim); font-weight: 700; margin-bottom: 5px; }
        .spec-user { font-size: 15px; font-weight: 600; color: white; margin-bottom: 10px; height: 40px; display: flex; align-items: center; justify-content: center; }
        
        .spec-status {
            font-size: 13px;
            font-weight: 700;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .upgrade-box {
            margin-top: 20px;
            background: linear-gradient(135deg, #2a475e 0%, #1b2838 100%);
            border: 1px solid var(--steam-blue);
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .upgrade-box h3 { margin: 0 0 10px 0; color: var(--steam-blue); font-size: 16px; display: flex; align-items: center; gap: 10px; }
        .upgrade-list { padding-left: 20px; margin: 0; color: #fff; }
        .upgrade-list li { margin-bottom: 5px; }

    </style>
</head>
<body>

    <!-- HEADER (SAE PATTERN) -->
    <header class="main-header">
        <a href="index.html" class="logo-area">
            <i class="fab fa-steam logo-icon"></i>
            <h1 class="site-title">SAE</h1>
        </a>
        <nav class="main-nav">
            <a href="hardware_check.html" class="nav-btn primary active"><i class="fas fa-microchip"></i> <span data-i18n-key="nav_hardware">HARDWARE LAB</span></a>
            <div class="nav-menu-container">
                <button class="nav-menu-btn"><i class="fas fa-bars"></i> <span data-i18n-key="menu">MENU</span> <i class="fas fa-chevron-down" style="font-size:8px;"></i></button>
                <div class="nav-menu-dropdown">
                    <a href="index.html"><i class="fas fa-gamepad"></i> <span data-i18n-key="nav_library">Biblioteca</span></a>
                    <a href="hall.html"><i class="fas fa-trophy"></i> <span data-i18n-key="hallOfFame">Hall da Fama</span></a>
                    <a href="roleta.html"><i class="fas fa-dice"></i> <span data-i18n-key="nav_roulette">Roleta</span></a>
                    <a href="level.html"><i class="fas fa-star"></i> <span data-i18n-key="nav_xp">Level / XP</span></a>
                    <a href="prices.html"><i class="fas fa-chart-line"></i> <span data-i18n-key="priceHistory">Histórico Preços</span></a>
                    <a href="compare.html"><i class="fas fa-users"></i> <span data-i18n-key="compareProfiles">Comparar Perfis</span></a>
                    <a href="museum.html"><i class="fas fa-landmark"></i> Museu 3D</a>
                    <a href="wallpaper.html"><i class="fas fa-image"></i> <span data-i18n-key="nav_wallpaper">Wallpapers</span></a>
                    <a href="desafio.html"><i class="fas fa-calendar-check"></i> <span data-i18n-key="dailyChallenge">Desafio Diário</span></a>
                    <a href="timeline.html"><i class="fas fa-clock-rotate-left"></i> <span data-i18n-key="nav_timeline">Timeline</span></a>
                    <a href="wrapped.html"><i class="fas fa-gift"></i> <span data-i18n-key="nav_wrapped">Wrapped</span></a>
                </div>
            </div>
        </nav>
        <div class="header-controls">
            <select id="themeSelector" onchange="changeTheme(this.value)" class="theme-select">
                <option value="default">Padrão</option>
                <option value="rgb">RGB</option>
                <option value="retro">Retrô</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
            </select>
            <select id="langSelector" onchange="setLanguage(this.value)" class="theme-select">
                <option value="pt">🇧🇷 PT</option>
                <option value="en">🇺🇸 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="ru">🇷🇺 RU</option>
                <option value="ja">🇯🇵 JA</option>
                <option value="zh">🇨🇳 ZH</option>
            </select>
            <div class="seasonal-toggle">
                <input type="checkbox" id="seasonalCheck" onchange="toggleSeasonal(this.checked)">
                <label for="seasonalCheck" data-i18n-key="seasonal">Sazonal</label>
            </div>
        </div>
    </header>

    <div class="main-content">
        
        <div class="page-header">
            <h1>Hardware <b>Lab</b></h1>
            <p style="color: var(--text-dim); margin-top: 5px;">Verifique compatibilidade antes de comprar.</p>
        </div>

        <!-- PAINEL DE BUSCA -->
        <div class="lab-card">
            <div class="search-grid">
                
                <!-- CPU -->
                <div class="input-group">
                    <label>Seu Processador (CPU)</label>
                    <div class="input-wrapper">
                        <input type="text" id="cpu-input" class="steam-input" placeholder="Ex: Ryzen 5 5600, i5-12400F..." autocomplete="off">
                        <i class="fas fa-microchip" style="position: absolute; right: 15px; top: 12px; color: #4b6a88;"></i>
                        <div id="cpu-list" class="autocomplete-results"></div>
                    </div>
                </div>

                <!-- GPU -->
                <div class="input-group">
                    <label>Sua Placa de Vídeo (GPU)</label>
                    <div class="input-wrapper">
                        <input type="text" id="gpu-input" class="steam-input" placeholder="Ex: RTX 3060, RX 6600..." autocomplete="off">
                        <i class="fas fa-gamepad" style="position: absolute; right: 15px; top: 12px; color: #4b6a88;"></i>
                        <div id="gpu-list" class="autocomplete-results"></div>
                    </div>
                </div>

                <!-- RAM -->
                <div class="input-group">
                    <label>Memória RAM</label>
                    <div class="input-wrapper">
                        <select id="ram-input" class="steam-input" style="cursor: pointer;">
                            <option value="4">4 GB (Básico)</option>
                            <option value="8">8 GB (Mínimo Aceitável)</option>
                            <option value="12">12 GB</option>
                            <option value="16" selected>16 GB (Padrão Gamer)</option>
                            <option value="24">24 GB</option>
                            <option value="32">32 GB (Recomendado)</option>
                            <option value="64">64 GB (Workstation)</option>
                        </select>
                        <i class="fas fa-memory" style="position: absolute; right: 15px; top: 12px; color: #4b6a88;"></i>
                    </div>
                </div>

                <!-- JOGO -->
                <div class="input-group">
                    <label style="color: var(--steam-green);">Jogo para Testar</label>
                    <div class="input-wrapper">
                        <input type="text" id="game-input" class="steam-input" placeholder="Ex: Resident Evil 4, Cyberpunk..." autocomplete="off" style="border-color: rgba(164, 208, 7, 0.3);">
                        <i class="fas fa-search" style="position: absolute; right: 15px; top: 12px; color: var(--steam-green);"></i>
                        <div id="game-list" class="autocomplete-results"></div>
                    </div>
                </div>

            </div>

            <div style="margin-top: 30px;">
                <button class="btn-action" onclick="analisarCompatibilidade()">Verificar Compatibilidade</button>
            </div>
        </div>

        <!-- RESULTADOS -->
        <div id="result-panel" class="result-panel">
            
            <div class="game-hero" id="game-hero-bg">
                <div class="game-hero-content">
                    <h2 id="res-game-title">Nome do Jogo</h2>
                </div>
            </div>

            <div class="verdict-bar">
                <span id="res-badge" class="status-pill pill-green">RODA PERFEITAMENTE</span>
                <p id="res-text" style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Seu sistema atende aos requisitos recomendados.</p>
            </div>

            <div class="specs-comparison">
                <!-- CPU -->
                <div class="spec-col">
                    <i class="fas fa-microchip"></i>
                    <div class="spec-title">Processador</div>
                    <div id="res-cpu-name" class="spec-user">--</div>
                    <div id="res-cpu-status" class="spec-status" style="color: #a4d007;">Aprovado</div>
                </div>
                <!-- GPU -->
                <div class="spec-col">
                    <i class="fas fa-gamepad"></i>
                    <div class="spec-title">Placa de Vídeo</div>
                    <div id="res-gpu-name" class="spec-user">--</div>
                    <div id="res-gpu-status" class="spec-status" style="color: #a4d007;">Aprovado</div>
                </div>
                <!-- RAM -->
                <div class="spec-col">
                    <i class="fas fa-memory"></i>
                    <div class="spec-title">Memória RAM</div>
                    <div id="res-ram-val" class="spec-user">--</div>
                    <div id="res-ram-status" class="spec-status" style="color: #a4d007;">Aprovado</div>
                </div>
            </div>

            <div id="upgrade-box" class="upgrade-box" style="display: none;">
                <h3><i class="fas fa-screwdriver-wrench"></i> Sugestão de Melhoria</h3>
                <ul id="upgrade-list" class="upgrade-list"></ul>
            </div>

        </div>

    </div>

<script>
    /* ======================================================
       BANCO DE DADOS EXPANDIDO (Scores PassMark/G3D Estimados)
       ====================================================== */
    
    // Lista de CPUs
    const dbCPUs = [
        // --- INTEL ---
        // Antigos/Legado
        { name: "Intel Core 2 Quad Q6600", score: 1800 },
        { name: "Intel Core i5-2500K", score: 4100 },
        { name: "Intel Core i7-2600K", score: 5500 },
        { name: "Intel Core i7-3770K", score: 6400 },
        { name: "Intel Core i7-4790K", score: 8000 },
        { name: "Intel Core i5-6500", score: 5600 },
        { name: "Intel Core i7-6700K", score: 8900 },
        // Mid-Range Antigo
        { name: "Intel Core i5-8400", score: 9200 },
        { name: "Intel Core i7-8700K", score: 13800 },
        { name: "Intel Core i3-9100F", score: 6800 },
        { name: "Intel Core i5-9400F", score: 9500 },
        { name: "Intel Core i7-9700K", score: 14500 },
        { name: "Intel Core i9-9900K", score: 18500 },
        // Modernos (10th - 11th)
        { name: "Intel Core i3-10100F", score: 8800 },
        { name: "Intel Core i5-10400F", score: 12500 },
        { name: "Intel Core i7-10700K", score: 19500 },
        { name: "Intel Core i5-11400F", score: 17000 },
        { name: "Intel Core i7-11700K", score: 24000 },
        // Recentes (12th - 14th)
        { name: "Intel Core i3-12100F", score: 14000 },
        { name: "Intel Core i5-12400F", score: 19500 },
        { name: "Intel Core i5-12600K", score: 27000 },
        { name: "Intel Core i7-12700K", score: 34000 },
        { name: "Intel Core i5-13400F", score: 26000 },
        { name: "Intel Core i5-13600K", score: 38000 },
        { name: "Intel Core i7-13700K", score: 46000 },
        { name: "Intel Core i9-13900K", score: 60000 },
        { name: "Intel Core i5-14600K", score: 39000 },
        { name: "Intel Core i9-14900K", score: 62000 },
        // Laptops
        { name: "Intel Core i5-11400H (Laptop)", score: 13000 },
        { name: "Intel Core i7-11800H (Laptop)", score: 21000 },
        { name: "Intel Core i7-12700H (Laptop)", score: 27000 },

        // --- AMD ---
        // FX / Antigos
        { name: "AMD FX-6300", score: 4200 },
        { name: "AMD FX-8350", score: 5900 },
        // Ryzen 1000/2000
        { name: "AMD Ryzen 3 1200", score: 6300 },
        { name: "AMD Ryzen 5 1600", score: 12000 },
        { name: "AMD Ryzen 7 1700", score: 14500 },
        { name: "AMD Ryzen 3 2200G", score: 6800 },
        { name: "AMD Ryzen 5 2600", score: 13000 },
        { name: "AMD Ryzen 7 2700X", score: 17000 },
        // Ryzen 3000/4000
        { name: "AMD Ryzen 3 3200G", score: 7200 },
        { name: "AMD Ryzen 5 3600", score: 17800 },
        { name: "AMD Ryzen 7 3700X", score: 22500 },
        { name: "AMD Ryzen 9 3900X", score: 32000 },
        { name: "AMD Ryzen 5 4500", score: 16000 },
        { name: "AMD Ryzen 5 4600G", score: 15500 },
        // Ryzen 5000
        { name: "AMD Ryzen 5 5500", score: 19500 },
        { name: "AMD Ryzen 5 5600", score: 21500 },
        { name: "AMD Ryzen 5 5600X", score: 22000 },
        { name: "AMD Ryzen 5 5600G", score: 20000 },
        { name: "AMD Ryzen 7 5700X", score: 26500 },
        { name: "AMD Ryzen 7 5800X", score: 28000 },
        { name: "AMD Ryzen 7 5800X3D", score: 28500 },
        { name: "AMD Ryzen 9 5900X", score: 39000 },
        { name: "AMD Ryzen 9 5950X", score: 46000 },
        // Ryzen 7000/8000
        { name: "AMD Ryzen 5 7600", score: 27000 },
        { name: "AMD Ryzen 7 7700X", score: 36000 },
        { name: "AMD Ryzen 7 7800X3D", score: 35000 },
        { name: "AMD Ryzen 9 7950X", score: 63000 },
        { name: "AMD Ryzen 5 8600G", score: 29000 },
    ];

    // Lista de GPUs
    const dbGPUs = [
        // --- NVIDIA ---
        // GTX 700/900 Series
        { name: "NVIDIA GeForce GTX 750 Ti", score: 3800 },
        { name: "NVIDIA GeForce GTX 960", score: 6000 },
        { name: "NVIDIA GeForce GTX 970", score: 9000 },
        { name: "NVIDIA GeForce GTX 980 Ti", score: 11500 },
        // GTX 10 Series
        { name: "NVIDIA GeForce GTX 1050 2GB", score: 5000 },
        { name: "NVIDIA GeForce GTX 1050 Ti", score: 6000 },
        { name: "NVIDIA GeForce GTX 1060 3GB", score: 9000 },
        { name: "NVIDIA GeForce GTX 1060 6GB", score: 10000 },
        { name: "NVIDIA GeForce GTX 1070", score: 13500 },
        { name: "NVIDIA GeForce GTX 1080", score: 15500 },
        { name: "NVIDIA GeForce GTX 1080 Ti", score: 18500 },
        // GTX 16 Series
        { name: "NVIDIA GeForce GTX 1650", score: 7800 },
        { name: "NVIDIA GeForce GTX 1650 Super", score: 9800 },
        { name: "NVIDIA GeForce GTX 1660", score: 11000 },
        { name: "NVIDIA GeForce GTX 1660 Super", score: 12500 },
        { name: "NVIDIA GeForce GTX 1660 Ti", score: 12800 },
        // RTX 20 Series
        { name: "NVIDIA GeForce RTX 2060", score: 14000 },
        { name: "NVIDIA GeForce RTX 2060 Super", score: 16000 },
        { name: "NVIDIA GeForce RTX 2070", score: 16500 },
        { name: "NVIDIA GeForce RTX 2070 Super", score: 18000 },
        { name: "NVIDIA GeForce RTX 2080 Ti", score: 21500 },
        // RTX 30 Series
        { name: "NVIDIA GeForce RTX 3050", score: 12800 },
        { name: "NVIDIA GeForce RTX 3060 12GB", score: 17000 },
        { name: "NVIDIA GeForce RTX 3060 Ti", score: 20000 },
        { name: "NVIDIA GeForce RTX 3070", score: 22000 },
        { name: "NVIDIA GeForce RTX 3070 Ti", score: 23500 },
        { name: "NVIDIA GeForce RTX 3080", score: 25000 },
        { name: "NVIDIA GeForce RTX 3090", score: 26500 },
        // RTX 40 Series
        { name: "NVIDIA GeForce RTX 4060", score: 19500 },
        { name: "NVIDIA GeForce RTX 4060 Ti", score: 22500 },
        { name: "NVIDIA GeForce RTX 4070", score: 27000 },
        { name: "NVIDIA GeForce RTX 4070 Ti Super", score: 32000 },
        { name: "NVIDIA GeForce RTX 4080", score: 35000 },
        { name: "NVIDIA GeForce RTX 4090", score: 39000 },

        // --- AMD ---
        // RX 400/500
        { name: "AMD Radeon RX 470", score: 7500 },
        { name: "AMD Radeon RX 550", score: 2800 },
        { name: "AMD Radeon RX 570", score: 8000 },
        { name: "AMD Radeon RX 580 8GB", score: 8700 },
        { name: "AMD Radeon RX 590", score: 9500 },
        // RX 5000
        { name: "AMD Radeon RX 5500 XT", score: 9000 },
        { name: "AMD Radeon RX 5600 XT", score: 13500 },
        { name: "AMD Radeon RX 5700 XT", score: 16500 },
        // RX 6000
        { name: "AMD Radeon RX 6500 XT", score: 9200 },
        { name: "AMD Radeon RX 6600", score: 14500 },
        { name: "AMD Radeon RX 6600 XT", score: 16000 },
        { name: "AMD Radeon RX 6700 XT", score: 21000 },
        { name: "AMD Radeon RX 6800 XT", score: 25000 },
        { name: "AMD Radeon RX 6900 XT", score: 28000 },
        // RX 7000
        { name: "AMD Radeon RX 7600", score: 16500 },
        { name: "AMD Radeon RX 7700 XT", score: 22000 },
        { name: "AMD Radeon RX 7800 XT", score: 26000 },
        { name: "AMD Radeon RX 7900 XTX", score: 31000 },

        // --- INTEL ARC ---
        { name: "Intel Arc A380", score: 6000 },
        { name: "Intel Arc A750", score: 16500 },
        { name: "Intel Arc A770 16GB", score: 18000 },

        // Integradas
        { name: "Intel UHD Graphics 630/730", score: 1200 },
        { name: "AMD Radeon Vega 7/8 (Integrada)", score: 2500 },
        { name: "AMD Radeon 780M (Integrada)", score: 7000 }, // Ótima para APUs novas
    ];

    // Lista de Jogos
    const dbGames = [
        // Resident Evil
        { name: "Resident Evil 4 Remake", minCpu: 12000, minGpu: 9000, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg" },
        { name: "Resident Evil Village", minCpu: 9000, minGpu: 8000, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg" },
        { name: "Resident Evil 2 Remake", minCpu: 7000, minGpu: 6000, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg" },
        // Populares
        { name: "Cyberpunk 2077 (Phantom Liberty)", minCpu: 13000, minGpu: 11000, minRam: 12, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg" },
        { name: "Elden Ring", minCpu: 9000, minGpu: 9000, minRam: 12, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg" },
        { name: "Black Myth: Wukong", minCpu: 14000, minGpu: 12500, minRam: 16, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg" },
        { name: "GTA V", minCpu: 4000, minGpu: 3500, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg" },
        { name: "Red Dead Redemption 2", minCpu: 8000, minGpu: 8000, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg" },
        { name: "The Witcher 3: Wild Hunt", minCpu: 5000, minGpu: 4500, minRam: 6, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg" },
        // eSports
        { name: "Valorant", minCpu: 3000, minGpu: 2000, minRam: 4, cover: "https://cdn2.unrealengine.com/valorant-covert-ops-1920x1080-606085189.jpg" },
        { name: "Counter-Strike 2", minCpu: 8000, minGpu: 6000, minRam: 8, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg" },
        { name: "League of Legends", minCpu: 2000, minGpu: 1500, minRam: 4, cover: "https://cdn1.epicgames.com/offer/24b9b5e323bc491c9907b97034d1f092/EGS_LeagueofLegends_RiotGames_S1_2560x1440-80471666c140f790f28dff68d72c384b" },
        // Leves
        { name: "Stardew Valley", minCpu: 1500, minGpu: 500, minRam: 2, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg" },
        { name: "Hollow Knight", minCpu: 2000, minGpu: 1500, minRam: 4, cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg" },
    ];

    // --- ESTADO ---
    let selectedCPU = null;
    let selectedGPU = null;
    let selectedGame = null;

    /* --- LÓGICA AUTOCOMPLETE --- */
    function setupAutocomplete(inputId, listId, dataArray, onSelect) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        input.addEventListener('input', function() {
            const val = this.value.toLowerCase().trim();
            list.innerHTML = '';
            
            if (!val) {
                list.style.display = 'none';
                return;
            }

            const matches = dataArray.filter(item => item.name.toLowerCase().includes(val));

            if (matches.length > 0) {
                list.style.display = 'block';
                matches.slice(0, 8).forEach(item => { // Limitando a 8 resultados
                    const div = document.createElement('div');
                    div.className = 'ac-item';
                    
                    // Highlight da parte encontrada
                    const regex = new RegExp(`(${val})`, 'gi');
                    const highlightedName = item.name.replace(regex, '<span style="color:var(--steam-blue);font-weight:bold">$1</span>');
                    
                    div.innerHTML = `<span>${highlightedName}</span>`;
                    
                    // Adicionar score/detalhe pequeno se for hardware
                    if(item.score) div.innerHTML += `<small style="float:right; opacity:0.3">Score: ${item.score}</small>`;

                    div.addEventListener('click', function() {
                        input.value = item.name;
                        list.style.display = 'none';
                        onSelect(item);
                    });
                    
                    list.appendChild(div);
                });
            } else {
                list.style.display = 'none';
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target !== input) {
                list.style.display = 'none';
            }
        });
    }

    setupAutocomplete('cpu-input', 'cpu-list', dbCPUs, (item) => selectedCPU = item);
    setupAutocomplete('gpu-input', 'gpu-list', dbGPUs, (item) => selectedGPU = item);
    setupAutocomplete('game-input', 'game-list', dbGames, (item) => selectedGame = item);


    /* --- ANÁLISE --- */
    function analisarCompatibilidade() {
        if(!selectedCPU || !selectedGPU || !selectedGame) {
            alert("⚠️ Selecione todas as peças e o jogo usando a busca automática.");
            return;
        }

        const ramVal = parseInt(document.getElementById('ram-input').value);
        const resultPanel = document.getElementById('result-panel');
        const heroBg = document.getElementById('game-hero-bg');
        
        // Configurar Título e Imagem
        document.getElementById('res-game-title').innerText = selectedGame.name;
        if(selectedGame.cover) {
            heroBg.style.backgroundImage = `linear-gradient(to right, rgba(23,26,33,0.9), transparent), url('${selectedGame.cover}')`;
        }

        resultPanel.style.display = 'block';

        // Elementos de UI
        const badge = document.getElementById('res-badge');
        const badgeText = document.getElementById('res-text');
        const upgradeBox = document.getElementById('upgrade-box');
        const upgradeList = document.getElementById('upgrade-list');
        upgradeList.innerHTML = '';
        
        let fails = [];

        // 1. CPU
        document.getElementById('res-cpu-name').innerText = selectedCPU.name;
        const cpuStatus = document.getElementById('res-cpu-status');
        if (selectedCPU.score >= selectedGame.minCpu) {
            cpuStatus.innerText = "APROVADO";
            cpuStatus.style.color = "#a4d007";
        } else {
            cpuStatus.innerText = "FRACO";
            cpuStatus.style.color = "#ff4c4c";
            fails.push(`Processador: ${selectedCPU.name} é fraco para este jogo.`);
        }

        // 2. GPU
        document.getElementById('res-gpu-name').innerText = selectedGPU.name;
        const gpuStatus = document.getElementById('res-gpu-status');
        if (selectedGPU.score >= selectedGame.minGpu) {
            gpuStatus.innerText = "APROVADO";
            gpuStatus.style.color = "#a4d007";
        } else {
            gpuStatus.innerText = "GARGALO";
            gpuStatus.style.color = "#ff4c4c";
            fails.push(`Placa de Vídeo: A ${selectedGPU.name} não aguenta os gráficos recomendados.`);
        }

        // 3. RAM
        document.getElementById('res-ram-val').innerText = `${ramVal} GB`;
        const ramStatus = document.getElementById('res-ram-status');
        if (ramVal >= selectedGame.minRam) {
            ramStatus.innerText = "APROVADO";
            ramStatus.style.color = "#a4d007";
        } else {
            ramStatus.innerText = `REQUER ${selectedGame.minRam} GB`;
            ramStatus.style.color = "#ff4c4c";
            fails.push(`Memória RAM: O jogo pede ${selectedGame.minRam} GB.`);
        }

        // VEREDITO
        if (fails.length === 0) {
            badge.className = "status-pill pill-green";
            badge.innerText = "RODA LISO! 🟢";
            badgeText.innerText = "Pode comprar sem medo. Seu PC aguenta tranquilamente.";
            upgradeBox.style.display = 'none';
        } else {
            badge.className = "status-pill pill-red";
            badge.innerText = "NÃO VAI RODAR BEM 🔴";
            badgeText.innerText = "Seu computador tem peças que não atendem aos requisitos.";
            
            upgradeBox.style.display = 'block';
            fails.forEach(fail => {
                let li = document.createElement('li');
                li.innerText = fail;
                upgradeList.appendChild(li);
            });
        }

        resultPanel.scrollIntoView({ behavior: 'smooth' });
    }

    // ===== TEMA E IDIOMA (SAE PATTERN) =====
    function changeTheme(theme) {
        document.body.className = '';
        if (theme !== 'default') {
            document.body.classList.add('theme-' + theme);
        }
        localStorage.setItem('saeTheme', theme);
    }

    function toggleSeasonal(enabled) {
        localStorage.setItem('seasonalEnabled', enabled);
        // Implementar efeitos sazonais se necessário
    }

    // Carregar tema salvo
    document.addEventListener('DOMContentLoaded', function() {
        const savedTheme = localStorage.getItem('saeTheme') || 'default';
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = savedTheme;
            changeTheme(savedTheme);
        }

        const seasonalEnabled = localStorage.getItem('seasonalEnabled') === 'true';
        const seasonalCheck = document.getElementById('seasonalCheck');
        if (seasonalCheck) {
            seasonalCheck.checked = seasonalEnabled;
        }

        // Aplicar idioma se disponível
        if (typeof applyI18n === 'function') {
            const savedLang = localStorage.getItem('selectedLanguage') || 'pt';
            const langSelector = document.getElementById('langSelector');
            if (langSelector) {
                langSelector.value = savedLang;
            }
            applyI18n(savedLang);
        }
    });
</script>

</body>
</html>