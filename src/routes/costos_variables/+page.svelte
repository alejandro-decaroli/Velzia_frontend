<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    const entity = "costos_variables";
    let data = null;
    let entities = [];
    let loading = true;
    let monedas = [];
    let cajas = [];
    let error = null;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, data, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const load_monedas= async () => {
        const result = await fetchEntity("monedas", monedas, data, loading, error);
        loading = result.loading;
        error = result.error;
        monedas = result.entities;
    };

    const load_cajas= async () => {
        const result = await fetchEntity("cajas", cajas, data, loading, error);
        loading = result.loading;
        error = result.error;
        cajas = result.entities;
    };

    onMount(() => {
        checkUser(error);
        loadData();
        load_monedas();
        load_cajas();
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
            <ButtonPagar 
                name_entity="costo_variable"
                route={entity} 
                id={item.id} 
                cajas={cajas}
                on:updated={handleUpdate}
            />
            <ButtonEdit 
            name_entity="costo_variable"
            route={entity} 
            options={monedas}
            monedas={monedas}
            id={item.id} 
            fields= {{
                adjudicacion: "text",
                monto: "number",
                moneda: "select",
            }}
            on:updated={handleUpdate}
            />
            <ButtonDelete 
                name_entity="costo_variable"
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
            />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="costo_variable"
        monedas={monedas}
        fields= {{ 
            adjudicacion: "text",
            monto: "number",
            moneda: "select",
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