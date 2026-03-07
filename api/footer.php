    </main>
    <footer class="glass-card" style="margin: 4rem auto 2rem; width: 95%; max-width: 1400px; padding: 3rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem;">
        <div class="footer-col">
            <h3 style="margin-bottom: 1rem; color: var(--primary);">SAE.</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Your Ultimate Steam Achievement Experience. Track, compare and conquer your games with premium insights.</p>
        </div>
        <div class="footer-col">
            <h4 style="margin-bottom: 1rem; color: var(--text-main);">Links Úteis</h4>
            <ul style="list-style: none; color: var(--text-muted); font-size: 0.9rem; line-height: 2;">
                <li><a href="index.php" style="color: inherit; text-decoration: none;">Início</a></li>
                <li><a href="hardware_check.php" style="color: inherit; text-decoration: none;">Hardware Lab</a></li>
                <li><a href="compare.php" style="color: inherit; text-decoration: none;">Comparador</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4 style="margin-bottom: 1rem; color: var(--text-main);">Tecnologias</h4>
            <div style="display: flex; gap: 1rem; font-size: 1.5rem; color: var(--text-muted);">
                <i class="fab fa-php"></i>
                <i class="fab fa-js"></i>
                <i class="fas fa-database"></i>
                <i class="fab fa-steam"></i>
            </div>
        </div>
        <div style="grid-column: 1 / -1; border-top: 1px solid var(--glass-border); padding-top: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            &copy; <?= date('Y') ?> SAE Premium. Todos os direitos reservados. Made with <i class="fas fa-heart" style="color: #ef4444;"></i> for Gamers.
        </div>
    </footer>

    <!-- Scripts Globais -->
    <script src="languages.js"></script>
    <script>
        // Lógica Global de UI
        document.addEventListener('DOMContentLoaded', () => {
            console.log('SAE Premium Core Loaded');
        });
    </script>
</body>
</html>
