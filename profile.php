<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil Público - Steam Explorer</title>
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="profile">
    <meta property="og:title" content="Perfil Steam - Steam Explorer" id="ogTitle">
    <meta property="og:description" content="Veja minhas conquistas e estatísticas Steam!" id="ogDesc">
    <meta property="og:image" content="" id="ogImage">
    <meta property="og:url" content="" id="ogUrl">
    <meta name="twitter:card" content="summary_large_image">
    
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    
    <style>
        :root {
            --primary-color: #00f3ff;
            --secondary-color: #bc13fe;
            --bg-dark: #050b14;
            --bg-panel: rgba(16, 26, 46, 0.95);
            --text-main: #e0e6ed;
            --text-dim: #94a3b8;
            --success: #00ff9d;
            --warning: #ffbd2e;
            --danger: #ff0055;
            --gold: #ffd700;
            --font-display: 'Orbitron', sans-serif;
            --font-body: 'Rajdhani', sans-serif;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: var(--font-body); 
            background: var(--bg-dark); 
            color: var(--text-main); 
            min-height: 100vh;
            background: linear-gradient(135deg, #050b14 0%, #0a1628 50%, #050b14 100%);
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        header {
            background: var(--bg-panel);
            border-bottom: 1px solid rgba(0,243,255,0.2);
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo { font-family: var(--font-display); font-size: 24px; color: var(--primary-color); text-decoration: none; }
        .back-btn { color: var(--text-dim); text-decoration: none; display: flex; align-items: center; gap: 8px; transition: color 0.3s; }
        .back-btn:hover { color: var(--primary-color); }
        
        .profile-hero {
            background: var(--bg-panel);
            border-radius: 20px;
            padding: 40px;
            margin: 30px 0;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .profile-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 150px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            opacity: 0.2;
        }
        
        .profile-content {
            position: relative;
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }
        
        .avatar-section { text-align: center; }
        
        .avatar {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 4px solid var(--primary-color);
            box-shadow: 0 0 30px rgba(0,243,255,0.3);
        }
        
        .username {
            font-family: var(--font-display);
            font-size: 32px;
            margin-top: 15px;
        }
        
        .level-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--gold), #ff8c00);
            color: black;
            padding: 5px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .stats-section { flex: 1; }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.05);
        }
        
        .stat-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .stat-icon.gold { color: var(--gold); }
        .stat-icon.cyan { color: var(--primary-color); }
        .stat-icon.green { color: var(--success); }
        .stat-icon.purple { color: var(--secondary-color); }
        
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            font-family: var(--font-display);
        }
        
        .stat-label {
            color: var(--text-dim);
            font-size: 14px;
            margin-top: 5px;
        }
        
        .share-section {
            background: var(--bg-panel);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .share-title {
            font-family: var(--font-display);
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .share-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .share-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 25px;
            border-radius: 10px;
            border: none;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            color: white;
        }
        
        .share-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
        
        .share-btn.twitter { background: #1da1f2; }
        .share-btn.discord { background: #5865f2; }
        .share-btn.copy { background: var(--primary-color); color: black; }
        .share-btn.download { background: var(--success); color: black; }
        
        .url-box {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .url-input {
            flex: 1;
            padding: 12px 15px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.3);
            color: var(--text-main);
            font-family: monospace;
        }
        
        .games-showcase {
            background: var(--bg-panel);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .section-title {
            font-family: var(--font-display);
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .game-card {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.3s;
        }
        
        .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,243,255,0.2);
        }
        
        .game-card.platinum { border-color: var(--gold); }
        
        .game-img { width: 100%; height: 100px; object-fit: cover; }
        .game-info { padding: 12px; }
        .game-name { font-weight: bold; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .game-progress {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
        }
        
        .progress-bar {
            flex: 1;
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            margin-right: 10px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--success));
            border-radius: 3px;
        }
        
        .progress-text { font-size: 12px; color: var(--text-dim); }
        
        .charts-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .chart-card {
            background: var(--bg-panel);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .chart-container { height: 250px; }
        
        .loader {
            text-align: center;
            padding: 100px;
        }
        
        .loader i { font-size: 50px; color: var(--primary-color); }
        
        .not-found {
            text-align: center;
            padding: 100px;
        }
        
        .not-found i { font-size: 80px; color: var(--text-dim); margin-bottom: 20px; }
        
        /* ========== RESPONSIVE DESIGN ========== */
        @media (max-width: 768px) {
            header { flex-direction: column; gap: 15px; padding: 15px 0; }
            .main-nav { flex-wrap: wrap; justify-content: center; gap: 8px; }
            .nav-btn { padding: 6px 12px; font-size: 10px; }
            .nav-menu-dropdown { position: fixed; top: auto; bottom: 0; left: 0; right: 0; border-radius: 20px 20px 0 0; min-width: 100%; }
            .logo { font-size: 16px; }
            
            .profile-content { flex-direction: column; text-align: center; }
            .profile-card { padding: 20px; }
            .profile-avatar { width: 80px; height: 80px; }
            .profile-name { font-size: 20px; }
            
            .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .stat-card { padding: 15px; }
            .stat-value { font-size: 20px; }
            
            .charts-section { grid-template-columns: 1fr; gap: 15px; }
            .chart-container { padding: 15px; }
            
            .games-section { padding: 15px; }
            .container { padding: 15px 10px; }
        }

        @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
            .stat-card { padding: 12px; }
            .stat-value { font-size: 18px; }
            .stat-label { font-size: 10px; }
            
            .profile-avatar { width: 60px; height: 60px; }
            .profile-name { font-size: 18px; }
        }
    </style>
<link rel=\"stylesheet\" href=\"styles/global.css\">`n</head>
<body>
    
        <header class="main-header glass-card" style="margin-bottom: 30px; border-radius: 20px; padding: 15px 30px; border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; z-index: 10000; position: relative; flex-wrap: wrap; gap: 15px;">
            <div class="logo-area" style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="window.location.href='index.html'">
                <i class="fab fa-steam logo-icon" style="color: #06BFFF; text-shadow: 0 0 15px rgba(6,191,255,0.5); font-size: 28px;"></i>
                <h1 class="site-title" style="background: linear-gradient(90deg, #fff, #06BFFF); -webkit-background-clip: text; color: transparent; font-weight: 800; font-size: 22px; margin: 0; font-family: 'Orbitron', sans-serif;">SAE</h1>
            </div>
            <nav class="main-nav" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <a href="index.html" class="nav-btn primary" style="background: linear-gradient(135deg, #06BFFF, #bc13fe); color: #000; font-weight: bold; padding: 8px 20px; font-size: 12px; border: none; box-shadow: 0 0 20px rgba(6,191,255,0.3); border-radius: 15px; text-decoration: none; display: flex; align-items: center; gap: 6px;"><i class="fas fa-gamepad"></i> <span data-i18n-key="nav_library">BIBLIOTECA</span></a>
                <div class="nav-menu-container" style="position: relative;">
                    <button class="nav-menu-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 15px; border-radius: 15px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 11px; display: flex; align-items: center; gap: 8px; transition: 0.3s;"><i class="fas fa-bars"></i> MENU <i class="fas fa-chevron-down" style="font-size:8px;"></i></button>
                    <div class="nav-menu-dropdown" style="position: absolute; top: 100%; left: 0; margin-top: 10px; background: rgba(16, 26, 46, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; min-width: 180px; padding: 10px 0; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s ease; z-index: 1000;">
                        <style>
                            .nav-menu-container:hover .nav-menu-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
                            .nav-menu-dropdown a { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #e0e6ed; text-decoration: none; font-size: 14px; transition: 0.2s; font-family: 'Rajdhani', sans-serif; }
                            .nav-menu-dropdown a:hover { background: rgba(6, 191, 255, 0.1); color: #06BFFF; }
                            .nav-menu-dropdown a i { width: 20px; text-align: center; color: #06BFFF; }
                        </style>
                        <a href="hall.html"><i class="fas fa-trophy"></i> <span data-i18n-key="hall_title">Hall da Fama</span></a>
                        <a href="roleta.html"><i class="fas fa-dice"></i> <span data-i18n-key="nav_roulette">Roleta</span></a>
                        <a href="level.html"><i class="fas fa-star"></i> Level / XP</a>
                        <a href="prices.html"><i class="fas fa-chart-line"></i> <span data-i18n-key="prices_title">Histórico Preços</span></a>
                        <a href="compare.html"><i class="fas fa-users"></i> <span data-i18n-key="compare_title">Comparar Perfis</span></a>
                        <a href="museum.html"><i class="fas fa-landmark"></i> Museu 3D</a>
                        <a href="wallpaper.html"><i class="fas fa-image"></i> <span data-i18n-key="nav_wallpaper">Wallpaper</span></a>
                        <a href="desafio.html"><i class="fas fa-calendar-check"></i> <span data-i18n-key="challenge_title">Desafio Diário</span></a>
                        <a href="timeline.html"><i class="fas fa-clock-rotate-left"></i> <span data-i18n-key="nav_timeline">Timeline</span></a>
                        <a href="hardware_check.html"><i class="fas fa-microchip"></i> <span data-i18n-key="nav_hardware">Hardware Lab</span></a>
                        <a href="wrapped.html"><i class="fas fa-gift"></i> Wrapped</a>
                    </div>
                </div>
            </nav>
            <div class="header-controls" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end;">
                <a href="level.html" class="header-xp-container" id="headerXpContainer" style="display:none; align-items: center; gap: 10px; background: rgba(0,0,0,0.35); padding: 6px 12px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.08); text-decoration: none;" title="Ver detalhes do nível">
                    <span class="header-lvl-badge" id="hLvl" style="background: linear-gradient(135deg, #06BFFF, #bc13fe); color: #000; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-family: 'Orbitron', sans-serif; min-width: 50px; text-align: center;">Lv 1</span>
                    <div class="header-xp-bar" style="width: 100px; height: 8px; background: #222; border-radius: 6px; overflow: hidden;">
                        <div class="header-xp-fill" id="hBar" style="height: 100%; background: linear-gradient(90deg, #06BFFF, #bc13fe); width: 0%; transition: width 0.6s ease;"></div>
                    </div>
                    <span class="header-xp-text" id="hText" style="font-size: 11px; color: #94a3b8; font-family: 'Rajdhani', sans-serif;">0 XP</span>
                </a>
                <button class="icon-btn" onclick="openVersusModal()" title="Versus" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.3s;"><i class="fas fa-fist-raised"></i></button>
                <button class="icon-btn" onclick="openMonthlyGoalModal()" title="Meta Mensal" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.3s;"><i class="fas fa-bullseye"></i></button>
                <select id="themeSelector" onchange="changeTheme(this.value)" class="theme-select" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e6ed; padding: 6px 10px; border-radius: 15px; font-family: 'Rajdhani', sans-serif; font-weight: bold; cursor: pointer; outline: none; font-size: 12px; max-width: 100px;">
                    <option value="default" style="background: #050b14; color: #e0e6ed;">🎮 Padrão</option>
                    <option value="rgb" style="background: #050b14; color: #e0e6ed;">🌈 RGB</option>
                    <option value="retro" style="background: #050b14; color: #e0e6ed;">👾 Retrô</option>
                    <option value="light" style="background: #050b14; color: #e0e6ed;">☀️ Claro</option>
                    <option value="dark" style="background: #050b14; color: #e0e6ed;">🌙 Escuro</option>
                </select>
                <select id="langSelector" onchange="changeLanguage(this.value)" class="theme-select" title="Idioma" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e6ed; padding: 6px 10px; border-radius: 15px; font-family: 'Rajdhani', sans-serif; font-weight: bold; cursor: pointer; outline: none; font-size: 12px; max-width: 100px;">
                    <option value="pt" style="background: #050b14; color: #e0e6ed;">🇧🇷 PT</option>
                    <option value="en" style="background: #050b14; color: #e0e6ed;">🇺🇸 EN</option>
                    <option value="es" style="background: #050b14; color: #e0e6ed;">🇪🇸 ES</option>
                    <option value="fr" style="background: #050b14; color: #e0e6ed;">🇫🇷 FR</option>
                    <option value="de" style="background: #050b14; color: #e0e6ed;">🇩🇪 DE</option>
                    <option value="ru" style="background: #050b14; color: #e0e6ed;">🇷🇺 RU</option>
                    <option value="ja" style="background: #050b14; color: #e0e6ed;">🇯🇵 JA</option>
                    <option value="zh" style="background: #050b14; color: #e0e6ed;">🇨🇳 ZH</option>
                </select>
                <button class="icon-btn seasonal-btn" id="seasonalToggleBtn" onclick="toggleSeasonalTheme()" title="Efeitos sazonais" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.3s;">
                    <i class="fas fa-snowflake" id="seasonalIcon"></i>
                </button>
                <button class="icon-btn" onclick="openSignatureModal()" title="Gerar Card" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.3s;"><i class="fas fa-camera"></i></button>
            </div>
        </header>
    
    <div class="container">
        <div id="loader" class="loader">
            <i class="fas fa-spinner fa-spin"></i>
            <p style="margin-top: 20px;">Carregando perfil...</p>
        </div>
        
        <div id="notFound" class="not-found" style="display: none;">
            <i class="fas fa-user-slash"></i>
            <h2>Perfil não encontrado</h2>
            <p>Verifique o ID do usuário ou se o perfil é público.</p>
            <a href="index.html" style="color: var(--primary-color);">Voltar para o início</a>
        </div>
        
        <div id="profileContent" style="display: none;">
            <div class="profile-hero" id="profileCard">
                <div class="profile-content">
                    <div class="avatar-section">
                        <img src="" alt="Avatar" class="avatar" id="userAvatar">
                        <h1 class="username" id="userName">Carregando...</h1>
                        <span class="level-badge" id="userLevel">Lv 1</span>
                    </div>
                    <div class="stats-section">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon gold"><i class="fas fa-trophy"></i></div>
                                <div class="stat-value" id="statPlatinum">0</div>
                                <div class="stat-label">Platinas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon cyan"><i class="fas fa-gamepad"></i></div>
                                <div class="stat-value" id="statGames">0</div>
                                <div class="stat-label">Jogos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon green"><i class="fas fa-medal"></i></div>
                                <div class="stat-value" id="statAchievements">0</div>
                                <div class="stat-label">Conquistas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon purple"><i class="fas fa-clock"></i></div>
                                <div class="stat-value" id="statHours">0</div>
                                <div class="stat-label">Horas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="share-section">
                <h3 class="share-title"><i class="fas fa-share-alt"></i> Compartilhar Perfil</h3>
                <div class="share-buttons">
                    <button class="share-btn twitter" onclick="shareTwitter()">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-btn discord" onclick="shareDiscord()">
                        <i class="fab fa-discord"></i> Discord
                    </button>
                    <button class="share-btn copy" onclick="copyLink()">
                        <i class="fas fa-link"></i> Copiar Link
                    </button>
                    <button class="share-btn download" onclick="downloadCard()">
                        <i class="fas fa-download"></i> Baixar Card
                    </button>
                </div>
                <div class="url-box">
                    <input type="text" class="url-input" id="profileUrl" readonly>
                    <button class="share-btn copy" onclick="copyLink()" style="padding: 12px 20px;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            
            <div class="games-showcase">
                <h3 class="section-title"><i class="fas fa-star"></i> Jogos em Destaque</h3>
                <div class="games-grid" id="gamesGrid"></div>
            </div>
            
            <div class="charts-section">
                <div class="chart-card">
                    <h3 class="section-title"><i class="fas fa-chart-pie"></i> Distribuição</h3>
                    <div class="chart-container">
                        <canvas id="pieChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3 class="section-title"><i class="fas fa-chart-bar"></i> Top Jogos</h3>
                    <div class="chart-container">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const API_KEY = 'SUA_API_KEY';
        let currentProfile = null;
        
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const steamId = urlParams.get('id');
            
            if (steamId) {
                loadProfile(steamId);
            } else {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('notFound').style.display = 'block';
            }
        });
        
        async function loadProfile(steamId) {
            try {
                // Buscar dados via proxy
                const profileRes = await fetch(`api/steam/profile?id=${steamId}`);
                const profile = await profileRes.json();
                
                if (profile.error) throw new Error(profile.error);
                
                const gamesRes = await fetch(`api/steam/games?id=${steamId}`);
                const games = await gamesRes.json();
                
                currentProfile = { profile, games };
                displayProfile(profile, games);
                
            } catch (error) {
                console.error('Erro:', error);
                // Fallback demo
                loadDemoProfile(steamId);
            }
        }
        
        function loadDemoProfile(steamId) {
            const demoProfile = {
                personaname: 'Player Demo',
                avatarfull: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
                steamid: steamId
            };
            
            const demoGames = {
                games: [
                    { appid: 1245620, name: 'Elden Ring', playtime_forever: 12000, percent: 100 },
                    { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 8500, percent: 85 },
                    { appid: 1174180, name: 'Red Dead Redemption 2', playtime_forever: 15000, percent: 72 },
                    { appid: 1593500, name: 'God of War', playtime_forever: 3600, percent: 100 },
                    { appid: 1145360, name: 'Hades', playtime_forever: 4800, percent: 95 },
                    { appid: 367520, name: 'Hollow Knight', playtime_forever: 6000, percent: 88 }
                ]
            };
            
            displayProfile(demoProfile, demoGames);
        }
        
        function displayProfile(profile, gamesData) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('profileContent').style.display = 'block';
            
            // Avatar e nome
            document.getElementById('userAvatar').src = profile.avatarfull;
            document.getElementById('userName').innerText = profile.personaname;
            
            // Atualizar URL
            const profileUrl = `${window.location.origin}${window.location.pathname}?id=${profile.steamid}`;
            document.getElementById('profileUrl').value = profileUrl;
            
            // Open Graph
            document.getElementById('ogTitle').content = `${profile.personaname} - Steam Explorer`;
            document.getElementById('ogUrl').content = profileUrl;
            
            // Stats
            const games = gamesData.games || [];
            const totalHours = Math.round(games.reduce((sum, g) => sum + (g.playtime_forever || 0), 0) / 60);
            const platinums = games.filter(g => g.percent === 100).length;
            const totalAchievements = games.reduce((sum, g) => sum + (g.unlocked || 0), 0);
            
            document.getElementById('statGames').innerText = games.length;
            document.getElementById('statHours').innerText = totalHours.toLocaleString();
            document.getElementById('statPlatinum').innerText = platinums;
            document.getElementById('statAchievements').innerText = totalAchievements.toLocaleString();
            
            // Level (baseado em XP simplificado)
            const xp = platinums * 100 + totalAchievements;
            const level = Math.floor(xp / 500) + 1;
            document.getElementById('userLevel').innerText = `Lv ${level}`;
            
            // Games grid
            const gamesGrid = document.getElementById('gamesGrid');
            gamesGrid.innerHTML = '';
            
            const topGames = games
                .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
                .slice(0, 8);
            
            topGames.forEach(game => {
                const percent = game.percent || 0;
                const isPlatinum = percent === 100;
                
                gamesGrid.innerHTML += `
                    <div class="game-card ${isPlatinum ? 'platinum' : ''}">
                        <img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg" 
                             class="game-img" onerror="this.src='https://placehold.co/200x100/111/fff?text=No+Image'">
                        <div class="game-info">
                            <div class="game-name">${game.name}</div>
                            <div class="game-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percent}%"></div>
                                </div>
                                <span class="progress-text">${percent}%</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // Charts
            renderCharts(games);
        }
        
        function renderCharts(games) {
            // Pie chart - distribuição
            const platinums = games.filter(g => g.percent === 100).length;
            const inProgress = games.filter(g => g.percent >= 50 && g.percent < 100).length;
            const started = games.filter(g => g.percent > 0 && g.percent < 50).length;
            const notStarted = games.filter(g => !g.percent || g.percent === 0).length;
            
            new Chart(document.getElementById('pieChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Platinados', 'Em progresso', 'Iniciados', 'Não jogados'],
                    datasets: [{
                        data: [platinums, inProgress, started, notStarted],
                        backgroundColor: ['#ffd700', '#00f3ff', '#bc13fe', '#333']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { color: '#e0e6ed' }
                        }
                    }
                }
            });
            
            // Bar chart - top games
            const topGames = games
                .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
                .slice(0, 5);
            
            new Chart(document.getElementById('barChart'), {
                type: 'bar',
                data: {
                    labels: topGames.map(g => g.name.substring(0, 12) + '...'),
                    datasets: [{
                        label: 'Horas',
                        data: topGames.map(g => Math.round((g.playtime_forever || 0) / 60)),
                        backgroundColor: '#00f3ff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                    }
                }
            });
        }
        
        function shareTwitter() {
            const url = document.getElementById('profileUrl').value;
            const text = `Confira meu perfil no Steam Explorer! 🎮`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        }
        
        function shareDiscord() {
            copyLink();
        }
        
        function copyLink() {
            const input = document.getElementById('profileUrl');
            input.select();
            document.execCommand('copy');
            // Feedback visual
            const btn = document.querySelector('.share-btn');
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                setTimeout(() => btn.innerHTML = original, 2000);
            }
        }
        
        async function downloadCard() {
            const card = document.getElementById('profileCard');
            try {
                const canvas = await html2canvas(card, {
                    backgroundColor: '#050b14',
                    scale: 2
                });
                const link = document.createElement('a');
                link.download = 'steam-profile-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (e) {
                console.error('Erro ao gerar imagem');
            }
        }
    </script>
</body>
</html>

