<script>
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';

    let error = null;

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
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