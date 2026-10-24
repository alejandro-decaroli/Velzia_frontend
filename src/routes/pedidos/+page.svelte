<script lang="ts">
    import { onMount } from "svelte";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";
    import { fetchEntity } from "$lib/utils/api";
    import { goto } from "$app/navigation";

    const config = ENTITY_CONFIGS.pedidos;
    let proveedores: any[] = [];
    let cajas: any[] = [];

    onMount(async () => {
        const [resProveedores, resCajas] = await Promise.all([
            fetchEntity("proveedores", [], true, null, "", ""),
            fetchEntity("cajas", [], true, null, "", "")
        ]);
        proveedores = resProveedores.entities || [];
        cajas = resCajas.entities || [];
    });
</script>

<CrudPage 
    entityKey={config.route} 
    title={config.title} 
    hasDateFilter={config.hasDateFilter}
    hasStatusFilter={config.hasStatusFilter}
>
    <svelte:fragment slot="actions" let:item let:handleUpdate>
        {#if item.estado !== 'Pagado' && !item.pago}
            <ButtonPagar 
                name_entity={config.name}
                route={config.route} 
                id={item.id} 
                {cajas}
                on:updated={handleUpdate}
            />
        {/if}
        <button 
            class="lineas-btn" 
            on:click={() => goto(`/lineas_pedidos?pedidoId=${item.id}`)}
            title="Ver líneas del pedido"
            aria-label="Ver líneas de pedido"
        >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <span>Líneas</span>
        </button>
        <ButtonEdit 
            name_entity={config.name} 
            route={config.route} 
            {proveedores}
            id={item.id} 
            fields={config.fields}
            on:updated={handleUpdate}
        />
        <ButtonDelete 
            name_entity={config.name}
            route={config.route} 
            id={item.id} 
            on:deleted={handleUpdate}
        />
    </svelte:fragment>
    
    <svelte:fragment slot="controls" let:handleUpdate>
        <ButtonCreate 
            route={config.route}
            name_entity={config.name}
            {proveedores}
            fields={config.fields}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>

<style>
    .lineas-btn {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        transition: all var(--transition-fast);
        cursor: pointer;
    }

    .lineas-btn:hover {
        background-color: var(--color-brand-glow);
        color: var(--color-brand);
        border-color: var(--color-brand);
    }
</style>
