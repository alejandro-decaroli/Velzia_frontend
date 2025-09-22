<script>


// Tengo que hacer que los boton de crear, editar, obtener y eliminar sean universales

/*



1. Colores base / fondo

#D4E6FF → Fondo general de la aplicación (mantiene claridad y descanso visual).

#CDE2FF → Paneles, tarjetas, áreas de contenido secundario.

2. Colores de identidad (branding + navegación)

#1D3557 (principal) → Header / barra de navegación. Botones primarios. Títulos principales.
#405B81 → Hover states. Botones secundarios. Tabs activas.

3. Colores de texto

#1D3557 → Texto principal (alta legibilidad).

#728AAC → Texto secundario, placeholders, etiquetas.

4. Colores de acción / énfasis

#A2C9FF →

Botones destacados (solo cuando quieras atraer atención).

Elementos interactivos (iconos, gráficos, progresos).

KPIs positivos.

🔑 Principios para tu ERP

Usa los azules más oscuros (#1D3557, #405B81) para estructura y jerarquía.

Usa los azules claros (#CDE2FF, #D4E6FF) para fondos → evitan fatiga visual.

Reserva #A2C9FF como color de acento (para que no pierda impacto).

Mantén buen contraste: texto oscuro sobre fondos claros y viceversa.
*/
</script>

<main>
    <div class="container">
        <h1>Velzia el ERP que comprende tus necesidades</h1>
        <p>Velzia es un ERP que se adapta a tus necesidades. No tienes que esperar a que te den un presupuesto para poder empezar a usarlo. </p>
        <p>Siempre estamos mejorando para brindarte la mejor experiencia posible.</p>
    </div>
</main>



<style>
    .container {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
</style>

<!-- <script>
    import { onMount } from 'svelte';
    import { user } from "$lib/stores/auth.js";
    import { getDetalles, fetchEntity } from "$lib/utils/api.js";
    import EntitiesTable from "$lib/components/entitiesTable.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import GoBack from "$lib/components/goback.svelte"
    import { page } from "$app/state";
    

    $: id_venta = $page.params.id;
    const entity = "ventas";
    let token = $user?.token;
    let entities = [];
    let loading = true;
    let productos = [];
    let error = null;

    const loadData = async () => {
        const result = await getDetalles(entities, token, id_venta, loading, error);
        loading = result.loading;
        error = result.error;
        entities = result.entities;
    };

    const load_productos= async () => {
        const result = await fetchEntity("productos", productos, token, loading, error);
        loading = result.loading;
        error = result.error;
        productos = result.entities;
    };

    onMount(() => {
        loadData();
        load_productos();
    });

    const handleUpdate = async () => {
        await loadData();
    };

</script>
<GoBack/>
<div class="detalle_container">
    <EntitiesTable 
        {entity} 
        {token} 
        {entities} 
        {loading} 
        {error}
    >
        <svelte:fragment slot="actions" let:item>
            <ButtonEdit 
            name_entity={entity.slice(0, -1)} 
            route={entity} 
            token={token}
            id={item.id} 
            options={ productos }
            fields= {{
                descuento: "number", 
                cantidad: "number",
                producto: "select",
                precio_unitario: "number"
            }}
                on:updated={handleUpdate}
                />
            <ButtonDelete 
                name_entity={entity.slice(0, -1)}
                route={entity} 
                id={item.id} 
                token={token}
                on:deleted={handleUpdate}
                />
        </svelte:fragment>
    </EntitiesTable>
    <ButtonCreate 
        route={entity}
        name_entity="detalle"
        options={ productos }
        fields= {{
        descuento: "number", 
        cantidad: "number",
        producto: "select",
        precio_unitario: "number"
    }}
    
    />
</div>

<style>
    .detalle_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
</style>
 -->

