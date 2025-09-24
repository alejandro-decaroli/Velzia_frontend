<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    let ventas = [];
    let productos = [];
    let cajas = [];
    let monedas = [];
    let clientes = [];
    let costos_fijos = [];
    let costos_variables = [];
    let pagos = [];
    let loading = true;
    let error = null;

    const loadCajas = async () => {
        const result = await fetchEntity("cajas", cajas, loading, error);
        loading = result.loading;
        error = result.error;
        cajas = result.entities;
        console.log(cajas);
    };

    const loadClientes = async () => {
        const result = await fetchEntity("clientes", clientes, loading, error);
        loading = result.loading;
        error = result.error;
        clientes = result.entities;
    };

    const loadCostosFijos = async () => {
        const result = await fetchEntity("costos_fijos", costos_fijos, loading, error);
        loading = result.loading;
        error = result.error;
        costos_fijos = result.entities;
    };

    const loadCostosVariables = async () => {
        const result = await fetchEntity("costos_variables", costos_variables, loading, error);
        loading = result.loading;
        error = result.error;
        costos_variables = result.entities;
    };

    const loadPagos = async () => {
        const result = await fetchEntity("pagos", pagos, loading, error);
        loading = result.loading;
        error = result.error;
        pagos = result.entities;
    };

    const loadMonedas = async () => {
        const result = await fetchEntity("monedas", monedas, loading, error);
        loading = result.loading;
        error = result.error;
        monedas = result.entities;
    };

    const loadProductos = async () => {
        const result = await fetchEntity("productos", productos, loading, error);
        loading = result.loading;
        error = result.error;
        productos = result.entities;
    };

    const loadVentas = async () => {
        const result = await fetchEntity("ventas", ventas, loading, error);
        loading = result.loading;
        error = result.error;
        ventas = result.entities;
    };

    onMount(() => {
        checkUser(error);
        loadCajas();
        loadClientes();
        loadCostosFijos();
        loadCostosVariables();
        loadPagos();
        loadMonedas();
        loadProductos();
        loadVentas();
    });

</script>
<GoBack/>
<div class="reportes_container">
    <h1>Reportes</h1>
    
</div>

<style>
    .reportes_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>