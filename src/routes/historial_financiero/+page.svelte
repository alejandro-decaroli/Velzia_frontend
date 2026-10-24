<script lang="ts">
    import { onMount } from "svelte";
    import { checkUser, user } from "$lib/stores/auth";
    import GoBack from "$lib/components/goback.svelte";

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
        venta?: { id: number; cod?: string; total?: number } | null;
        costo?: { id: number; cod?: string; monto?: number; descripcion?: string } | null;
        pedido?: { id: number; cod?: string; total?: number } | null;
        referencia?: string;
    }

    let movimientos: MovimientoFinanciero[] = [];
    let loading = true;
    let error: string | null = null;
    let selectedMovimiento: MovimientoFinanciero | null = null;

    // Filters
    let tipoFiltro = "";
    let categoriaFiltro = "";
    let fechaFiltro = "";
    let searchBusqueda = "";

    async function cargarMovimientos() {
        loading = true;
        error = null;
        try {
            const params = new URLSearchParams();
            if (tipoFiltro) params.append("filtro", tipoFiltro);
            if (categoriaFiltro) params.append("categoria", categoriaFiltro);
            if (fechaFiltro) params.append("fecha", fechaFiltro);

            const response = await fetch(`${API_URL}/movimientos?${params.toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || errData.message || "Error al cargar movimientos financieros");
            }

            const data = await response.json();
            movimientos = data.movimientos || data.historial_financiero || (Array.isArray(data) ? data : []);
        } catch (err: any) {
            error = err.message || "Error de conexión al cargar movimientos";
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        const userData = await checkUser(error || "");
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
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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

    // Computed filtered list for text search
    $: filteredMovimientos = movimientos.filter((m) => {
        if (!searchBusqueda) return true;
        const q = searchBusqueda.toLowerCase();
        const cod = (m.cod || "").toLowerCase();
        const desc = (m.descripcion || "").toLowerCase();
        const cat = (m.categoria || "").toLowerCase();
        const caja = (m.nombre_caja || m.caja?.nombre || "").toLowerCase();
        const ref = (m.referencia || "").toLowerCase();
        return cod.includes(q) || desc.includes(q) || cat.includes(q) || caja.includes(q) || ref.includes(q);
    });

    // Computed KPIs
    $: totalIngresos = filteredMovimientos
        .filter(m => m.tipo === "Ingreso")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    $: totalEgresos = filteredMovimientos
        .filter(m => m.tipo === "Egreso")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    $: balanceNeto = totalIngresos - totalEgresos;
</script>

<div class="page-container">
    <div class="top-nav">
        <GoBack />
    </div>

    <main class="content-card">
        <!-- Header -->
        <div class="card-header">
            <div class="header-titles">
                <h1 class="page-title">Historial Financiero</h1>
                <p class="page-subtitle">Registro y auditoría de todos los movimientos financieros realizados hasta la fecha</p>
            </div>
            <button class="btn-primary refresh-btn" on:click={cargarMovimientos} title="Actualizar datos">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"></path>
                </svg>
                <span>Actualizar</span>
            </button>
        </div>

        <!-- Metric KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card ingresos">
                <div class="kpi-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-label">Total Ingresos (Cobros)</span>
                    <span class="kpi-value text-success">{formatMonto(totalIngresos)}</span>
                </div>
            </div>

            <div class="kpi-card egresos">
                <div class="kpi-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-label">Total Egresos (Pagos)</span>
                    <span class="kpi-value text-danger">{formatMonto(totalEgresos)}</span>
                </div>
            </div>

            <div class="kpi-card balance">
                <div class="kpi-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-label">Balance Neto</span>
                    <span class="kpi-value" class:text-success={balanceNeto >= 0} class:text-danger={balanceNeto < 0}>
                        {formatMonto(balanceNeto)}
                    </span>
                </div>
            </div>

            <div class="kpi-card total-count">
                <div class="kpi-icon">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-label">Total Movimientos</span>
                    <span class="kpi-value text-accent">{filteredMovimientos.length}</span>
                </div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="filter-group">
                <label for="tipo">Tipo de Movimiento</label>
                <select id="tipo" bind:value={tipoFiltro} on:change={cargarMovimientos}>
                    <option value="">Todos los Tipos</option>
                    <option value="Ingreso">Ingreso (Cobros)</option>
                    <option value="Egreso">Egreso (Pagos)</option>
                    <option value="Transferencia">Transferencia (Entre cajas)</option>
                </select>
            </div>

            <div class="filter-group">
                <label for="categoria">Categoría</label>
                <select id="categoria" bind:value={categoriaFiltro} on:change={cargarMovimientos}>
                    <option value="">Todas las Categorías</option>
                    <option value="venta">Ventas (Cobros)</option>
                    <option value="costo">Costos (Pagos)</option>
                    <option value="Impuesto">Impuesto</option>
                    <option value="servicio">Servicio</option>
                    <option value="pedido">Pedidos a Proveedores</option>
                    <option value="transferencia">Transferencias</option>
                    <option value="Ajuste">Ajustes de Caja</option>
                </select>
            </div>

            <div class="filter-group">
                <label for="fecha">Hasta la fecha</label>
                <input type="date" id="fecha" bind:value={fechaFiltro} on:change={cargarMovimientos} />
            </div>

            <div class="filter-group search-group">
                <label for="busqueda">Buscar</label>
                <input 
                    type="text" 
                    id="busqueda" 
                    placeholder="Código, descripción, caja..." 
                    bind:value={searchBusqueda}
                />
            </div>

            {#if fechaFiltro || tipoFiltro || categoriaFiltro || searchBusqueda}
                <button class="btn-clear" on:click={() => { tipoFiltro = ""; categoriaFiltro = ""; fechaFiltro = ""; searchBusqueda = ""; cargarMovimientos(); }}>
                    Limpiar filtros
                </button>
            {/if}
        </div>

        <!-- Table View -->
        <div class="table-container">
            {#if loading}
                <div class="state-container">
                    <div class="spinner"></div>
                    <p>Cargando movimientos financieros...</p>
                </div>
            {:else if error}
                <div class="state-container error">
                    <div class="error-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <p class="error-msg">{error}</p>
                    <button class="btn-primary" on:click={cargarMovimientos}>Reintentar</button>
                </div>
            {:else if filteredMovimientos.length === 0}
                <div class="state-container empty">
                    <div class="empty-icon">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <p>No se encontraron movimientos financieros con los filtros seleccionados.</p>
                </div>
            {:else}
                <div class="responsive-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Caja</th>
                                <th>Referencia / Origen</th>
                                <th class="actions-header">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each filteredMovimientos as item}
                                <tr>
                                    <td class="date-cell">
                                        {formatFecha(item.creadoEn)}
                                    </td>
                                    <td class="code-cell">
                                        <span class="code-badge">{item.cod || `MOV_${item.id}`}</span>
                                    </td>
                                    <td>
                                        <span class="badge" class:badge-ingreso={item.tipo === 'Ingreso'} class:badge-egreso={item.tipo === 'Egreso'} class:badge-transferencia={item.tipo === 'Transferencia'}>
                                             {#if item.tipo === 'Ingreso'}
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                                            {:else if item.tipo === 'Egreso'}
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                                            {:else}
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            {/if}
                                            {item.tipo}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="category-tag category-{item.categoria.toLowerCase()}">
                                            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                                        </span>
                                    </td>
                                    <td class="desc-cell">
                                        {item.descripcion}
                                    </td>
                                    <td class="amount-cell" class:amount-ingreso={item.tipo === 'Ingreso'} class:amount-egreso={item.tipo === 'Egreso'} class:amount-transferencia={item.tipo === 'Transferencia'}>
                                        {item.tipo === 'Ingreso' ? '+' : (item.tipo === 'Egreso' ? '-' : '')}{formatMonto(item.monto)}
                                    </td>
                                    <td>
                                        <span class="caja-badge">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                            {item.nombre_caja || item.caja?.nombre || '-'}
                                        </span>
                                    </td>
                                    <td class="ref-cell">
                                        {#if item.venta}
                                            <span class="ref-pill venta">{item.venta.cod || `Venta #${item.venta.id}`}</span>
                                        {:else if item.costo}
                                            <span class="ref-pill costo">{item.costo.cod || item.costo.descripcion || `Costo #${item.costo.id}`}</span>
                                        {:else if item.pedido}
                                            <span class="ref-pill pedido">{item.pedido.cod || `Pedido #${item.pedido.id}`}</span>
                                        {:else}
                                            <span class="ref-muted">{item.referencia || '-'}</span>
                                        {/if}
                                    </td>
                                    <td class="actions-cell">
                                        <button class="btn-detail" on:click={() => selectedMovimiento = item} title="Ver detalle completo del movimiento">
                                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            <span>Detalle</span>
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </main>

    {#if selectedMovimiento}
        <!-- Backdrop -->
        <div class="modal-backdrop" on:click={() => selectedMovimiento = null} role="presentation">
            <div class="modal-dialog" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div class="modal-header">
                    <div>
                        <span class="modal-pretitle">Entidad MovF</span>
                        <h2 id="modal-title" class="modal-title">
                            Movimiento #{selectedMovimiento.id}
                            {#if selectedMovimiento.cod}
                                <span class="code-badge">{selectedMovimiento.cod}</span>
                            {/if}
                        </h2>
                    </div>
                    <button class="modal-close" on:click={() => selectedMovimiento = null} aria-label="Cerrar modal">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Status highlight banner -->
                    <div class="modal-banner" class:banner-ingreso={selectedMovimiento.tipo === 'Ingreso'} class:banner-egreso={selectedMovimiento.tipo === 'Egreso'} class:banner-transferencia={selectedMovimiento.tipo === 'Transferencia'}>
                        <div class="banner-badge">
                            {selectedMovimiento.tipo}
                        </div>
                        <div class="banner-amount">
                            {selectedMovimiento.tipo === 'Ingreso' ? '+' : (selectedMovimiento.tipo === 'Egreso' ? '-' : '')}{formatMonto(selectedMovimiento.monto)}
                        </div>
                    </div>

                    <!-- Details grid -->
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Categoría</span>
                            <span class="detail-value text-capitalize">{selectedMovimiento.categoria}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Caja Afectada</span>
                            <span class="detail-value">{selectedMovimiento.nombre_caja || selectedMovimiento.caja?.nombre || '-'} (ID: {selectedMovimiento.caja?.id || '-'})</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha y Hora de Creación</span>
                            <span class="detail-value">{formatFecha(selectedMovimiento.creadoEn)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Última Actualización</span>
                            <span class="detail-value">{formatFecha(selectedMovimiento.actualizadoEn)}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="detail-label">Descripción</span>
                            <span class="detail-value">{selectedMovimiento.descripcion}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="detail-label">Referencia / Vínculo</span>
                            <div class="detail-relations">
                                {#if selectedMovimiento.costo}
                                    <div class="relation-card costo-relation">
                                        <span class="relation-tag">Costo Asociado</span>
                                        <p><strong>Código:</strong> {selectedMovimiento.costo.cod || '-'}</p>
                                        <p><strong>ID Costo:</strong> {selectedMovimiento.costo.id}</p>
                                        {#if selectedMovimiento.costo.descripcion}
                                            <p><strong>Descripción:</strong> {selectedMovimiento.costo.descripcion}</p>
                                        {/if}
                                    </div>
                                {:else if selectedMovimiento.venta}
                                    <div class="relation-card venta-relation">
                                        <span class="relation-tag">Venta Asociada</span>
                                        <p><strong>Código:</strong> {selectedMovimiento.venta.cod || '-'}</p>
                                        <p><strong>ID Venta:</strong> {selectedMovimiento.venta.id}</p>
                                    </div>
                                {:else if selectedMovimiento.pedido}
                                    <div class="relation-card pedido-relation">
                                        <span class="relation-tag">Pedido a Proveedor Asociado</span>
                                        <p><strong>Código:</strong> {selectedMovimiento.pedido.cod || '-'}</p>
                                        <p><strong>ID Pedido:</strong> {selectedMovimiento.pedido.id}</p>
                                    </div>
                                {:else}
                                    <span class="detail-value">{selectedMovimiento.referencia || '-'}</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-primary" on:click={() => selectedMovimiento = null}>Cerrar</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .page-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        animation: fadeIn 0.4s ease-out;
    }

    .top-nav {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .content-card {
        background-color: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    .card-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
        .card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }

    .page-title {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.25rem;
    }

    .page-subtitle {
        color: var(--text-secondary);
        font-size: 0.95rem;
        font-weight: 500;
    }

    .btn-primary {
        background-color: var(--color-brand);
        color: #ffffff;
        padding: 0.6rem 1.25rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 700;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px var(--color-brand-glow);
        transition: all var(--transition-normal);
    }

    .btn-primary:hover {
        background-color: var(--color-brand-hover);
        transform: translateY(-2px);
    }

    /* KPI Grid */
    .kpi-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    @media (min-width: 640px) {
        .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (min-width: 1024px) {
        .kpi-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .kpi-card {
        background-color: rgba(30, 41, 66, 0.45);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
    }

    .kpi-card:hover {
        border-color: var(--glass-border-hover);
        transform: translateY(-2px);
    }

    .kpi-icon {
        padding: 0.75rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .kpi-card.ingresos .kpi-icon {
        background-color: var(--color-success-glow);
        color: var(--color-success);
    }

    .kpi-card.egresos .kpi-icon {
        background-color: var(--color-error-glow);
        color: var(--color-error);
    }

    .kpi-card.balance .kpi-icon {
        background-color: var(--color-brand-glow);
        color: var(--color-brand);
    }

    .kpi-card.total-count .kpi-icon {
        background-color: rgba(148, 163, 184, 0.15);
        color: var(--text-primary);
    }

    .kpi-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .kpi-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        font-weight: 700;
    }

    .kpi-value {
        font-size: 1.35rem;
        font-weight: 800;
    }

    .text-success { color: var(--color-success); }
    .text-danger { color: var(--color-error); }
    .text-accent { color: var(--color-brand); }

    /* Filter Bar */
    .filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1rem;
        background-color: rgba(15, 23, 42, 0.4);
        padding: 1.25rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .filter-group label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
    }

    .filter-group input, .filter-group select {
        padding: 0.55rem 0.85rem;
        font-size: 0.9rem;
        min-width: 160px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        border-radius: var(--radius-sm);
    }

    .search-group {
        flex: 1;
        min-width: 200px;
    }

    .search-group input {
        width: 100%;
    }

    .btn-clear {
        background: transparent;
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        padding: 0.55rem 0.9rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        align-self: flex-end;
        transition: all var(--transition-fast);
    }

    .btn-clear:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }

    /* Table Container */
    .table-container {
        width: 100%;
        background-color: rgba(30, 41, 66, 0.4);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .responsive-table {
        width: 100%;
        overflow-x: auto;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.925rem;
    }

    .table th {
        background-color: rgba(19, 27, 46, 0.8);
        padding: 1rem 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--glass-border);
        white-space: nowrap;
    }

    .table td {
        padding: 0.9rem 1.25rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--glass-border);
        vertical-align: middle;
        font-weight: 500;
    }

    .table tbody tr {
        transition: background-color var(--transition-fast);
    }

    .table tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.03);
    }

    .date-cell {
        white-space: nowrap;
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .code-badge {
        font-family: monospace;
        font-weight: 700;
        font-size: 0.85rem;
        background-color: var(--bg-tertiary);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.2rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .badge-ingreso {
        background-color: var(--color-success-glow);
        color: var(--color-success);
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-egreso {
        background-color: var(--color-error-glow);
        color: var(--color-error);
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge-transferencia {
        background-color: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.35);
    }

    .category-tag {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        border: 1px solid var(--glass-border);
    }

    .category-venta {
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.3);
    }

    .category-costo {
        color: #fb923c;
        border-color: rgba(251, 146, 60, 0.3);
    }

    .category-impuesto {
        color: #f87171;
        border-color: rgba(248, 113, 113, 0.3);
    }

    .category-servicio {
        color: #34d399;
        border-color: rgba(52, 211, 153, 0.3);
    }

    .category-pedido {
        color: #c084fc;
        border-color: rgba(192, 132, 252, 0.3);
    }

    .category-transferencia {
        color: #818cf8;
        border-color: rgba(129, 140, 248, 0.3);
    }

    .category-ajuste {
        color: #facc15;
        border-color: rgba(250, 204, 21, 0.3);
    }

    .desc-cell {
        max-width: 280px;
        word-break: break-word;
    }

    .amount-cell {
        font-weight: 800;
        font-size: 1rem;
        white-space: nowrap;
    }

    .amount-ingreso {
        color: var(--color-success);
    }

    .amount-egreso {
        color: var(--color-error);
    }

    .amount-transferencia {
        color: #818cf8;
    }

    .caja-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: var(--text-primary);
    }

    .ref-pill {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
    }

    .ref-pill.venta {
        background-color: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
    }

    .ref-pill.costo {
        background-color: rgba(251, 146, 60, 0.15);
        color: #fb923c;
    }

    .ref-pill.pedido {
        background-color: rgba(192, 132, 252, 0.15);
        color: #c084fc;
    }

    .ref-muted {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    /* States */
    .state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        gap: 1rem;
        color: var(--text-secondary);
    }

    .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(99, 102, 241, 0.15);
        border-top-color: var(--color-brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .error-icon {
        color: var(--color-error);
        background-color: var(--color-error-glow);
        padding: 0.75rem;
        border-radius: 50%;
    }

    .empty-icon {
        color: var(--text-muted);
        background-color: rgba(255, 255, 255, 0.05);
        padding: 0.75rem;
        border-radius: 50%;
    }

    .error-msg {
        color: var(--color-error);
        font-size: 0.95rem;
    }

    /* Actions & Detail Button */
    .actions-header {
        text-align: right;
        width: 100px;
    }

    .actions-cell {
        text-align: right;
    }

    .btn-detail {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .btn-detail:hover {
        background-color: var(--color-brand);
        color: #ffffff;
        border-color: var(--color-brand);
        box-shadow: 0 2px 8px var(--color-brand-glow);
    }

    /* Modal Styles */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
        background-color: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 600px;
        box-shadow: var(--shadow-xl);
        overflow: hidden;
        animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5rem;
        border-bottom: 1px solid var(--glass-border);
    }

    .modal-pretitle {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-brand);
        display: block;
        margin-bottom: 0.25rem;
    }

    .modal-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .modal-close {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast);
    }

    .modal-close:hover {
        color: #ffffff;
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .modal-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
    }

    .banner-ingreso {
        background-color: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.25);
    }

    .banner-egreso {
        background-color: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.25);
    }

    .banner-transferencia {
        background-color: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.3);
    }

    .banner-badge {
        font-weight: 800;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .banner-ingreso .banner-badge { color: var(--color-success); }
    .banner-egreso .banner-badge { color: var(--color-error); }
    .banner-transferencia .banner-badge { color: #818cf8; }

    .banner-amount {
        font-size: 1.5rem;
        font-weight: 800;
    }

    .banner-ingreso .banner-amount { color: var(--color-success); }
    .banner-egreso .banner-amount { color: var(--color-error); }
    .banner-transferencia .banner-amount { color: #818cf8; }

    .details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    @media (min-width: 600px) {
        .details-grid {
            grid-template-columns: 1fr 1fr;
        }
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        background-color: rgba(15, 23, 42, 0.4);
        padding: 0.85rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--glass-border);
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
    }

    .detail-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
    }

    .detail-value {
        font-size: 0.95rem;
        color: var(--text-primary);
        font-weight: 500;
        word-break: break-word;
    }

    .text-capitalize {
        text-transform: capitalize;
    }

    .detail-relations {
        margin-top: 0.25rem;
    }

    .relation-card {
        padding: 0.85rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--glass-border);
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.9rem;
    }

    .costo-relation {
        background-color: rgba(251, 146, 60, 0.1);
        border-color: rgba(251, 146, 60, 0.3);
    }

    .venta-relation {
        background-color: rgba(56, 189, 248, 0.1);
        border-color: rgba(56, 189, 248, 0.3);
    }

    .pedido-relation {
        background-color: rgba(192, 132, 252, 0.1);
        border-color: rgba(192, 132, 252, 0.3);
    }

    .relation-tag {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-primary);
    }

    .modal-footer {
        padding: 1.25rem 1.5rem;
        border-top: 1px solid var(--glass-border);
        display: flex;
        justify-content: flex-end;
    }
</style>
