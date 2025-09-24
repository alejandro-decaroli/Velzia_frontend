<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";
    import { getDetalles } from "$lib/utils/api.js";
   import { page } from "$app/stores";


    const entity = "detalles";
    let entities = [];
    let loading = true;
    let error = null;
    let productos = [];
    const id_venta = $page.params.slug;
    
    const loadData = async () => {
        const result = await getDetalles(entities, id_venta, loading, error);
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

    onMount(() => {
        checkUser(error);
        loadData();
        loadProductos();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="detalle_container">
    <h1>Detalles de venta</h1>
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
    <ButtonCreate 
        route={entity}
        name_entity="detalle"
        options={ productos }
        id_venta_2={id_venta}
        fields= {{ 
            descuento: "number",
            precio_unitario: "number",
            cantidad: "number",
            producto: "select",
        }}
    />
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