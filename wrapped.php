<?php 
// wrapped.php
// Não inclui o header padrão pois o Wrapped tem uma interface full-screen imersiva (Stories)
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Steam Wrapped // SAE PREMIUM</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles/global.css">
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

    <style>
        :root {
            --primary: #00f3ff;
            --secondary: #bc13fe;
            --bg: #050b14;
            --accent: #00f3ff;
            --accent-glow: rgba(0, 243, 255, 0.3);
        }

        body {
            background-color: #000;
            color: #fff;
            margin: 0;
            height: 100vh;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background: radial-gradient(circle at 50% 50%, #0a1628 0%, #000 100%);
        }

        .story-container {
            width: 100%;
            height: 100%;
            max-width: 450px;
            background: #050b14;
            position: relative;
            display: flex;
            flex-direction: column;
            border-left: 1px solid rgba(255,255,255,0.05);
            border-right: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 0 100px rgba(0, 243, 255, 0.1);
        }

        .progress-container {
            position: absolute;
            top: 20px; left: 15px; right: 15px;
            display: flex; gap: 6px; z-index: 100;
        }
        
        .progress-bar {
            flex: 1; height: 3px; background: rgba(255,255,255,0.1);
            border-radius: 10px; overflow: hidden;
        }
        
        .progress-fill {
            height: 100%; background: var(--accent); width: 0%;
            transition: width 0.1s linear;
            box-shadow: 0 0 10px var(--accent-glow);
        }
        
        .slide {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            padding: 40px; text-align: center;
            opacity: 0; pointer-events: none;
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slide.active { opacity: 1; pointer-events: all; }

        .big-text {
            font-family: 'Orbitron', sans-serif; font-size: 2.5rem; font-weight: 900;
            margin-bottom: 20px; letter-spacing: -1px;
            background: linear-gradient(to bottom, #fff, #888);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .highlight-stat {
            font-size: 5rem; font-weight: bold; color: var(--accent);
            text-shadow: 0 0 30px var(--accent-glow);
            font-family: 'Orbitron';
        }

        .nav-area { position: absolute; top: 0; bottom: 100px; width: 40%; z-index: 50; cursor: pointer; }
        .nav-left { left: 0; }
        .nav-right { right: 0; }

        #loader {
            position: fixed; inset: 0; background: #000; z-index: 999;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
        }
        
        .btn-wrapped {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: #fff; padding: 12px 25px; border-radius: 30px;
            font-family: 'Orbitron'; font-size: 0.8rem; cursor: pointer;
            transition: 0.3s;
        }
        .btn-wrapped:hover { background: var(--accent); color: #000; border-color: var(--accent); }
    </style>
</head>
<body>

    <div id="loader">
        <div class="spinner-premium"></div>
        <p class="premium-font" style="margin-top:2rem; color: var(--accent); letter-spacing: 5px;">SYNCING WRAPPED...</p>
    </div>

    <div class="story-container" id="storyContainer">
        <div class="progress-container" id="progressContainer"></div>

        <div class="nav-area nav-left" onclick="prevSlide()"></div>
        <div class="nav-area nav-right" onclick="nextSlide()"></div>

        <!-- Slide 0: Intro -->
        <div class="slide active">
            <h4 class="premium-font" style="color: var(--accent); margin-bottom: 1rem;">SAE WRAPPED // 2024</h4>
            <div style="width: 100px; height: 100px; margin-bottom: 2rem; border: 3px solid var(--accent); border-radius: 50%; overflow: hidden; box-shadow: 0 0 30px var(--accent-glow);">
                <img id="userAvatar" src="" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="big-text">SUA JORNADA,<br><span id="userName" style="color: var(--primary); -webkit-text-fill-color: var(--primary);">GAMER</span></div>
            <p style="color: var(--text-muted); font-size: 1.1rem;">Prepare-se para ver seu ano em dados.</p>
        </div>

        <!-- Slide 1: Stats -->
        <div class="slide">
            <p style="color: var(--text-muted); margin-bottom: 1rem;">ESTE ANO VOCÊ CONQUISTOU</p>
            <div class="highlight-stat" id="totalAchsCount">0</div>
            <div class="big-text">TROFÉUS</div>
            <p style="color: var(--accent); font-weight: bold;">VOCÊ FOI INCANSÁVEL.</p>
        </div>

        <!-- Slide 2: Top Game -->
        <div class="slide">
            <p style="color: var(--text-muted); margin-bottom: 1rem;">SEU JOGO MAIS JOGADO</p>
            <img id="topGameImg" src="" style="width: 220px; height: 330px; object-fit: cover; border-radius: 15px; margin-bottom: 2rem; border: 2px solid #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div class="premium-font" id="topGameName" style="font-size: 1.5rem; margin-bottom: 1rem;">ELDE RING</div>
            <p style="color: var(--accent);">Foram <span id="topGameAchs">0</span> conquistas só nele.</p>
        </div>

        <!-- Slide 3: Final -->
        <div class="slide">
            <div class="big-text">O LOG FINAL.</div>
            <div class="glass-card" style="width: 100%; padding: 2rem; margin-bottom: 2rem;">
                <p style="font-size: 0.9rem; color: var(--text-muted); text-align: left; margin-bottom: 1rem;">RESUMO OPERACIONAL:</p>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Jogos Desbravados</span>
                    <span id="gamesCount" style="color: var(--accent);">0</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Ranking Global</span>
                    <span style="color: var(--secondary);">TOP 5%</span>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn-wrapped" onclick="location.href='index.php'">SAIR</button>
                <button class="btn-wrapped" style="background: var(--accent); color: #000;" onclick="alert('Card gerado com sucesso!')">COMPARTILHAR</button>
            </div>
        </div>
    </div>

    <script>
        let currentSlide = 0;
        const totalSlides = 4;
        let slideDuration = 5000;
        let interval;

        window.onload = () => {
            const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}');
            const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
            const games = JSON.parse(localStorage.getItem('currentGames') || '[]');

            if(profile.personaname) {
                document.getElementById('userName').innerText = profile.personaname.toUpperCase();
                document.getElementById('userAvatar').src = profile.avatarfull;
                document.getElementById('totalAchsCount').innerText = stats.totalAchievementsUnlocked || 0;
                document.getElementById('gamesCount').innerText = games.length;
                if(games.length > 0) {
                    document.getElementById('topGameName').innerText = games[0].name;
                    document.getElementById('topGameImg').src = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${games[0].appid}/library_600x900.jpg`;
                    document.getElementById('topGameAchs').innerText = games[0].unlocked;
                }
            }

            const progContainer = document.getElementById('progressContainer');
            for(let i=0; i<totalSlides; i++) {
                progContainer.innerHTML += `<div class="progress-bar"><div class="progress-fill" id="fill${i}"></div></div>`;
            }

            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                startStory();
            }, 2000);
        };

        function startStory() {
            updateSlide();
            interval = setInterval(() => {
                if(currentSlide < totalSlides - 1) {
                    nextSlide();
                } else {
                    clearInterval(interval);
                }
            }, slideDuration);
        }

        function updateSlide() {
            document.querySelectorAll('.slide').forEach((s, i) => {
                s.classList.toggle('active', i === currentSlide);
            });
            document.querySelectorAll('.progress-fill').forEach((f, i) => {
                f.style.width = i < currentSlide ? '100%' : (i === currentSlide ? '0%' : '0%');
                if(i === currentSlide) {
                    setTimeout(() => f.style.width = '100%', 50);
                    f.style.transition = `width ${slideDuration}ms linear`;
                } else {
                    f.style.transition = 'none';
                }
            });
        }

        function nextSlide() {
            if(currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlide();
            }
        }

        function prevSlide() {
            if(currentSlide > 0) {
                currentSlide--;
                updateSlide();
            }
        }
    </script>
</body>
</html>
