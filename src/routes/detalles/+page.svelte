<script lang="ts">
    import { onMount } from "svelte";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import { fetchEntity, getDetallesByUser } from "$lib/utils/api";

    let productos: any[] = [];

    const fields = {
        descuento: "number",
        precio_unitario: "number",
        cantidad: "number",
        producto: "select"
    };

    onMount(async () => {
        const result = await fetchEntity("productos", [], true, null, "", "");
        if (result.entities) {
            productos = result.entities;
        }
    });

    async function loadDataCustom(filtro: string, fecha: string) {
        const result = await getDetallesByUser([], true, null);
        return result.entities || [];
    }
</script>

<CrudPage 
    entityKey="detalles" 
    title="Todos los Detalles de Ventas" 
    hasDateFilter={true}
    customLoader={loadDataCustom}
>
    <svelte:fragment slot="actions" let:item let:handleUpdate>
        <ButtonEdit 
            name_entity="detalle"
            route="ventas/detalles" 
            {productos}
            id={item.id} 
            {fields}
            on:updated={handleUpdate}
        />
        <ButtonDelete 
            name_entity="detalle"
            route="ventas/detalles"
            id={item.id} 
            on:deleted={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>