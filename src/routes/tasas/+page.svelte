<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    const entity = "tasas";
    let entities = [];
    let loading = true;
    let error = null;
    let monedas = [];

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const loadMonedas = async () => {
        const result = await fetchEntity("monedas", monedas, loading, error);
        loading = result.loading;
        error = result.error;
        monedas = result.entities;
    };

    onMount(() => {
        checkUser(error);
        loadData();
        loadMonedas();
    });

    const handleUpdate = async () => {
        await loadData();
    };
</script>
<GoBack/>
<div class="tasas_container">
    <h1>Tasas</h1>
    <EntitiesTable 
        {entity} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity={entity.slice(0, -1)} 
            route={entity} 
            id={item.id}
            fields= {{ tasa: "number", 
                moneda_origen: "select",
                moneda_destino: "select" }}
                options= { monedas }
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
        name_entity="tasa"
        options= { monedas }
        fields= {{
        tasa: "number", 
        moneda_origen: "select",
        moneda_destino: "select"
    }}/>
</div>

<style>
    .tasas_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>