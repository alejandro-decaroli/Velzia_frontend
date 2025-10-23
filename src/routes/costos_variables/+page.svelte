<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";

    const entity = "costos_variables";
    let entities = [];
    let loading = true;
    let monedas = [];
    let cajas = [];
    let error = null;

    const loadData = async (filtro, fecha) => {
        const result = await fetchEntity(entity, entities, loading, error, filtro, fecha);
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
        loadData("", "");
        load_monedas();
        load_cajas();
    });

    const handleUpdate = async () => {
        await loadData(
            document.getElementById("filtro").value,
            document.getElementById("fecha").value
        );
    };

</script>
<GoBack/>
<div class="caja_container">
    <h1>Costos Variables</h1>
    <div>
        <label for="fecha">Fecha:</label>
        <input type="date" id="fecha" name="fecha">
        <label for="filtro">Estado:</label>
        <select name="filtro" id="filtro">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Paga">Paga</option>
        </select>
        <button type="button" onclick={() => loadData(
            document.getElementById("filtro").value,
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
            <ButtonPagar 
                name_entity="costo_variable"
                route={entity} 
                id={item.id} 
                cajas={cajas}
                on:updated={handleUpdate}
            />
            <ButtonEdit 
            name_entity="costo_variable"
            route={entity} 
            options={monedas}
            monedas={monedas}
            id={item.id} 
            fields= {{
                adjudicacion: "text",
                monto: "number",
                moneda: "select",
            }}
            on:updated={handleUpdate}
            />
            <ButtonDelete 
                name_entity="costo_variable"
                route={entity} 
                id={item.id} 
                on:deleted={handleUpdate}
            />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="costo_variable"
        monedas={monedas}
        fields= {{ 
            adjudicacion: "text",
            monto: "number",
            moneda: "select",
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