<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="caja_container">
    <EntitiesTable entity="cajas"/>
    <ButtonCreate 
    route="cajas"
    name_entity="caja"
    fields= {{
        nombre: "text", 
        moneda: "text", 
        monto: "number",
        siglas: "text",
    }}/>
</div>

<style>
    .caja_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>