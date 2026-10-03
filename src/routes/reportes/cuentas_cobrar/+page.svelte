<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    
    let error = null;
    let ventas_pendientes = [];
    let total_por_cobrar = 0;
    let acciones = false;
    let loading = false;

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loading = true;
        ventas_pendientes = await fetchEntity("ventas", [], false, null, "Pendiente", "");
        ventas_pendientes = ventas_pendientes.entities || [];
        if (ventas_pendientes.length > 0) {
            ventas_pendientes.forEach(venta => {
                total_por_cobrar += Number(venta.total) - Number(venta.total_pagado);
            });
        }
        loading = false;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <h1>Cuentas por cobrar</h1>
    <p>Total por cobrar: ${total_por_cobrar}</p>
    <EntitiesTable acciones={acciones} entity="ventas" entities={ventas_pendientes} loading={loading} error={error} filtro="Pendiente" fecha=""/>
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