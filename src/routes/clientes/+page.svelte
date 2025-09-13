<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="cliente_container">
    <EntitiesTable entity="clientes"/>
    <ButtonCreate 
    route="clientes"
    name_entity="cliente"
    fields= {{
        nombre: "text", 
        apellido: "text", 
        telefono: "text", 
        direccion: "text", 
        email: "email"
    }}/>
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