<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    
    let error = null;
    let costos_fijos = [];
    let costos_variables = [];
    let ventas = [];
    let ingresos = 0;
    let monedas = [];
    let moneda_principal = null;
    let moneda_principal_codigo_iso = "";
    let tasas = [];
    let costos = 0;
    let cajas = [];
    let monto_caja = 0;
    let total_por_pagar = 0;
    let total_por_cobrar = 0;
    let proyeccion = 0;
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
        ventas = await fetchEntity("ventas", [], false, null, "", "");
        ventas = ventas.entities;
        if (ventas.length > 0) {
            ventas.forEach(venta => {
                if (venta.moneda.id === moneda_principal.id) {
                    ingresos += venta.total_pagado;
                    total_por_cobrar += (venta.total - venta.total_pagado);
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === moneda_principal.id) {
                            ingresos += venta.total_pagado / tasa.tasa;
                            total_por_cobrar += (venta.total - venta.total_pagado) / tasa.tasa;
                        }
                    })
                }
            })
        }
        cajas = await fetchEntity("cajas", [], false, null, "", "");
        cajas = cajas.entities;
        if (cajas.length > 0) {
            cajas.forEach(caja => {
                if (caja.moneda === moneda_principal.id) {
                    monto_caja += caja.monto;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === caja.moneda && tasa.moneda_origen === moneda_principal.id) {
                            monto_caja += (caja.monto / tasa.tasa);
                        }
                    })
                }
            })
        }
        costos_fijos = await fetchEntity("costos_fijos", [], false, null, "", "");
        costos_fijos = costos_fijos.entities;
        if (costos_fijos.length > 0) {
            costos_fijos.forEach(costos_fijo => {
                if (costos_fijo.moneda.id === moneda_principal.id) {
                    costos += costos_fijo.monto_pagado;
                    total_por_pagar += costos_fijo.monto - costos_fijo.monto_pagado;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === costos_fijo.moneda.id && tasa.moneda_origen === moneda_principal.id) {
                            costos += (costos_fijo.monto_pagado / tasa.tasa);
                            total_por_pagar += ((costos_fijo.monto - costos_fijo.monto_pagado) / tasa.tasa);
                        }
                    })
                }
                
            })
        }
        costos_variables = await fetchEntity("costos_variables", [], false, null, "", "");
        costos_variables = costos_variables.entities;
        if (costos_variables.length > 0) {
            costos_variables.forEach(costos_variable => {
                if (costos_variable.moneda.id === moneda_principal.id) {
                    costos += costos_variable.monto_pagado;
                    total_por_pagar += costos_variable.monto - costos_variable.monto_pagado;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === costos_variable.moneda.id && tasa.moneda_origen === moneda_principal.id) {
                            costos += (costos_variable.monto_pagado / tasa.tasa);
                            total_por_pagar += ((costos_variable.monto - costos_variable.monto_pagado) / tasa.tasa);
                        }
                    })
                }
            })
        }
        proyeccion = total_por_cobrar - total_por_pagar;
        loading = false;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <div>
        <h1>Proyección</h1>
        <p>Total de cajas: ${monto_caja} {moneda_principal_codigo_iso}</p>
        <p>Total por pagar: ${total_por_pagar} {moneda_principal_codigo_iso}</p>
        <p>Total por cobrar: ${total_por_cobrar} {moneda_principal_codigo_iso}</p>
        <p>Total de ingresos: ${ingresos} {moneda_principal_codigo_iso}</p>
        <p>Total de costos: ${costos} {moneda_principal_codigo_iso}</p>
        <p>Proyección: ${proyeccion} {moneda_principal_codigo_iso}</p>
    </div>
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 5rem;
        padding-bottom: 3rem;
        padding-left: 3rem;
        padding-right: 3rem;
        gap: 3rem;
        overflow: auto;
    }

    .reportes_container div {
        width: 40%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        background-color: #728AAC;
        padding: 1rem;
        border-radius: 1rem;
    }

</style>