<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";

    const entity = "cajas";
    let entities = [];
    let loading = true;
    let monedas = [];
    let error = null;

    const loadData = async (fecha) => {
        const result = await fetchEntity(entity, entities, loading, error, "", fecha);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const load_monedas= async () => {
        const result = await fetchEntity("monedas", monedas, loading, error);
        loading = result.loading;
        error = result.error;
        monedas = result.entities;
    };

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        loadData("");
        load_monedas();
    });

    const handleUpdate = async () => {
        await loadData(
            document.getElementById("fecha").value
        );
    };

</script>
<GoBack/>
<div class="caja_container">
    <h1>Cajas</h1>
    <div>
        <label for="fecha">Fecha:</label>
        <input type="date" id="fecha" name="fecha">
        <button type="button" onclick={() => loadData(
            document.getElementById("fecha").value
        )}>Actualizar</button>
    </div>
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
            id={item.id} 
            options={ monedas }
            fields= {{
                nombre: "text", 
                monto: "number",
                moneda: "select"
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
        name_entity="caja"
        options={ monedas }
        fields= {{
        nombre: "text", 
        monto: "number",
        moneda: "select"
    }}
    
    />
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