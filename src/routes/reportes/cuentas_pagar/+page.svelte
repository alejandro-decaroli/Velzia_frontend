<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    
    let error = null;
    let tasas = [];
    let costos_fijos_pendientes = [];
    let costos_variables_pendientes = [];
    let total_por_pagar = 0;
    let monedas = [];
    let moneda_principal_codigo_iso = "";
    let moneda_principal = null;
    let loading = false;

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loading = true;
        monedas = await fetchEntity("monedas", [], false, null, "", "");
        monedas = monedas.entities;
        moneda_principal = monedas.find(monedas => monedas.principal === true);
        if (!moneda_principal) {
            throw new Error("No se encontro moneda principal");
        }
        moneda_principal_codigo_iso = moneda_principal.codigo_iso;
        tasas = await fetchEntity("tasas", [], false, null, "", "");
        tasas = tasas.entities;
        costos_fijos_pendientes = await fetchEntity("costos_fijos", [], false, null, "Pendiente", "");
        costos_fijos_pendientes = costos_fijos_pendientes.entities;
        if (costos_fijos_pendientes.length > 0) {
            costos_fijos_pendientes.forEach(costos_fijo => {
                if (costos_fijo.moneda.id === moneda_principal.id) {
                    total_por_pagar += costos_fijo.monto - costos_fijo.monto_pagado;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === costos_fijo.moneda.id && tasa.moneda_origen === moneda_principal.id) {
                            total_por_pagar += (costos_fijo.monto - costos_fijo.monto_pagado) / tasa.tasa;
                        }
                    })
                }
            })
        }
        costos_variables_pendientes = await fetchEntity("costos_variables", [], false, null, "Pendiente", "");
        costos_variables_pendientes = costos_variables_pendientes.entities;
        if (costos_variables_pendientes.length > 0) {
            costos_variables_pendientes.forEach(costos_variable => {
                if (costos_variable.moneda.id === moneda_principal.id) {
                    total_por_pagar += costos_variable.monto - costos_variable.monto_pagado;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === costos_variable.moneda.id && tasa.moneda_origen === moneda_principal.id) {
                            total_por_pagar += (costos_variable.monto - costos_variable.monto_pagado) / tasa.tasa;
                        }
                    })
                }
            })
        }
        loading = false;
        moneda_principal = monedas.find(monedas => monedas.id === moneda_principal.id);
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <h1>Cuentas por pagar</h1>
    <p>Total por pagar: ${total_por_pagar} {moneda_principal_codigo_iso}</p>
    <EntitiesTable entity="costos_fijos" entities={costos_fijos_pendientes} loading={loading} error={error} filtro="Pendiente" fecha=""/>
    <EntitiesTable entity="costos_variables" entities={costos_variables_pendientes} loading={loading} error={error} filtro="Pendiente" fecha=""/>
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