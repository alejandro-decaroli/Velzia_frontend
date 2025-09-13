<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="ajuste_container">
    <EntitiesTable entity="ajustes"/>
    <ButtonCreate 
    route="ajustes"
    name_entity="ajuste"
    fields= {{
        caja: "text", 
        movimiento: "text", 
        monto: "number",
    }}/>
</div>

<style>
    .ajuste_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>