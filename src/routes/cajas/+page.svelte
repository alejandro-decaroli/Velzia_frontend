<script lang="ts">
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonTransferencia from "$lib/components/ButtonTransferencia.svelte";
    import ButtonConciliacion from "$lib/components/ButtonConciliacion.svelte";
    import { ENTITY_CONFIGS } from "$lib/utils/entityConfig";

    const config = ENTITY_CONFIGS.cajas;

    const fields = {
        nombre: "text",
        monto: "number"
    };
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
            {fields}
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
        <div class="cajas-controls">
            <ButtonTransferencia on:transferred={handleUpdate} />
            <ButtonConciliacion on:reconciled={handleUpdate} />
            <ButtonCreate 
                route={config.route}
                name_entity={config.name}
                {fields}
                on:created={handleUpdate}
            />
        </div>
    </svelte:fragment>
</CrudPage>

<style>
    .cajas-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }
</style>