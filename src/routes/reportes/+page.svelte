<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';
    import { fetchEntity } from '$lib/utils/api.js';
    import ErrorBox from "$lib/components/errorbox.svelte";

    let error = null;
    let monedas = [];
    let moneda_principal = null;
    let tasas = [];
    let tasas_ok = true;
    let ids = [];

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        try {
            monedas = await fetchEntity("monedas", [], false, null, "", "");
            monedas = monedas.entities;
            moneda_principal = monedas.find(monedas => monedas.principal === true);
            tasas = await fetchEntity("tasas", [], false, null, "", "");
            tasas = tasas.entities;
            ids = tasas.map(m => m.moneda_destino.id);
            monedas.forEach(monedas => {
                if (monedas.id !== moneda_principal.id) {
                    if (!ids.includes(monedas.id)) {
                        tasas_ok = false;
                    }
                }
            });
            if (!moneda_principal) {
                throw new Error("No se encontro moneda principal, por ende no se pueden mostrar los reportes");
            }
            if (tasas.length === 0 && monedas.length > 1) {
                throw new Error("No existen tasas de cambio para todas las monedas");
            }
            if (!tasas_ok && monedas.length > 1) {
                throw new Error("No existen tasas de cambio para todas las monedas");
            }
        } catch (error) {
            console.error(error);
            const fondo = document.createElement("div");
            fondo.style.position = "fixed";
            fondo.style.top = "0";
            fondo.style.left = "0";
            fondo.style.width = "100%";
            fondo.style.height = "100%";
            fondo.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            fondo.style.zIndex = "999";
            fondo.style.display = "flex";
            fondo.style.justifyContent = "center";
            fondo.style.alignItems = "center";
            document.body.appendChild(fondo);
            const cartel_error = document.createElement("div");
            cartel_error.textContent = error;
            cartel_error.style.color = "red";
            cartel_error.style.fontSize = "2rem";
            cartel_error.style.position = "absolute";
            cartel_error.style.top = "40vh";
            cartel_error.style.left = "50%";
            cartel_error.style.transform = "translateX(-50%)";
            cartel_error.style.zIndex = "1000";
            cartel_error.style.padding = "20px";
            cartel_error.style.textAlign = "center";
            cartel_error.style.width = "auto";
            cartel_error.style.margin = "0 auto";
            cartel_error.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
            cartel_error.style.border = "2px solid red";
            cartel_error.style.borderRadius = "5px";
            cartel_error.style.backgroundColor = "#f8f8f8";
            document.body.appendChild(cartel_error);
            setTimeout(() => {
                document.body.removeChild(cartel_error);
                document.body.removeChild(fondo);
            }, 2000);
            setTimeout(() => {
                goto("/dashboard");
            }, 2000);
        }
    });

</script>
<GoBack/>
<div class="reportes_container">
    <h1>Reportes</h1>
    <div class="reportes">
        <button aria-label="Reporte de ventas" on:click={() => {goto("/reportes/ventas")}}>
            Reporte de ventas
        </button>
        <button aria-label="Cuentas por pagar" on:click={() => {goto("/reportes/cuentas_pagar")}}>
            Cuentas por pagar
        </button>
        <button aria-label="Cuentas por cobrar" on:click={() => {goto("/reportes/cuentas_cobrar")}}>
            Cuentas por cobrar
        </button>
        <button aria-label="Proyección" on:click={() => {goto("/reportes/proyeccion")}}>
            Proyección
        </button>
    </div>
</div>

<style>
    .reportes_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3rem;
    }

    .reportes {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
    button {
        background-color: #1D3557;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 150px;
        height: 100px;
        margin: 0 auto;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
</style>