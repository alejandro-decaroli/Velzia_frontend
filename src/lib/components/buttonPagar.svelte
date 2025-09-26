<script>
    import { loadEntity, pagarEntity } from "$lib/utils/api.js";
    
    export let name_entity = "";
    export let route = "";
    export let id = null;
    export let cajas = [];

    let entity = "";
    let loading = false;
    let error = null;
    let showForm = false;

    async function handleUpdate() {
        entity.monto_pagar = document.getElementById("monto").value;
        entity.caja = document.getElementById("caja").value;
        let result = await pagarEntity(route, id, name_entity, showForm, entity, loading, error);
        loading = result.loading;
        error = result.error;
        showForm = result.showForm;
    }

    async function handleEditClick() {
        
        let result = await loadEntity(route, id, name_entity, showForm, entity, loading, error);
        loading = result.loading;
        error = result.error;
        entity = result.entity;
        showForm = result.showForm;
    }

    function handleClose() {
        showForm = false;
    }

</script>

<button 
    class="pagar-btn" 
    on:click={handleEditClick}
    disabled={loading}
    aria-label="Pagar {name_entity}"
>
    {#if loading}
        Cargando...
    {:else}
        Pagar {name_entity}
    {/if}
</button>

{#if showForm && entity}
<div class="pagar-form-overlay">
    <div class="pagar-form">
        <h3>Pagar {name_entity}</h3>
        
        {#if error}
            <div class="error-message">{error}</div>
        {/if}
        
        {#if entity}
            <label for="">Monto:</label>
            <input type="number" id="monto" placeholder="Ingrese monto"/>
            <label for="">Caja:</label>
            <select id="caja">
                {#each cajas as option}
                    <option value={option.id}>{option.nombre}</option>
                {/each}
            </select>
            <div class="form-actions">
                <button 
                    class="pagar-btn"
                    type="button" 
                    on:click={handleUpdate}
                >
                    Pagar
                </button>
                <button 
                    class="cancel-btn"
                    type="button" 
                    on:click={handleClose}
                >
                    Cancelar
                </button>
            </div>
        {/if}
    </div>
</div>
{/if}

<style>
    .pagar-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .pagar-btn:hover:not(:disabled) {
        background-color: #1D3557;
    }
    
    .pagar-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .pagar-form-overlay {
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
    
    .pagar-form {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 500px;
    }
    
    .pagar-form label {
        display: block;
        text-align: left;
        margin-bottom: 0.5rem;
        margin-top: 1rem;
        color: #1D3557;
        font-weight: bold;
    }
    
    .pagar-form input {
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

    .pagar-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .pagar-btn:hover:not(:disabled) {
        background-color: #1D3557;
    }

    .pagar-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    h3 {
        margin-bottom: 1rem;
        color: #1D3557;
        font-size: 1.1rem;
    }

    select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
    }

</style>
