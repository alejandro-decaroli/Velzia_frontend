<script>
    import { user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';
    import { checkUser } from "$lib/stores/auth.js";
    import { onMount } from "svelte";

    let error = "";

    onMount(async () => {
        await checkUser(error);
    });


</script>
<div class="user-container">
    <div class="user-info">
        <h1>Hola {$user?.nombre} {$user?.apellido}, bienvenido/a a tu dashboard</h1>
    </div>
    <div class="container-inferior">
        <button aria-label="Clientes" on:click={() => {goto("/clientes")}}>
            Clientes
        </button>
        <button aria-label="Ventas" on:click={() => {goto("/ventas")}}>
            Ventas
        </button>
        <button aria-label="Monedas" on:click={() => {goto("/monedas")}}>
            Monedas
        </button>
        <button aria-label="Cajas" on:click={() => {goto("/cajas")}}>
            Cajas
        </button>
        <button aria-label="Costos fijos" on:click={() => {goto("/costos_fijos")}}>
            Costos fijos
        </button>
        <button aria-label="Costos variables" on:click={() => {goto("/costos_variables")}}>
            Costos variables
        </button>
        <button aria-label="Pagos" on:click={() => {goto("/pagos")}}>
            Pagos
        </button>
        <button aria-label="Tasas" on:click={() => {goto("/tasas")}}>
            Tasas
        </button>
        <button aria-label="Transferencias" on:click={() => {goto("/transferencias")}}>
            Transferencias
        </button>
        <button aria-label="Ajustes" on:click={() => {goto("/ajustes")}}>
            Ajustes
        </button>
        <button aria-label="Dividendos socio" on:click={() => {goto("/dividendos")}}>
            Dividendos socio
        </button>
        <button aria-label="Aportes socio" on:click={() => {goto("/aportes")}}>
            Aportes socio
        </button>
        <button aria-label="Productos" on:click={() => {goto("/productos")}}>
            Productos
        </button>
        <button aria-label="Reportes" on:click={() => {goto("/reportes")}}>
            Reportes
        </button>
    </div>
</div>

<style>
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

    .user-container {
        height: 100%;
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: #1D3557;
        padding: 1rem;
        width: 100%;
        overflow: visible;
    }
    @media (max-width: 700px) {
        .container-inferior {
            display: grid;
            height: 80%;
            gap: 1rem;
            grid-template-columns: repeat(2, 1fr);
            align-items: center;
            width: 100%;
            overflow-y: scroll;
        }
    }
    @media (min-width: 701px) {
        .container-inferior {
            display: grid;
            height: 100%;
            gap: 1rem;
            grid-template-columns: repeat(4, 1fr);
            align-items: center;
            width: 100%;
            overflow-y: scroll;
        }
    }

    @media (max-width: 350px) {
        .container-inferior {
            display: grid;
            height: 80%;
            gap: 1rem;
            grid-template-columns: repeat(1, 1fr);
            align-items: center;
            width: 100%;
            overflow-y: scroll; 
            margin-bottom: 1rem;
        }
    }
</style>