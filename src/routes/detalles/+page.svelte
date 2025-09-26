<script>
    import { onMount } from 'svelte';
    import { getDetallesByUser, fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";


    const entity = "detalles";
    let entities = [];
    let loading = true;
    let error = null;
    let productos = [];
    
    const loadData = async () => {
        const result = await getDetallesByUser(entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

   const loadProductos = async () => {
        const result = await fetchEntity("productos", productos, loading, error);
        loading = result.loading;
        error = result.error;
        productos = result.entities;
    };

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loadData();
        loadProductos();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="detalle_container">
    <h1>Detalles de ventas</h1>
    <EntitiesTable 
        {entity}  
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity="detalle"
            route="ventas/detalles" 
            options={ productos }
            id={item.id} 
            fields= {{
                descuento: "number",
                precio_unitario: "number",
                cantidad: "number",
                producto: "select",
            }}
            on:updated={handleUpdate}
            />
            <ButtonDelete 
                name_entity="detalle"
                route="ventas/detalles"
                id={item.id} 
                on:deleted={handleUpdate}
            />
        </svelte:fragment>
    </EntitiesTable>
</div>

<style>
    .detalle_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>