<script>
    import { checkAdmin } from "$lib/stores/auth.js";
    import { onMount } from 'svelte';
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import { fetchEntity } from "$lib/utils/api.js";

    let error = "";
    let entities = [];
    let loading = true;
    let entity = "usuarios";
    let acciones = false;

    const loadData = async () => {
        const result = await fetchEntity(entity, entities, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    onMount(() => {
        checkAdmin(error);
        loadData();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>

<GoBack/>
<div class="admin_container">
    <h1>Hola Admin</h1>
    <EntitiesTable 
    entity={entity}
    entities={entities}
    loading={loading}
    error={error}
    acciones={acciones}
    >
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="usuario"
        rol={ ["admin", "user"] }
        fields= {{
            nombre: "text", 
            apellido: "text",
            email: "text",
            contraseña: "text",
            rol: "select"
        }}
    
    />
</div>
<style>
   .admin_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>