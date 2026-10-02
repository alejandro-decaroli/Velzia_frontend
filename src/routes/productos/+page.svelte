<script lang="ts">
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";

    const config = ENTITY_CONFIGS.productos;
</script>

<CrudPage 
    entityKey={config.route} 
    title={config.title} 
>
    <svelte:fragment slot="actions" let:item let:handleUpdate>
        <ButtonEdit 
            name_entity={config.name} 
            route={config.route} 
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
            fields={config.fields}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>