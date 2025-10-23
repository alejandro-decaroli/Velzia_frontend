<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    
    let error = null;
    let ventas_pendientes = [];
    let monedas = [];
    let moneda_principal = "";
    let total_por_cobrar = 0;
    let loading = false;
    let tasas = [];

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loading = true;
        monedas = await fetchEntity("monedas", [], false, null, "", "");
        monedas = monedas.entities;
        moneda_principal = monedas.find(monedas => monedas.id === 1).codigo_iso;
        tasas = await fetchEntity("tasas", [], false, null, "", "");
        tasas = tasas.entities;
        ventas_pendientes = await fetchEntity("ventas", [], false, null, "Pendiente", "");
        ventas_pendientes = ventas_pendientes.entities;
        if (ventas_pendientes.length > 0) {
            ventas_pendientes.forEach(venta => {
                if (venta.moneda.id === 1) {
                    total_por_cobrar += venta.total - venta.total_pagado;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === 1) {
                            total_por_cobrar += (venta.total - venta.total_pagado) / tasa.tasa;
                        }
                    })
                }
            })
        }
        loading = false;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <h1>Cuentas por cobrar</h1>
    <p>Total por cobrar: ${total_por_cobrar} {moneda_principal}</p>
    <EntitiesTable entity="ventas" entities={ventas_pendientes} loading={loading} error={error} filtro="Pendiente" fecha=""/>
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