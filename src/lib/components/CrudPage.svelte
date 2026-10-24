<script lang="ts">
    import { onMount } from "svelte";
    import { fetchEntity } from "$lib/utils/api";
    import { checkUser, user } from "$lib/stores/auth";
    import EntitiesTable from "./entitiesTable.svelte";
    import GoBack from "./goback.svelte";
    
    export let entityKey: string;
    export let title: string;
    export let hasDateFilter: boolean = false;
    export let hasStatusFilter: boolean = false;
    export let statusOptions: { value: string; label: string }[] = [];
    
    // Custom data loader override
    export let customLoader: ((filtro: string, fecha: string) => Promise<any[]>) | null = null;
    
    let entities: any[] = [];
    let loading = true;
    let error: string | null = null;

    let filterValue = "";
    let dateValue = "";

    async function loadData() {
        loading = true;
        error = null;
        try {
            if (customLoader) {
                entities = await customLoader(filterValue, dateValue);
            } else {
                const result = await fetchEntity(entityKey, [], true, null, filterValue, dateValue);
                if (result.error) {
                    error = result.error;
                } else {
                    entities = result.entities;
                }
            }
        } catch (err: any) {
            error = err.message || "Error al cargar datos";
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        const userData = await checkUser(error || "");
        if (userData) {
            user.set(userData);
        }
        await loadData();
    });

    export function handleUpdate() {
        loadData();
    }
    
</script>

<div class="page-container">
    <div class="top-nav">
        <GoBack />
    </div>

    <main class="content-card">
        <div class="card-header">
            <h1 class="page-title">{title}</h1>
            
            <div class="filter-bar">
                {#if hasDateFilter}
                    <div class="filter-group">
                        <label for="fecha">Fecha</label>
                        <input type="date" id="fecha" bind:value={dateValue} on:change={loadData} />
                    </div>
                {/if}

                {#if hasStatusFilter}
                    <div class="filter-group">
                        <label for="filtro">Filtrar por</label>
                        <select id="filtro" bind:value={filterValue} on:change={loadData}>
                            <option value="">Todos</option>
                            {#if statusOptions.length > 0}
                                {#each statusOptions as opt}
                                    <option value={opt.value}>{opt.label}</option>
                                {/each}
                            {:else if entityKey === "ventas" || entityKey === "costos" || entityKey === "costos_fijos"}
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagada">Pagada</option>
                                <option value="Paga">Paga</option>
                            {:else if entityKey === "ajustes"}
                                <option value="ingreso">Ingreso</option>
                                <option value="egreso">Egreso</option>
                            {:else if entityKey === "pedidos"}
                                <option value="Pendiente">Pendiente</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Recibido">Recibido</option>
                                <option value="Pagado">Pagado</option>
                            {/if}
                        </select>
                    </div>
                {/if}

                <div class="filter-actions">
                    <button class="btn-secondary refresh-btn" on:click={loadData} title="Actualizar datos">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"></path></svg>
                        <span>Actualizar</span>
                    </button>
                    <slot name="extra-filters" />
                </div>
            </div>
        </div>

        <div class="table-wrapper">
            <EntitiesTable 
                entity={entityKey} 
                {entities} 
                {loading} 
                {error}
                acciones={$$slots.actions}
            >
                <svelte:fragment slot="actions" let:item>
                    <slot name="actions" {item} {handleUpdate} />
                </svelte:fragment>
            </EntitiesTable>
        </div>

        <div class="card-footer">
            <slot name="controls" {handleUpdate} />
        </div>
    </main>
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
        gap: 1.5rem;
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
        font-size: 1.75rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1rem;
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
    }

    .filter-actions {
        display: flex;
        gap: 0.75rem;
    }

    .btn-secondary {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 0.55rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
    }

    .btn-secondary:hover {
        background-color: var(--text-muted);
        border-color: var(--glass-border-hover);
        color: #ffffff;
    }

    .table-wrapper {
        position: relative;
        min-height: 200px;
        width: 100%;
    }

    .card-footer {
        display: flex;
        justify-content: center;
        border-top: 1px solid var(--glass-border);
        padding-top: 1.5rem;
    }
</style>
