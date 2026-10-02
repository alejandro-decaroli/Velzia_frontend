<script lang="ts">
    import { fetchEntity } from "$lib/utils/api.js";
    import { shouldExclude } from "$lib/utils/entityConfig";

    export let acciones = true;
    export let entity = "";
    export let loading = true;
    export let error: string | null = null;
    export let entities: any[] = [];
    
    function handleUpdate() {
        window.location.reload();
    }

    function handleDate(date: string) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    }

    function formatHeader(key: string) {
        // CamelCase split to spaces
        const display = key.split(/(?=[A-Z])/).join(' ');
        return display.charAt(0).toUpperCase() + display.slice(1);
    }
</script>

<div class="table-container">
    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
        </div>
    {:else if error}
        <div class="error-state">
            <div class="error-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p class="error-message">{error}</p>
            <button on:click={handleUpdate} class="retry-btn">Reintentar</button>
        </div>
    {:else}
        <div class="responsive-table">
            <table class="table">
                <thead>
                    <tr>
                        {#if entities.length > 0}
                            {#each Object.keys(entities[0]).filter(key => !shouldExclude(key)) as key}
                                <th>{formatHeader(key)}</th>
                            {/each}
                            {#if entity === "costos_fijos" || entity === "cajas" || entity === "ventas" || entity === "pagos"}
                                <th>Moneda</th>
                            {/if}
                            {#if entity === "ventas"}
                                <th>Cliente</th>
                            {/if}
                            {#if entity === "pagos"}
                                <th>Caja</th>
                                <th>Código Venta/Costo</th>
                            {/if}
                            {#if entity === "tasas"}
                                <th>Moneda Origen</th>
                                <th>Moneda Destino</th>
                            {/if}
                            {#if entity === "transferencias"}
                                <th>Caja Origen</th>
                                <th>Caja Destino</th>
                            {/if}
                            {#if entity === "ajustes"}
                                <th>Caja</th>
                            {/if}
                            {#if entity === "detalles"}
                                <th>Cod de Venta</th>
                            {/if}
                            {#if acciones}
                                <th class="actions-header">Acciones</th>
                            {/if}
                        {:else}
                            <th>No hay datos disponibles</th>
                        {/if}
                    </tr>
                </thead>
                <tbody>
                    {#each entities as element}
                        {@const item = element?.item ?? element ?? {}}
                        <tr>
                            {#each Object.entries(item).filter(([key]) => !shouldExclude(key)) as [key, value]}
                                <td>
                                    {#if key === "creadoEn" || key === "actualizadoEn" || key === "eliminadoEn"}
                                        {handleDate(value as string)}
                                    {:else if key === "producto"}
                                        {(value as any).nombre}
                                    {:else if key === "estado" || key === "movimiento"}
                                        <span class="badge" class:badge-success={value === "Paga" || value === "Pagada" || value === "ingreso"} class:badge-warning={value === "Pendiente" || value === "egreso"}>
                                            {value}
                                        </span>
                                    {:else}
                                        {value}
                                    {/if}
                                </td>
                            {/each}
                            {#if entity === "costos_fijos" || entity === "cajas" || entity === "ventas"}
                                <td>{item.moneda?.codigo_iso || '-'}</td>
                            {/if}
                            {#if entity === "pagos"}
                                <td>{item.caja?.moneda?.codigo_iso || '-'}</td>
                            {/if}
                            {#if entity === "ventas"}
                                <td>{item.cliente ? `${item.cliente.nombre} ${item.cliente.apellido}` : '-'}</td>
                            {/if}
                            {#if entity === "pagos"}
                                <td>{item.caja?.nombre || '-'}</td>
                                <td>
                                    {#if item.venta}
                                        {item.venta.cod} (Venta)
                                    {:else if item.costo_fijo}
                                        {item.costo_fijo.cod} (Costo Fijo)
                                    {:else}
                                        -
                                    {/if}
                                </td>
                            {/if}
                            {#if entity === "tasas"}
                                <td>{item.moneda_origen?.codigo_iso || '-'}</td>
                                <td>{item.moneda_destino?.codigo_iso || '-'}</td>
                            {/if}
                            {#if entity === "transferencias"}
                                <td>{item.caja_origen?.nombre || '-'}</td>
                                <td>{item.caja_destino?.nombre || '-'}</td>
                            {/if}
                            {#if entity === "ajustes"}
                                <td>{item.caja?.nombre || '-'}</td>
                            {/if}
                            {#if entity === "detalles"}
                                <td>{item.venta?.cod || '-'}</td>
                            {/if}
                            {#if acciones}
                                <td class="actions-cell">
                                    <div class="actions-wrapper">
                                        <slot name="actions" {item} />
                                    </div>
                                </td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
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
    }

    .table td {
        padding: 1rem 1.25rem;
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

    .actions-header {
        text-align: center;
    }

    .actions-cell {
        text-align: center;
    }

    .actions-wrapper {
        display: inline-flex;
        gap: 0.5rem;
        justify-content: center;
        align-items: center;
    }

    /* Badges for status */
    .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.15rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .badge-success {
        background-color: var(--color-success-glow);
        color: var(--color-success);
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-warning {
        background-color: var(--color-error-glow);
        color: var(--color-error);
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* States */
    .loading-state, .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        gap: 1rem;
    }

    .loading-state p {
        color: var(--text-secondary);
        font-weight: 500;
    }

    .spinner {
        width: 32px;
        height: 32px;
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

    .error-message {
        color: var(--text-secondary);
        font-size: 0.95rem;
    }

    .retry-btn {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 600;
    }

    .retry-btn:hover {
        background-color: var(--text-muted);
        border-color: var(--glass-border-hover);
    }
</style>