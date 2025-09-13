<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="costo_fijo_container">
    <EntitiesTable entity="costos_fijos"/>
    <ButtonCreate 
    route="costos_fijos"
    name_entity="costo_fijo"
    fields= {{
        caja: "text", 
        adjudicacion: "text", 
        monto: "number",
    }}/>
</div>

<style>
    .costo_fijo_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>