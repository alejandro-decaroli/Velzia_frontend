<script>
    import { goto } from "$app/navigation";
    export let id_venta;
</script>

<button 
    class="detalles-btn" 
    on:click={() => goto(`/detalles/${id_venta}`)}
    aria-label="Gestionar detalles"
>
    Gestionar detalles
</button>

<style>
    .detalles-btn {
        background-color: #405B81;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
