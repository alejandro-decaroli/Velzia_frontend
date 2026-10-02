<script>
    import NavBar from "$lib/components/NavBar.svelte"
    import "../app.css";
</script>

<div class="app-layout">
    <header class="app-header">
        <NavBar />
    </header>

    <main class="app-main">
        <slot />
    </main>

    <footer class="app-footer">
        <div class="footer-content">
            <p class="copyright">&copy; 2026 Velzia. Todos los derechos reservados.</p>
            <p class="authors">Desarrollado por Alejandro Decaroli y Gonzalo Zinni</p>
            <span class="version">v1.1.0</span>
        </div>
    </footer>
</div>

<style>
    .app-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%);
    }

    .app-header {
        position: sticky;
        top: 0;
        height: 70px;
        width: 100%;
        background-color: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--glass-border);
        z-index: 100;
    }
    
    .app-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 2rem 1.5rem;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
    }

    .app-footer {
        width: 100%;
        background-color: rgba(15, 23, 42, 0.9);
        border-top: 1px solid var(--glass-border);
        padding: 2rem 1.5rem;
        text-align: center;
        margin-top: auto;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
    }

    .copyright {
        color: var(--text-primary);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .authors {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    .version {
        font-size: 0.75rem;
        color: var(--text-muted);
        background: var(--bg-tertiary);
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--glass-border);
    }
</style>
