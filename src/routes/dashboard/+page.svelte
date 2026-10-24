<script lang="ts">
    import { user, checkUser } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";

    let error = "";

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
    });

    const modules = [
        { name: "Clientes", path: "/clientes", desc: "Gestión de clientes y datos de contacto", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
        { name: "Cajas", path: "/cajas", desc: "Conciliación de cajas y flujo de efectivo", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { name: "Ventas", path: "/ventas", desc: "Registro y seguimiento de ventas realizadas", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
        { name: "Detalles de venta", path: "/detalles", desc: "Glosa e ítems individuales facturados", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { name: "Costos", path: "/costos", desc: "Gestión de costos y egresos operativos", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { name: "Pagos", path: "/pagos", desc: "Transacciones asociadas y registros de pago", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
        { name: "Transferencias", path: "/transferencias", desc: "Movimiento de saldos entre cajas", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
        { name: "Ajustes de saldo", path: "/ajustes", desc: "Ajustes manuales por balance de caja", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
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
</style>