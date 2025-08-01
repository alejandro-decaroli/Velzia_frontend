<script>
    import { user } from "$lib/stores/auth.js";
    /* import Clientes from "$lib/components/clientes.svelte"; */
</script>
<div class="user">
    <h1>Hola, {$user?.nombre}!</h1>
    <p>Bienvenido/a a tu perfil</p>
 <!--    <Clientes /> -->
</div>

<style>
    .user {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        background-color: blueviolet;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        height: 250px;
        margin: 0 auto;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        overflow-y: auto;
    }
</style>