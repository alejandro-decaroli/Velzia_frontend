<script lang="ts">
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";

    const config = ENTITY_CONFIGS.pagos;
</script>

<CrudPage 
    entityKey={config.route} 
    title={config.title} 
    hasDateFilter={config.hasDateFilter}
>
    <svelte:fragment slot="actions" let:item let:handleUpdate>
        <ButtonDelete 
            name_entity={config.name}
            route={config.route} 
            id={item.id} 
            on:deleted={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>