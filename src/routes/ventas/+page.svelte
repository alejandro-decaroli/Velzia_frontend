<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import ButtonDetalles from "$lib/components/buttonDetalles.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";

    const entity = "ventas";
    let entities = [];
    let loading = true;
    let monedas = [];
    let clientes = [];
    let cajas = [];
    let error = null;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const load_monedas= async () => {
        const result = await fetchEntity("monedas", monedas, loading, error);
        loading = result.loading;
        error = result.error;
        monedas = result.entities;
    };

    const load_clientes= async () => {
        const result = await fetchEntity("clientes", clientes, loading, error);
        loading = result.loading;
        error = result.error;
        clientes = result.entities;
    };

    const load_cajas= async () => {
        const result = await fetchEntity("cajas", cajas, loading, error);
        loading = result.loading;
        error = result.error;
        cajas = result.entities;
    };

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loadData();
        load_monedas();
        load_clientes();
        load_cajas();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="ventas_container">
    <h1>Ventas</h1>
    <EntitiesTable 
        {entity} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonPagar 
                name_entity="venta"
                route={entity} 
                id={item.id} 
                cajas={cajas}
                on:updated={handleUpdate}
            />
            <ButtonDetalles 
                name_entity="venta"
                route={entity} 
                id={item.id} 
                id_venta={item.id}
                on:updated={handleUpdate}
            />
            <ButtonEdit 
            name_entity={entity.slice(0, -1)}
            route={entity} 
            clientes={clientes}
            monedas={monedas}
            id={item.id} 
            fields= {{
                moneda: "select",
                cliente: "select",
            }}
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
        name_entity={entity.slice(0, -1)}
        monedas={monedas}
        clientes={clientes}
        fields= {{ 
            moneda: "select",
            cliente: "select",
        }}
    />
</div>

<style>
    .ventas_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>