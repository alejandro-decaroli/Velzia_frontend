<script>
    import Clientes from "$lib/components/clientes.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="cliente_container">
    <Clientes entity="clientes"/>
    <ButtonCreate route="clientes" entity="cliente"/>
</div>

<style>
    .cliente_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>