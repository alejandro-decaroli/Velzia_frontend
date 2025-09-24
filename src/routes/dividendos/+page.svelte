<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser } from "$lib/stores/auth.js";

    const entity = "dividendos_socio";
    let entities = [];
    let loading = true;
    let cajas = [];
    let error = null;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const load_cajas= async () => {
        const result = await fetchEntity("cajas", cajas, loading, error);
        loading = result.loading;
        error = result.error;
        cajas = result.entities;
    };

    onMount(() => {
        checkUser(error);
        loadData();
        load_cajas();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="dividendo_container">
    <EntitiesTable 
        {entity} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity="dividendo_socio"
            route={entity} 
            id={item.id} 
            options={ cajas }
            fields= {{
                monto: "number",
                caja: "select"
            }}
                on:updated={handleUpdate}
                />
            <ButtonDelete 
                name_entity="dividendo_socio"
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
                />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="dividendo_socio"
        options={ cajas }
        fields= {{
        monto: "number",
        caja: "select"
    }}
    
    />
</div>

<style>
    .dividendo_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>