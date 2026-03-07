<?php 
// museum.php
include 'api/header.php'; 
?>

<!-- Estilos específicos para o Museu para sobrepor o scroll global se necessário -->
<style>
    body { overflow: hidden !important; }
    .main-footer { display: none !important; } /* Ocultar footer no museu para tela cheia */
    
    .museum-ui {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        gap: 1rem;
    }
    
    .museum-stats {
        position: fixed;
        top: 6rem;
        right: 2rem;
        z-index: 1000;
        width: 250px;
    }
    
    .museum-controls {
        position: fixed;
        top: 6rem;
        left: 2rem;
        z-index: 1000;
        backdrop-filter: blur(10px);
        background: rgba(0,0,0,0.5);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .trophy-infobox {
        position: fixed;
        bottom: 8rem;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .trophy-infobox.active {
        opacity: 1;
        bottom: 10rem;
    }
</style>

<div class="loading-screen" id="museumLoader" style="position:fixed; inset:0; background: var(--bg-dark); z-index: 9999; display:flex; flex-direction:column; align-items:center; justify-content:center;">
    <div class="loader-spinner" style="width:80px; height:80px; border-width:4px;"></div>
    <h2 class="premium-font" style="margin-top:2rem; letter-spacing:5px;">CONSTRUINDO AMBIENTE 3D</h2>
</div>

<canvas id="canvas3d" style="position:fixed; top:0; left:0; width:100%; height:100%;"></canvas>

<div class="museum-controls animate-in">
    <h4 class="premium-font" style="font-size:0.8rem; color:var(--primary); margin-bottom:1rem;">MODOS DE EXIBIÇÃO</h4>
    <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <button class="btn-premium" onclick="changeLayout('circle')" style="padding:0.5rem; font-size:0.7rem;"><i class="fas fa-circle"></i> CÍRCULO</button>
        <button class="btn-premium" onclick="changeLayout('grid')" style="padding:0.5rem; font-size:0.7rem;"><i class="fas fa-th"></i> GRID</button>
        <button class="btn-premium" onclick="changeLayout('spiral')" style="padding:0.5rem; font-size:0.7rem;"><i class="fas fa-spinner"></i> ESPIRAL</button>
    </div>
    <hr style="margin:1rem 0; border:0; border-top:1px solid rgba(255,255,255,0.1);">
    <button class="btn-premium" onclick="toggleAutoRotate()" style="width:100%; padding:0.5rem; font-size:0.7rem;"><i class="fas fa-sync"></i> AUTO-ROTAÇÃO</button>
</div>

<div class="museum-stats glass-card animate-in" style="padding:1.5rem;">
    <div style="text-align:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem;">
        <i class="fas fa-landmark" style="font-size:2rem; color:var(--accent);"></i>
        <h4 class="premium-font" style="margin-top:0.5rem;">GALLERY DATA</h4>
    </div>
    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <span style="color:var(--text-muted); font-size:0.8rem;">PLATINAS:</span>
        <span id="platCountDisplay" class="premium-font" style="color:var(--primary);">0</span>
    </div>
    <div style="display:flex; justify-content:space-between;">
        <span style="color:var(--text-muted); font-size:0.8rem;">RARIDADE:</span>
        <span id="rarityDisplay" class="premium-font" style="color:var(--accent);">0.0</span>
    </div>
</div>

<div id="trophyInfo" class="trophy-infobox glass-card" style="padding:2rem; border:1px solid var(--accent);">
    <h2 id="infoTitle" class="premium-font" style="color:var(--accent); font-size:1.8rem; margin-bottom:0.5rem;">GAME TITLE</h2>
    <div id="infoDetails" style="color:var(--text-muted); font-size:0.9rem;">-</div>
    <div style="margin-top:1.5rem;">
        <span class="badge" style="background:var(--accent); color:#000; font-weight:800;">100% COMPLETADO</span>
    </div>
</div>

<div class="museum-ui">
    <button class="btn-premium" onclick="resetCamera()"><i class="fas fa-home"></i> RESET CÂMERA</button>
    <button class="btn-premium" onclick="window.location.href='index.php'"><i class="fas fa-arrow-left"></i> SAIR</button>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
let scene, camera, renderer;
let trophies = [];
let selectedTrophy = null;
let autoRotate = false;
let currentLayout = 'circle';

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b14);
    scene.fog = new THREE.Fog(0x050b14, 15, 60);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 25);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas3d'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Luzes Cyber-Premium
    const ambient = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambient);

    const mainLight = new THREE.PointLight(0x00f3ff, 1.5, 100);
    mainLight.position.set(0, 20, 10);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0xbc13fe, 1, 100);
    accentLight.position.set(20, 10, -10);
    scene.add(accentLight);

    createEnvironment();
    loadLibraryTrophies();
    
    window.addEventListener('resize', onResize);
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    animate();
    
    setTimeout(() => {
        document.getElementById('museumLoader').style.opacity = '0';
        setTimeout(() => document.getElementById('museumLoader').style.display = 'none', 500);
    }, 2000);
}

function createEnvironment() {
    // Chão tecnológico
    const grid = new THREE.GridHelper(200, 100, 0x00f3ff, 0x162a4a);
    grid.position.y = -1;
    scene.add(grid);

    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x050b14, roughness: 0.8, metalness: 0.4 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1;
    floor.receiveShadow = true;
    scene.add(floor);
}

function loadLibraryTrophies() {
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const games = JSON.parse(localStorage.getItem('currentGames') || '[]');
    
    const plats = games.filter(g => g.percent === 100 || g.completion === 100);
    document.getElementById('platCountDisplay').innerText = plats.length;
    
    if(plats.length === 0) {
        // Mock se não houver platinas para demonstrar
        for(let i=0; i<8; i++) spawnTrophy({name: "Exemplo #"+i}, i, 8);
    } else {
        plats.forEach((p, i) => spawnTrophy(p, i, plats.length));
    }
    
    applyLayout('circle');
}

function spawnTrophy(data, index, total) {
    const group = new THREE.Group();
    
    // Base Premium
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.9, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x111, metalness: 1, roughness: 0.2 })
    );
    group.add(base);

    // Corpo do Troféu
    const body = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.1, emissive: 0xffd700, emissiveIntensity: 0.2 })
    );
    body.position.y = 1.5;
    group.add(body);

    const light = new THREE.PointLight(0xffd700, 0.8, 5);
    light.position.y = 1.5;
    group.add(light);

    group.userData = { data: data };
    scene.add(group);
    trophies.push(group);
}

function applyLayout(mode) {
    currentLayout = mode;
    const count = trophies.length;
    const radius = 15;

    trophies.forEach((t, i) => {
        let tx = 0, tz = 0;
        if(mode === 'circle') {
            const angle = (i / count) * Math.PI * 2;
            tx = Math.cos(angle) * radius;
            tz = Math.sin(angle) * radius;
        } else if(mode === 'grid') {
            const size = Math.ceil(Math.sqrt(count));
            tx = (i % size - size/2) * 5;
            tz = (Math.floor(i / size) - size/2) * 5;
        } else if(mode === 'spiral') {
            const a = i * 0.5;
            const r = i * 0.8 + 5;
            tx = Math.cos(a) * r;
            tz = Math.sin(a) * r;
        }
        
        // Tween suave
        t.position.set(tx, 0, tz);
        t.lookAt(0, 0, 0);
    });
}

function onDocumentMouseDown(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(trophies, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while(obj.parent && !trophies.includes(obj)) obj = obj.parent;
        selectTrophy(obj);
    } else {
        closeInfo();
    }
}

function selectTrophy(obj) {
    if(selectedTrophy) selectedTrophy.scale.set(1,1,1);
    selectedTrophy = obj;
    obj.scale.set(1.5, 1.5, 1.5);

    const data = obj.userData.data;
    document.getElementById('infoTitle').innerText = data.name;
    document.getElementById('infoDetails').innerText = data.appid ? `AppID: ${data.appid}` : "Demo Trophy";
    document.getElementById('trophyInfo').classList.add('active');

    // Mover câmera
    const targetPos = obj.position.clone().add(new THREE.Vector3(0, 3, 8));
    camera.position.lerp(targetPos, 0.1);
}

function closeInfo() {
    if(selectedTrophy) selectedTrophy.scale.set(1,1,1);
    selectedTrophy = null;
    document.getElementById('trophyInfo').classList.remove('active');
}

function resetCamera() {
    closeInfo();
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 0, 0);
}

function toggleAutoRotate() { autoRotate = !autoRotate; }

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if(autoRotate) {
        trophies.forEach((t, i) => {
            t.rotation.y += 0.01;
            const angle = Date.now() * 0.001 + i;
            if(currentLayout === 'circle') {
                const r = 15;
                t.position.x = Math.cos(angle * 0.2) * r;
                t.position.z = Math.sin(angle * 0.2) * r;
                t.lookAt(0,0,0);
            }
        });
    }

    // Floating effect
    trophies.forEach((t, i) => {
        t.position.y = Math.sin(Date.now() * 0.002 + i) * 0.2;
    });

    renderer.render(scene, camera);
}

function changeLayout(l) { applyLayout(l); }

init();
</script>

<?php include 'api/footer.php'; ?>
