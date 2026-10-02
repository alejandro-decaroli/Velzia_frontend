<script lang="ts">
    import { onMount } from "svelte";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import ButtonDetalles from "$lib/components/buttonDetalles.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";
    import { fetchEntity } from "$lib/utils/api";

    const config = ENTITY_CONFIGS.ventas;
    let monedas: any[] = [];
    let clientes: any[] = [];
    let cajas: any[] = [];

    onMount(async () => {
        const [resMonedas, resClientes, resCajas] = await Promise.all([
            fetchEntity("monedas", [], true, null, "", ""),
            fetchEntity("clientes", [], true, null, "", ""),
            fetchEntity("cajas", [], true, null, "", "")
        ]);
        monedas = resMonedas.entities || [];
        clientes = resClientes.entities || [];
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
        <ButtonPagar 
            name_entity="venta"
            route={config.route} 
            id={item.id} 
            {cajas}
            on:updated={handleUpdate}
        />
        <ButtonDetalles 
            id_venta={item.id}
        />
        <ButtonEdit 
            name_entity={config.name}
            route={config.route} 
            {clientes}
            {monedas}
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
            {monedas}
            {clientes}
            fields={config.fields}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>