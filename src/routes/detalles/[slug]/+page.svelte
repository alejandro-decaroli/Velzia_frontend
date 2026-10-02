<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import CrudPage from "$lib/components/CrudPage.svelte";
    import ButtonCreate from "$lib/components/buttonCreate.svelte";
    import ButtonDelete from "$lib/components/buttonDelete.svelte";
    import ButtonEdit from "$lib/components/buttonEdit.svelte";
    import { fetchEntity, getDetalles } from "$lib/utils/api";

    const id_venta = $page.params.slug;
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

    async function loadDataCustom() {
        const result = await getDetalles([], id_venta, true, null);
        return result.entities || [];
    }
</script>

<CrudPage 
    entityKey="detalles" 
    title={`Detalles de Venta (Código #${id_venta})`} 
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
    
    <svelte:fragment slot="controls" let:handleUpdate>
        <ButtonCreate 
            route="detalles"
            name_entity="detalle"
            {productos}
            id_venta_2={id_venta}
            {fields}
            on:created={handleUpdate}
        />
    </svelte:fragment>
</CrudPage>