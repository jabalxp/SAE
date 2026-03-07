const fs = require('fs');
const path = require('path');

const dir = 'c:/xampp/htdocs/SAE';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newHeader = `
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
        </header>`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    // regex to find <header ...> ... </header>
    const headerRegex = /<header[^>]*>[\s\S]*?<\/header>/i;
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, newHeader);
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Updated', file);
    } else {
        console.log('No header found in', file);
    }
});
