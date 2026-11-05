<script lang="ts">
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte";
    import { checkUser, user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';
    import { fetchEntity } from '$lib/utils/api.js';

    let error: string | null = null;
    let loading = true;
    let stats = {
        totalVentas: 0,
        porCobrar: 0,
        porPagar: 0
    };

    const reportModules = [
        {
            title: "Reporte de Ventas",
            path: "/reportes/ventas",
            tag: "Comercial & Facturación",
            theme: "indigo",
            desc: "Análisis integral de facturación, efectividad de cobranzas, ticket promedio, rentabilidad y ranking de productos más vendidos.",
            icon: `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>`,
            highlights: ["Facturación mensual", "Ranking de productos", "Ticket promedio", "Margen estimado"]
        },
        {
            title: "Cuentas por Cobrar",
            path: "/reportes/cuentas_cobrar",
            tag: "Créditos & Clientes",
            theme: "emerald",
            desc: "Detalle de ventas con cobro pendiente, cartera vencida y seguimiento de deudas pendientes por cliente.",
            icon: `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
            highlights: ["Cobros pendientes", "Saldos exigibles", "Antigüedad de deuda"]
        },
        {
            title: "Cuentas por Pagar",
            path: "/reportes/cuentas_pagar",
            tag: "Proveedores & Compras",
            theme: "amber",
            desc: "Control de compromisos comerciales asumidos con proveedores y órdenes de compra con saldo a abonar.",
            icon: `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`,
            highlights: ["Obligaciones pendientes", "Proveedores a liquidar", "Vencimientos"]
        },
        {
            title: "Proyección Financiera",
            path: "/reportes/proyeccion",
            tag: "Flujo & Planificación",
            theme: "purple",
            desc: "Simulación dinámica de liquidez y balance proyectado contrastando flujos esperados de cobros contra pagos.",
            icon: `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
            highlights: ["Flujo neto estimado", "Superávit / Déficit", "Balance comercial"]
        }
    ];

    onMount(async () => {
        try {
            const userData = await checkUser(error);
            if (userData) {
                user.set(userData);
            }
            // Carga ligera en paralelo para stats de resumen
            const [resVentas, resCuentasCobrar, resPedidos] = await Promise.all([
                fetchEntity("ventas", [], false, null, "", ""),
                fetchEntity("ventas", [], false, null, "Pendiente", ""),
                fetchEntity("pedidos", [], false, null, "Pendiente", "")
            ]);

            const ventas = resVentas.entities || [];
            stats.totalVentas = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
            
            const pendientesCobro = resCuentasCobrar.entities || [];
            stats.porCobrar = pendientesCobro.reduce((acc, v) => acc + (Number(v.total || 0) - Number(v.total_pagado || 0)), 0);

            const pedidosPendientes = resPedidos.entities || [];
            stats.porPagar = pedidosPendientes.reduce((acc, p) => acc + Number(p.total || 0), 0);
        } catch (e: any) {
            console.error("Error al cargar resumen:", e);
        } finally {
            loading = false;
        }
    });

    function formatCurrency(val: number): string {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }).format(val || 0);
    }
</script>

<div class="reports-hub-wrapper">
    <!-- Header bar with Navigation -->
    <div class="top-nav">
        <GoBack route="/dashboard" />
        <span class="hub-tag">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            Business Intelligence
        </span>
    </div>

    <!-- Hero Header -->
    <header class="hub-header">
        <div class="header-titles">
            <h1>Centro de Reportes</h1>
            <p>Monitoree la salud financiera de su empresa con análisis comerciales, cartera de cobros y proyecciones de liquidez.</p>
        </div>

        {#if !loading}
            <div class="quick-kpi-bar">
                <div class="kpi-mini">
                    <span class="kpi-mini-label">Facturado este mes</span>
                    <span class="kpi-mini-val text-brand">{formatCurrency(stats.totalVentas)}</span>
                </div>
                <div class="kpi-divider"></div>
                <div class="kpi-mini">
                    <span class="kpi-mini-label">Pendiente de cobro</span>
                    <span class="kpi-mini-val text-emerald">{formatCurrency(stats.porCobrar)}</span>
                </div>
                <div class="kpi-divider"></div>
                <div class="kpi-mini">
                    <span class="kpi-mini-label">Obligaciones a pagar</span>
                    <span class="kpi-mini-val text-amber">{formatCurrency(stats.porPagar)}</span>
                </div>
            </div>
        {/if}
    </header>

    <!-- Reports Grid -->
    <div class="reports-grid">
        {#each reportModules as item}
            <button 
                class="report-card {item.theme}"
                on:click={() => goto(item.path)}
                aria-label={item.title}
            >
                <div class="card-glow"></div>
                <div class="card-top">
                    <div class="icon-bubble {item.theme}">
                        {@html item.icon}
                    </div>
                    <span class="module-tag">{item.tag}</span>
                </div>

                <div class="card-body">
                    <h3>{item.title}</h3>
                    <p class="card-desc">{item.desc}</p>
                </div>

                <div class="card-highlights">
                    {#each item.highlights as tag}
                        <span class="highlight-chip">{tag}</span>
                    {/each}
                </div>

                <div class="card-footer">
                    <span class="explore-btn">
                        Ver informe completo
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                </div>
            </button>
        {/each}
    </div>
</div>

<style>
    .reports-hub-wrapper {
        width: 100%;
        max-width: 1300px;
        margin: 0 auto;
        padding: 2rem 1.5rem 4rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        min-height: calc(100vh - 4rem);
    }

    .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .hub-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-brand);
        background: var(--color-brand-glow);
        border: 1px solid rgba(99, 102, 241, 0.25);
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
    }

    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.45) 0%, rgba(19, 27, 46, 0.75) 100%);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2.25rem;
        box-shadow: var(--shadow-md);
        backdrop-filter: blur(12px);
    }

    .header-titles h1 {
        font-size: 2.25rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
    }

    .header-titles p {
        color: var(--text-secondary);
        font-size: 1.05rem;
        max-width: 650px;
        line-height: 1.6;
    }

    .quick-kpi-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--glass-border);
    }

    .kpi-mini {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .kpi-mini-label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
        font-weight: 600;
    }

    .kpi-mini-val {
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: -0.02em;
    }

    .text-brand { color: #818cf8; }
    .text-emerald { color: #34d399; }
    .text-amber { color: #fbbf24; }

    .kpi-divider {
        width: 1px;
        height: 35px;
        background: var(--glass-border);
    }

    .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .report-card {
        position: relative;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1.25rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        backdrop-filter: blur(8px);
        box-shadow: var(--shadow-sm);
    }

    .report-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--glass-border-hover);
        background: rgba(30, 41, 66, 0.65);
    }

    .card-glow {
        position: absolute;
        top: -60px;
        right: -60px;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        opacity: 0.12;
        filter: blur(40px);
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    .report-card.indigo .card-glow { background: #6366f1; }
    .report-card.emerald .card-glow { background: #10b981; }
    .report-card.amber .card-glow { background: #f59e0b; }
    .report-card.purple .card-glow { background: #a855f7; }

    .report-card:hover .card-glow {
        opacity: 0.25;
    }

    .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .icon-bubble {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: transform 0.2s ease;
    }

    .report-card:hover .icon-bubble {
        transform: scale(1.08);
    }

    .icon-bubble.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .icon-bubble.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .icon-bubble.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .icon-bubble.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .module-tag {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--text-muted);
    }

    .card-body h3 {
        font-size: 1.35rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }

    .card-desc {
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.55;
    }

    .card-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .highlight-chip {
        font-size: 0.75rem;
        color: var(--text-secondary);
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.04);
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-sm);
    }

    .card-footer {
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .explore-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #ffffff;
        transition: gap 0.2s ease, color 0.2s ease;
    }

    .report-card.indigo:hover .explore-btn { color: #818cf8; }
    .report-card.emerald:hover .explore-btn { color: #34d399; }
    .report-card.amber:hover .explore-btn { color: #fbbf24; }
    .report-card.purple:hover .explore-btn { color: #c084fc; }

    .report-card:hover .explore-btn {
        gap: 0.8rem;
    }

    @media (max-width: 768px) {
        .reports-hub-wrapper {
            padding: 1rem;
        }

        .hub-header {
            padding: 1.5rem;
        }

        .header-titles h1 {
            font-size: 1.75rem;
        }

        .kpi-divider {
            display: none;
        }

        .quick-kpi-bar {
            gap: 1rem;
        }
    }
</style>
