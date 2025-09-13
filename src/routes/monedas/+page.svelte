<script>
    import EntitiesTable from "$lib/components/entitiesTable.svelte"
    import ButtonCreate from "$lib/components/button.Create.svelte"
</script>

<div class="moneda_container">
    <EntitiesTable entity="monedas"/>
    <ButtonCreate 
    route="monedas"
    name_entity="moneda"
    fields= {{
        nombre: "text", 
        codigo_iso: "text", 
    }}/>
</div>

<style>
    .moneda_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>