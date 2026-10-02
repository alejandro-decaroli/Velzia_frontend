<div class="hero-container">
    <div class="hero-content">
        <span class="badge">Sencillo. Inteligente. Veloz.</span>
        <h1 class="hero-title">La herramienta que comprende <br/>tus necesidades financieras</h1>
        <p class="hero-subtitle">
            Velzia es una herramienta para registrar diversos movimientos financieros y entidades de un negocio pequeño, a fin de auditar los registros, hacer conciliación de cajas y extraer información valiosa para el dueño del negocio.
        </p>
        <div class="hero-actions">
            <a href="/login" class="btn-primary">Iniciar Sesión</a>
            <a href="/signup" class="btn-secondary">Registrar Cuenta Nueva</a>
        </div>
    </div>
    
    <div class="features-preview">
        <div class="feature-card">
            <div class="icon-wrap">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
            </div>
            <h4>Análisis & Métricas</h4>
            <p>Visualiza el rendimiento real del negocio con informes estructurados de ingresos y egresos.</p>
        </div>
        <div class="feature-card">
            <div class="icon-wrap">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h4>Multimoneda</h4>
            <p>Gestiona saldos en diferentes monedas con conversiones de tasas en tiempo real.</p>
        </div>
        <div class="feature-card">
            <div class="icon-wrap">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h.01M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"></path></svg>
            </div>
            <h4>Conciliación de Cajas</h4>
            <p>Audita las cajas del negocio al instante de forma automatizada y sin discrepancias.</p>
        </div>
    </div>
</div>

<style>
    .hero-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4rem;
        padding: 4rem 1rem;
        animation: fadeIn 0.5s ease-out;
    }

    .hero-content {
        max-width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .badge {
        background-color: var(--color-brand-glow);
        color: var(--color-brand);
        border: 1px solid rgba(99, 102, 241, 0.3);
        padding: 0.35rem 1rem;
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .hero-title {
        font-size: 3rem;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #ffffff 30%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    @media (min-width: 768px) {
        .hero-title {
            font-size: 4rem;
        }
    }

    .hero-subtitle {
        font-size: 1.2rem;
        color: var(--text-secondary);
        line-height: 1.6;
        max-width: 680px;
        font-weight: 500;
    }

    .hero-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
    }

    .btn-primary, .btn-secondary {
        padding: 0.85rem 2rem;
        border-radius: var(--radius-md);
        font-size: 1rem;
        font-weight: 700;
        text-decoration: none;
        transition: all var(--transition-normal);
    }

    .btn-primary {
        background-color: var(--color-brand);
        color: #ffffff;
        box-shadow: 0 4px 14px var(--color-brand-glow);
    }

    .btn-primary:hover {
        background-color: var(--color-brand-hover);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    }

    .btn-secondary {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--glass-border);
    }

    .btn-secondary:hover {
        background-color: var(--bg-tertiary);
        border-color: var(--glass-border-hover);
        transform: translateY(-2px);
    }

    .features-preview {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        width: 100%;
    }

    @media (min-width: 768px) {
        .features-preview {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .feature-card {
        background-color: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-normal);
    }

    .feature-card:hover {
        border-color: var(--glass-border-hover);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }

    .icon-wrap {
        background-color: var(--bg-tertiary);
        color: var(--color-brand);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .feature-card h4 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
    }

    .feature-card p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
    }
</style>
