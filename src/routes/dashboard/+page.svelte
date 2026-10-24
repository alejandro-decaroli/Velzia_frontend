<script lang="ts">
    import { user, checkUser } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    interface MovimientoFinanciero {
        id: number;
        cod?: string;
        tipo: 'Ingreso' | 'Egreso' | 'Transferencia';
        categoria: string;
        descripcion: string;
        monto: number;
        creadoEn: string;
        actualizadoEn?: string;
        caja?: { id: number; nombre: string; cod?: string } | null;
        nombre_caja?: string;
        venta?: { id: number; cod?: string } | null;
        costo?: { id: number; cod?: string; descripcion?: string } | null;
        pedido?: { id: number; cod?: string } | null;
        referencia?: string;
    }

    let error = "";
    let movimientos: MovimientoFinanciero[] = [];
    let loadingMovs = true;

    async function cargarMovimientos() {
        loadingMovs = true;
        try {
            const response = await fetch(`${API_URL}/movimientos`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                movimientos = data.movimientos || data.historial_financiero || (Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Error al cargar movimientos en dashboard", e);
        } finally {
            loadingMovs = false;
        }
    }

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        await cargarMovimientos();
    });

    function formatFecha(fechaStr?: string): string {
        if (!fechaStr) return "-";
        const d = new Date(fechaStr);
        return isNaN(d.getTime()) ? fechaStr : d.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function formatMonto(monto: number): string {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(monto || 0);
    }

    $: totalIngresos = movimientos
        .filter(m => m.tipo === "Ingreso")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    $: totalEgresos = movimientos
        .filter(m => m.tipo === "Egreso")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    $: balanceNeto = totalIngresos - totalEgresos;
    $: ultimosMovimientos = movimientos.slice(0, 5);

    const modules = [
        { name: "Clientes", path: "/clientes", desc: "Gestión de clientes y datos de contacto", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
        { name: "Cajas", path: "/cajas", desc: "Conciliación de cajas y flujo de efectivo", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { name: "Ventas", path: "/ventas", desc: "Registro y seguimiento de ventas realizadas", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
        { name: "Detalles de venta", path: "/detalles", desc: "Glosa e ítems individuales facturados", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { name: "Costos", path: "/costos", desc: "Gestión de costos y egresos operativos", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { name: "Historial Financiero", path: "/historial_financiero", desc: "Registro de movimientos: transferencias, pagos, cobros y ajustes", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        { name: "Productos", path: "/productos", desc: "Lista de productos y servicios", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
        { name: "Proveedores", path: "/proveedores", desc: "Gestión de proveedores comerciales", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        { name: "Pedidos", path: "/pedidos", desc: "Órdenes de compra y pedidos a proveedores", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { name: "Líneas de pedido", path: "/lineas_pedidos", desc: "Ítems y detalles de pedidos a proveedores", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { name: "Reportes", path: "/reportes", desc: "Métricas de rendimiento e inteligencia comercial", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" }
    ];
</script>

<div class="dashboard-wrapper">
    <div class="welcome-header">
        <h1>Hola {$user?.nombre || ''} {$user?.apellido || ''}</h1>
        <p>Bienvenido/a a tu panel de control de Velzia ERP. Selecciona un módulo para gestionar tu negocio.</p>
    </div>

    <div class="modules-grid">
        {#each modules as mod}
            <button class="module-card" on:click={() => goto(mod.path)} aria-label={mod.name}>
                <div class="card-glow"></div>
                <div class="icon-wrapper">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mod.icon}></path>
                    </svg>
                </div>
                <div class="card-info">
                    <h3>{mod.name}</h3>
                    <p>{mod.desc}</p>
                </div>
                <div class="arrow-indicator">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </button>
        {/each}
    </div>

    <!-- Financial Overview & Recent Movements Section -->
    <section class="financial-overview-card">
        <div class="section-header">
            <div>
                <span class="section-badge">Auditoría en tiempo real</span>
                <h2>Historial Financiero</h2>
                <p>Resumen de movimientos realizados hasta la fecha: cobros, pagos, transferencias y ajustes.</p>
            </div>
            <a href="/historial_financiero" class="btn-all-movs">
                <span>Ver historial completo</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        </div>

        <div class="kpi-mini-grid">
            <div class="kpi-mini ingresos">
                <span class="kpi-mini-label">Total Ingresos</span>
                <span class="kpi-mini-val text-success">{formatMonto(totalIngresos)}</span>
            </div>
            <div class="kpi-mini egresos">
                <span class="kpi-mini-label">Total Egresos</span>
                <span class="kpi-mini-val text-danger">{formatMonto(totalEgresos)}</span>
            </div>
            <div class="kpi-mini balance">
                <span class="kpi-mini-label">Balance Neto</span>
                <span class="kpi-mini-val" class:text-success={balanceNeto >= 0} class:text-danger={balanceNeto < 0}>{formatMonto(balanceNeto)}</span>
            </div>
            <div class="kpi-mini total">
                <span class="kpi-mini-label">Total Movimientos</span>
                <span class="kpi-mini-val text-accent">{movimientos.length}</span>
            </div>
        </div>

        <div class="recent-table-wrap">
            {#if loadingMovs}
                <div class="table-state">
                    <div class="mini-spinner"></div>
                    <span>Cargando movimientos financieros...</span>
                </div>
            {:else if ultimosMovimientos.length === 0}
                <div class="table-state empty">
                    <p>No hay movimientos financieros registrados hasta el momento.</p>
                </div>
            {:else}
                <div class="table-scroll">
                    <table class="recent-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Caja</th>
                                <th>Referencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each ultimosMovimientos as m}
                                <tr>
                                    <td class="date-col">{formatFecha(m.creadoEn)}</td>
                                    <td class="code-col"><span class="code-tag">{m.cod || `MOV_${m.id}`}</span></td>
                                    <td>
                                        <span class="pill" class:pill-ingreso={m.tipo === 'Ingreso'} class:pill-egreso={m.tipo === 'Egreso'} class:pill-transferencia={m.tipo === 'Transferencia'}>
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td><span class="cat-tag">{m.categoria}</span></td>
                                    <td class="desc-col">{m.descripcion}</td>
                                    <td class="amount-col" class:text-success={m.tipo === 'Ingreso'} class:text-danger={m.tipo === 'Egreso'} class:text-accent={m.tipo === 'Transferencia'}>
                                        {m.tipo === 'Ingreso' ? '+' : (m.tipo === 'Egreso' ? '-' : '')}{formatMonto(m.monto)}
                                    </td>
                                    <td>{m.nombre_caja || m.caja?.nombre || '-'}</td>
                                    <td>
                                        {#if m.costo}
                                            <span class="ref-link costo">{m.costo.cod || `Costo #${m.costo.id}`}</span>
                                        {:else if m.venta}
                                            <span class="ref-link venta">{m.venta.cod || `Venta #${m.venta.id}`}</span>
                                        {:else if m.pedido}
                                            <span class="ref-link pedido">{m.pedido.cod || `Pedido #${m.pedido.id}`}</span>
                                        {:else}
                                            <span class="ref-link muted">{m.referencia || '-'}</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </section>
</div>

<style>
    .dashboard-wrapper {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        animation: fadeIn 0.4s ease-out;
    }

    .welcome-header {
        text-align: left;
    }

    .welcome-header h1 {
        font-size: 2.25rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .welcome-header p {
        color: var(--text-secondary);
        font-size: 1.1rem;
        max-width: 700px;
        font-weight: 500;
    }

    .modules-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    @media (min-width: 640px) {
        .modules-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (min-width: 1024px) {
        .modules-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .module-card {
        background-color: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        text-align: left;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-normal);
        width: 100%;
        cursor: pointer;
    }

    .module-card:hover {
        transform: translateY(-4px);
        border-color: var(--color-brand);
        box-shadow: 0 12px 30px var(--color-brand-glow);
    }

    .module-card:hover .icon-wrapper {
        background-color: var(--color-brand);
        color: #ffffff;
        box-shadow: 0 0 16px var(--color-brand-glow);
    }

    .module-card:hover .arrow-indicator {
        transform: translateX(4px);
        color: #ffffff;
    }

    .card-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 100% 0%, var(--color-brand-glow) 0%, transparent 60%);
        opacity: 0;
        transition: opacity var(--transition-normal);
        pointer-events: none;
    }

    .module-card:hover .card-glow {
        opacity: 1;
    }

    .icon-wrapper {
        background-color: var(--bg-tertiary);
        color: var(--color-brand);
        padding: 0.85rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-normal);
    }

    .card-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-right: 1.5rem;
    }

    .card-info h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #ffffff;
    }

    .card-info p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    .arrow-indicator {
        align-self: center;
        color: var(--text-muted);
        transition: all var(--transition-normal);
    }

    /* Financial Overview Section */
    .financial-overview-card {
        background-color: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        box-shadow: var(--shadow-sm);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    .section-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: space-between;
    }

    @media (min-width: 768px) {
        .section-header {
            flex-direction: row;
            align-items: center;
        }
    }

    .section-badge {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-brand);
        display: block;
        margin-bottom: 0.25rem;
    }

    .section-header h2 {
        font-size: 1.6rem;
        font-weight: 800;
        color: #ffffff;
    }

    .section-header p {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .btn-all-movs {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: rgba(99, 102, 241, 0.15);
        color: #ffffff;
        border: 1px solid rgba(99, 102, 241, 0.3);
        padding: 0.6rem 1.1rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none;
        transition: all var(--transition-fast);
        align-self: flex-start;
    }

    @media (min-width: 768px) {
        .btn-all-movs {
            align-self: center;
        }
    }

    .btn-all-movs:hover {
        background-color: var(--color-brand);
        border-color: var(--color-brand);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--color-brand-glow);
    }

    .kpi-mini-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    @media (min-width: 1024px) {
        .kpi-mini-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .kpi-mini {
        background-color: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .kpi-mini-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
    }

    .kpi-mini-val {
        font-size: 1.25rem;
        font-weight: 800;
    }

    .text-success { color: var(--color-success); }
    .text-danger { color: var(--color-error); }
    .text-accent { color: var(--color-brand); }

    .recent-table-wrap {
        background-color: rgba(15, 23, 42, 0.4);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .table-scroll {
        width: 100%;
        overflow-x: auto;
    }

    .recent-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        text-align: left;
    }

    .recent-table th {
        background-color: rgba(19, 27, 46, 0.8);
        padding: 0.85rem 1rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--glass-border);
        white-space: nowrap;
    }

    .recent-table td {
        padding: 0.85rem 1rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--glass-border);
        white-space: nowrap;
    }

    .recent-table tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.02);
    }

    .date-col {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    .code-tag {
        font-family: monospace;
        font-weight: 700;
        font-size: 0.8rem;
        background-color: var(--bg-tertiary);
        padding: 0.15rem 0.4rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--glass-border);
    }

    .pill {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .pill-ingreso {
        background-color: var(--color-success-glow);
        color: var(--color-success);
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .pill-egreso {
        background-color: var(--color-error-glow);
        color: var(--color-error);
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .pill-transferencia {
        background-color: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .cat-tag {
        text-transform: capitalize;
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    .desc-col {
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .amount-col {
        font-weight: 700;
        font-size: 0.95rem;
    }

    .ref-link {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.15rem 0.4rem;
        border-radius: var(--radius-sm);
    }

    .ref-link.costo {
        background-color: rgba(251, 146, 60, 0.15);
        color: #fb923c;
    }

    .ref-link.venta {
        background-color: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
    }

    .ref-link.pedido {
        background-color: rgba(192, 132, 252, 0.15);
        color: #c084fc;
    }

    .ref-link.muted {
        color: var(--text-muted);
    }

    .table-state {
        padding: 2.5rem;
        text-align: center;
        color: var(--text-secondary);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .mini-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(99, 102, 241, 0.2);
        border-top-color: var(--color-brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>