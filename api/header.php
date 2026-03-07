<?php
// api/header.php
require_once __DIR__ . '/db.php';

// Simulação de XP/Nível (Em um sistema real, viria da sessão ou banco por ID)
// Aqui podemos buscar do banco se houver um ID na URL ou algo do tipo
$level = 10;
$xp_percent = 65;

// Identificar página atual para classe 'active'
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAE - Steam Achievement Experience</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Styles -->
    <link rel="stylesheet" href="styles/global.css">
    <style>
        /* Estilos específicos que podem mudar por página ou precisar de injeção direta */
    </style>
</head>
<body class="animate-in">
    <header class="main-header">
        <div class="header-left">
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem;">
                <div class="logo-box" style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--primary-glow); transition: 0.3s;">
                    <i class="fab fa-steam" style="font-size: 1.6rem; color: white;"></i>
                </div>
                <div style="display: flex; flex-direction: column; line-height: 1;">
                    <span class="premium-font" style="font-size: 1.6rem; letter-spacing: -1px; font-weight: 800;">SAE<span style="color: var(--primary);">.</span></span>
                    <span style="font-size: 0.6rem; color: var(--text-muted); letter-spacing: 2px; font-weight: 700; margin-top: 2px;">PREMIUM</span>
                </div>
            </a>
        </div>

        <nav>
            <ul class="nav-links">
                <li><a href="index.php" class="<?= $current_page == 'index.php' ? 'active' : '' ?>">DASHBOARD</a></li>
                <li><a href="compare.php" class="<?= $current_page == 'compare.php' ? 'active' : '' ?>">VERSUS</a></li>
                <li><a href="hardware_check.php" class="<?= $current_page == 'hardware_check.php' ? 'active' : '' ?>">LAB</a></li>
                <li><a href="hall.php" class="<?= $current_page == 'hall.php' ? 'active' : '' ?>">HALL</a></li>
                <li><a href="prices.php" class="<?= $current_page == 'prices.php' ? 'active' : '' ?>">PRICES</a></li>
            </ul>
        </nav>

        <div class="header-right" style="display: flex; align-items: center; gap: 2rem;">
            <!-- Dynamic XP System -->
            <div class="xp-display" style="text-align: right;">
                <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.8rem; color: var(--primary); letter-spacing: 1px; margin-bottom: 4px;">LVL <?= $level ?></div>
                <div class="xp-bar-bg" style="width: 120px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <div class="xp-bar-fill" style="width: <?= $xp_percent ?>%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); box-shadow: 0 0 10px var(--primary-glow); transition: width 1.5s cubic-bezier(0.19, 1, 0.22, 1);"></div>
                </div>
            </div>
            
            <div class="profile-nexus" style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.03); border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s;">
                <div style="width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--primary); padding: 2px; box-shadow: 0 0 10px var(--primary-glow);">
                    <img id="headerAvatar" src="https://avatars.cloudflare.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                </div>
                <span id="headerName" style="font-weight: 700; font-size: 0.85rem; font-family: 'Outfit'; letter-spacing: 0.5px;">SYSTEM</span>
                <i class="fas fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
            </div>
        </div>
    </header>

    <script>
    // Sync header with localStorage on load
    window.addEventListener('DOMContentLoaded', () => {
        const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}');
        const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
        if(profile.personaname) {
            document.getElementById('headerName').innerText = profile.personaname.toUpperCase();
            document.getElementById('headerAvatar').src = profile.avatarfull;
        }
    });

    // Hover effect for logo
    document.querySelector('.logo-box').parentElement.addEventListener('mouseenter', () => {
        document.querySelector('.logo-box').style.transform = 'scale(1.1) rotate(5deg)';
    });
    document.querySelector('.logo-box').parentElement.addEventListener('mouseleave', () => {
        document.querySelector('.logo-box').style.transform = 'scale(1) rotate(0deg)';
    });
    </script>

    <main style="max-width: 1400px; margin: 5rem auto; padding: 0 2rem;">
