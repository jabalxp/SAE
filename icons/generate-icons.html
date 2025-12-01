<!DOCTYPE html>
<html>
<head>
    <title>PWA Icon Generator</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1b2838; color: white; }
        canvas { border: 1px solid #333; margin: 10px; }
        .icons { display: flex; flex-wrap: wrap; gap: 10px; }
        button { padding: 10px 20px; background: #66c0f4; border: none; cursor: pointer; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Gerador de Ícones PWA - SAE</h1>
    <p>Clique no botão para gerar e baixar todos os ícones necessários.</p>
    <button onclick="generateAll()">Gerar Todos os Ícones</button>
    <div class="icons" id="icons"></div>

    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

        function createIcon(size) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#1b2838');
            gradient.addColorStop(1, '#2a475e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            // Border
            ctx.strokeStyle = '#66c0f4';
            ctx.lineWidth = size * 0.04;
            ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

            // Steam-like trophy icon
            ctx.fillStyle = '#66c0f4';
            const centerX = size / 2;
            const centerY = size / 2;
            const scale = size / 100;

            // Trophy cup
            ctx.beginPath();
            ctx.moveTo(centerX - 25 * scale, centerY - 20 * scale);
            ctx.lineTo(centerX - 20 * scale, centerY + 10 * scale);
            ctx.lineTo(centerX + 20 * scale, centerY + 10 * scale);
            ctx.lineTo(centerX + 25 * scale, centerY - 20 * scale);
            ctx.closePath();
            ctx.fill();

            // Trophy handles
            ctx.beginPath();
            ctx.arc(centerX - 28 * scale, centerY - 10 * scale, 8 * scale, 0, Math.PI * 2);
            ctx.arc(centerX + 28 * scale, centerY - 10 * scale, 8 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Trophy base
            ctx.fillRect(centerX - 15 * scale, centerY + 10 * scale, 30 * scale, 5 * scale);
            ctx.fillRect(centerX - 20 * scale, centerY + 15 * scale, 40 * scale, 8 * scale);

            // Star
            ctx.fillStyle = '#ffd700';
            drawStar(ctx, centerX, centerY - 8 * scale, 5, 10 * scale, 5 * scale);

            return canvas;
        }

        function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        }

        function downloadCanvas(canvas, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        function generateAll() {
            const container = document.getElementById('icons');
            container.innerHTML = '';

            sizes.forEach(size => {
                const canvas = createIcon(size);
                container.appendChild(canvas);
                downloadCanvas(canvas, `icon-${size}x${size}.png`);
            });

            // Badge icon (smaller, simpler)
            const badge = document.createElement('canvas');
            badge.width = 72;
            badge.height = 72;
            const bctx = badge.getContext('2d');
            bctx.fillStyle = '#66c0f4';
            bctx.beginPath();
            bctx.arc(36, 36, 30, 0, Math.PI * 2);
            bctx.fill();
            bctx.fillStyle = '#1b2838';
            bctx.font = 'bold 30px Arial';
            bctx.textAlign = 'center';
            bctx.textBaseline = 'middle';
            bctx.fillText('S', 36, 38);
            container.appendChild(badge);
            downloadCanvas(badge, 'badge-72x72.png');

            alert('Ícones gerados! Mova-os para a pasta icons/');
        }
    </script>
</body>
</html>
