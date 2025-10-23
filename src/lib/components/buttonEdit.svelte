<script>
    import { loadEntity, updateEntity, cargarDetalle } from "$lib/utils/api.js";
    import { onMount } from "svelte";
    
    export let name_entity = "";
    export let route = "";
    export let id = null;
    export let fields = {};
    export let options = {};
    export let monedas = {};
    export let cajas = {};
    export let clientes = {};
    export let rol = [];
    export let movimiento = [];
    export let principal = [];
    export let productos = [];

    let entity = null;
    let loading = false;
    let error = null;
    let showForm = false;
    let entities = [];
    let standardFields = [];

    onMount(() => {
        if (name_entity === "dividendo_socio" || name_entity === "aporte_socio" || name_entity === "ajuste") {
            standardFields = [
                "Nombre_cliente", "nombre_cliente",
                "Apellido_cliente", "apellido_cliente",
                "Venta", "venta",
                "CostoVariable", "costoVariable",
                "CostoFijo", "costoFijo",
                "Clientes", "clientes",
                "Pago", "pago",
                "Dividendo", "dividendo",
                "Aporte", "aporte",
                "Detalles", "detalles",
                "Ajuste", "ajuste",
                "Moneda_asociada", "moneda_asociada",
                "Transferencia", "transferencia",
                "Clientes", "clientes",
                "estado", "Estado",
                "id", "Id", "ID",
                "usuario", "Usuario",
                "visible", "Visible",
                "nombre_caja_origen", "Nombre_Caja_Origen",
                "nombre_caja_destino", "Nombre_Caja_Destino",
                "tipo_moneda", "Tipo Moneda",
                "nombre_moneda_origen", "Nombre Moneda Origen",
                "nombre_moneda_destino", "Nombre Moneda Destino",
                "Nombre_moneda", "nombre_Moneda", "nombre_moneda",
                "actualizadoEn", "ActualizadoEn",
                "eliminadoEn", "EliminadoEn",
                "creadoEn", "CreadoEn",
                "Subtotal", "subtotal",
                "Monto_pagado", "monto_pagado",
                "Nombre_caja", "nombre_caja",
            ]
        } else {
            standardFields = [
                "Nombre_cliente", "nombre_cliente",
                "Apellido_cliente", "apellido_cliente",
                "Venta", "venta",
                "CostoVariable", "costoVariable",
                "CostoFijo", "costoFijo",
                "Clientes", "clientes",
                "Pago", "pago",
                "Dividendo", "dividendo",
                "Aporte", "aporte",
                "Detalles", "detalles",
                "Ajuste", "ajuste",
                "Moneda_asociada", "moneda_asociada",
                "Transferencia", "transferencia",
                "Clientes", "clientes",
                "estado", "Estado",
                "id", "Id", "ID",
                "usuario", "Usuario",
                "visible", "Visible",
                "nombre_caja_origen", "Nombre_Caja_Origen",
                "nombre_caja_destino", "Nombre_Caja_Destino",
                "tipo_moneda", "Tipo Moneda",
                "nombre_moneda_origen", "Nombre Moneda Origen",
                "nombre_moneda_destino", "Nombre Moneda Destino",
                "Nombre_moneda", "nombre_Moneda", "nombre_moneda",
                "actualizadoEn", "ActualizadoEn",
                "eliminadoEn", "EliminadoEn",
                "creadoEn", "CreadoEn",
                "Subtotal", "subtotal",
                "Monto_pagado", "monto_pagado",
            ];
        }
    });

    async function handleUpdate() {
        let result = await updateEntity(route, id, name_entity, showForm, entity, loading, error);
        loading = result.loading;
        error = result.error;
        showForm = result.showForm;
    }

    async function handleEditClick() {
        
        if (name_entity === "detalle") {
            let result = await cargarDetalle(id, showForm, entity, loading, error);
            loading = result.loading;
            error = result.error;
            entity = result.entity;
            showForm = result.showForm;
        } else {
            let result = await loadEntity(route, id, name_entity, showForm, entity, loading, error);
            loading = result.loading;
            error = result.error;
            entity = result.entity;
            showForm = result.showForm;
        }
    }

    function handleClose() {
        showForm = false;
    }

</script>

<button 
    class="edit-btn" 
    on:click={handleEditClick}
    disabled={loading}
    aria-label="Editar {name_entity}"
>
    {#if loading}
        Cargando...
    {:else}
        Editar {name_entity}
    {/if}
</button>

{#if showForm && entity}
<div class="edit-form-overlay">
    <div class="edit-form">
        <h3>Editar {name_entity}</h3>
        
        {#if error}
            <div class="error-message">{error}</div>
        {/if}
        
        {#if entity}
            {#each Object.keys(entity).filter(key => !standardFields.includes(key)) as key}
                {@const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)}
                <div class="form-group">
                    <label for={capitalizedKey}>{capitalizedKey}:</label>
                    {#if fields[key] === "select"}
                        <select id={capitalizedKey} bind:value={entity[key]}>
                            {#if key === "moneda" && monedas.length > 0}
                                {#each monedas as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {:else if key === "caja" && cajas.length > 0}
                                {#each cajas as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {:else if key === "cliente" && clientes.length > 0}
                                {#each clientes as option}
                                    <option value={option.id}>{option.nombre + " " + option.apellido}</option>
                                {/each}
                            {:else if key === "rol" && rol.length > 0}
                                {#each rol as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            {:else if key === "movimiento" && movimiento.length > 0}
                                {#each movimiento as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            {:else if key === "producto" && productos.length > 0}
                                {#each productos as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {:else if key === "principal" && principal.length > 0}
                                {#each principal as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            {/if}
                        </select>
                    {:else}
                        <input type={fields[key]} id={capitalizedKey} placeholder={capitalizedKey} bind:value={entity[key]} />
                    {/if}
                </div>
            {/each}  
            <div class="form-actions">
                <button 
                    class="save-btn"
                    type="button" 
                    on:click={handleUpdate}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                    class="cancel-btn"
                    type="button" 
                    on:click={handleClose}
                    disabled={loading}
                >
                    Cancelar
                </button>
            </div>
        {/if}
    </div>
</div>
{/if}

<style>
    .edit-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .edit-btn:hover:not(:disabled) {
        background-color: #1D3557;
    }
    
    .edit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .edit-form-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .edit-form {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 500px;
    }
    
    .edit-form label {
        display: block;
        text-align: left;
        margin-bottom: 0.5rem;
        margin-top: 1rem;
        color: #1D3557;
        font-weight: bold;
    }
    
    .edit-form input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
    }
    
    .form-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
    }

    .form-group select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
    }

    .form-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .error-message {
        color: #e53e3e;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: 0.25rem;
        white-space: normal;
    }

    .cancel-btn {
        background-color: #E63946;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .cancel-btn:hover:not(:disabled) {
        background-color: #c1121f;
    }

    .cancel-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .save-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .save-btn:hover:not(:disabled) {
        background-color: #1D3557;
    }

    .save-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    h3 {
        margin-bottom: 1rem;
        color: #1D3557;
        font-size: 1.1rem;
    }

</style>
