<script lang="ts">
    import { onMount } from "svelte";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";
    import { fetchEntity } from "$lib/utils/api";

    const config = ENTITY_CONFIGS.transferencias;
    let cajas: any[] = [];

    const fields = {
        monto: "number",
        caja_origen: "select",
        caja_destino: "select",
        motivo: "text"
    };

    onMount(async () => {
        const result = await fetchEntity("cajas", [], true, null, "", "");
        if (result.entities) {
            cajas = result.entities;
        }
    });
</script>

<CrudPage 
    entityKey={config.route} 
    title={config.title} 
    hasDateFilter={config.hasDateFilter}
>
    <svelte:fragment slot="actions" let:item let:handleUpdate>
        <ButtonEdit 
            name_entity={config.name} 
            route={config.route} 
            id={item.id} 
            fields={fields}
            {cajas}
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
            fields={fields}
            {cajas}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>