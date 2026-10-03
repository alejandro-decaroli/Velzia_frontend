<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    
    let error = null;
    let costos_fijos = [];
    let ventas = [];
    let ingresos = 0;
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
        ventas = await fetchEntity("ventas", [], false, null, "", "");
        ventas = ventas.entities || [];
        if (ventas.length > 0) {
            ventas.forEach(venta => {
                ingresos += Number(venta.total_pagado);
                total_por_cobrar += Number(venta.total) - Number(venta.total_pagado);
            });
        }
        cajas = await fetchEntity("cajas", [], false, null, "", "");
        cajas = cajas.entities || [];
        if (cajas.length > 0) {
            cajas.forEach(caja => {
                monto_caja += Number(caja.monto);
            });
        }
        costos_fijos = await fetchEntity("costos_fijos", [], false, null, "", "");
        costos_fijos = costos_fijos.entities || [];
        if (costos_fijos.length > 0) {
            costos_fijos.forEach(costos_fijo => {
                costos += Number(costos_fijo.monto_pagado);
                total_por_pagar += Number(costos_fijo.monto) - Number(costos_fijo.monto_pagado);
            });
        }
        proyeccion = total_por_cobrar - total_por_pagar;
        loading = false;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <div>
        <h1>Proyección</h1>
        <p>Total de cajas: ${monto_caja}</p>
        <p>Total por pagar: ${total_por_pagar}</p>
        <p>Total por cobrar: ${total_por_cobrar}</p>
        <p>Total de ingresos: ${ingresos}</p>
        <p>Total de costos: ${costos}</p>
        <p>Proyección: ${proyeccion}</p>
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