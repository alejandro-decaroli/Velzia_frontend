<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";

    const entity = "ajustes";
    let entities = [];
    let loading = true;
    let error = null;
    let cajas = [];

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

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loadData();
        load_cajas();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="ajuste_container">
    <h1>Ajustes</h1>
    <EntitiesTable 
        {entity} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity={entity.slice(0, -1)} 
            route={entity} 
            movimiento= { ["ingreso", "egreso"] }
            id={item.id} 
            options={ cajas }
            fields= {{
                movimiento: "select", 
                monto: "number",
                caja: "select"
            }}
                on:updated={handleUpdate}
                />
            <ButtonDelete 
                name_entity={entity.slice(0, -1)}
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
                />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="ajuste"
        movimiento= { ["ingreso", "egreso"] }
        options={ cajas }
        fields= {{
            movimiento: "select", 
            monto: "number",
            caja: "select"
        }}
    
    />
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