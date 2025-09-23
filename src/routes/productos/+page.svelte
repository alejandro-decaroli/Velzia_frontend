<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    const entity = "productos";
    let data = null;
    let entities = [];
    let loading = true;
    let error = null;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, data, loading, error);
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
    <EntitiesTable 
        {entity} 
        {data}  
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity={entity.slice(0, -1)} 
            route={entity} 
            id={item.id}    
            on:updated={handleUpdate}
            />
            <ButtonDelete 
                name_entity={entity.slice(0, -1)}
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
            />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="producto"
        fields= {{
        nombre: "text", 
        descripcion: "text",
        stock: "number"
    }}
    
    />
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