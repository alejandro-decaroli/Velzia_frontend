<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    const entity = "pagos";
    let entities = [];
    let loading = true;
    let error = null;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    onMount(() => {
        checkUser(error);
        loadData();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="caja_container">
    <h1>Pagos</h1>
    <EntitiesTable 
        {entity} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonDelete 
                name_entity={entity.slice(0, -1)}
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
            />
        </svelte:fragment>
    </EntitiesTable>
</div>
<style>
    .caja_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>