<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="aporte_container">
    <EntitiesTable entity="aportes"/>
    <ButtonCreate 
    route="aportes"
    name_entity="aporte"
    fields= {{
        caja: "text", 
        monto: "number",
    }}/>
</div>

<style>
    .aporte_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>