<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    
    let error = null;
    let costos_pendientes = [];
    let total_por_pagar = 0;
    let loading = false;
    let acciones = false;

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loading = true;
        let res = await fetchEntity("costos", [], false, null, "Pendiente", "");
        costos_pendientes = res.entities || [];
        if (costos_pendientes.length === 0) {
            // Fallback in case backend returns under legacy name
            res = await fetchEntity("costos_fijos", [], false, null, "Pendiente", "");
            costos_pendientes = res.entities || [];
        }
        if (costos_pendientes.length > 0) {
            costos_pendientes.forEach(costo => {
                total_por_pagar += Number(costo.monto);
            });
        }
        loading = false;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <h1>Cuentas por pagar</h1>
    <p>Total por pagar: ${total_por_pagar}</p>
    <EntitiesTable acciones={acciones} entity="costos" entities={costos_pendientes} loading={loading} error={error} filtro="Pendiente" fecha=""/>
</div>

<style>

    h1 {
        overflow: visible;
        align-self: center;
        text-align: center;
    }

    p {
        overflow: visible;
        align-self: center;
        text-align: center;
    }

    .reportes_container {
        width: 100%;
        height: 100%;
        padding-top: 5rem;
        padding-bottom: 3rem;
        padding-left: 3rem;
        padding-right: 3rem;
        gap: 3rem;
        overflow: auto;
    }

</style>