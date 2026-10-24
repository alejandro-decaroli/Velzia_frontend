<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";
    import { fetchEntity } from "$lib/utils/api";

    const config = ENTITY_CONFIGS.lineas_pedidos;
    let pedidos: any[] = [];
    let productos: any[] = [];
    let selectedPedidoId: string = "";
    let crudPageRef: any;

    $: {
        const param = $page.url.searchParams.get("pedidoId");
        if (param && param !== selectedPedidoId) {
            selectedPedidoId = param;
            if (crudPageRef) {
                crudPageRef.handleUpdate();
            }
        }
    }

    onMount(async () => {
        const [resPedidos, resProductos] = await Promise.all([
            fetchEntity("pedidos", [], true, null, "", ""),
            fetchEntity("productos", [], true, null, "", "")
        ]);
        pedidos = resPedidos.entities || [];
        productos = resProductos.entities || [];
    });

    async function loadDataCustom(filtro: string, fecha: string) {
        const route = selectedPedidoId 
            ? `lineas_pedidos?pedidoId=${selectedPedidoId}` 
            : `lineas_pedidos`;
        const res = await fetchEntity(route, [], true, null, "", "");
        return res.entities || [];
    }

    function onFilterChange() {
        if (crudPageRef) {
            crudPageRef.handleUpdate();
        }
    }
</script>

<CrudPage 
    bind:this={crudPageRef}
    entityKey={config.route} 
    title={config.title} 
    customLoader={loadDataCustom}
>
    <svelte:fragment slot="extra-filters">
        <div class="filter-group-custom">
            <select id="filter-pedido" bind:value={selectedPedidoId} on:change={onFilterChange}>
                <option value="">Todos los pedidos</option>
                {#each pedidos as ped}
                    <option value={String(ped.id)}>{ped.cod || `Pedido #${ped.id}`}</option>
                {/each}
            </select>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions" let:item let:handleUpdate>
        <ButtonEdit 
            name_entity={config.name} 
            route={config.route} 
            {pedidos}
            {productos}
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
            {pedidos}
            {productos}
            fields={config.fields}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>

<style>
    .filter-group-custom select {
        padding: 0.55rem 0.85rem;
        font-size: 0.9rem;
        min-width: 180px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
    }
</style>
