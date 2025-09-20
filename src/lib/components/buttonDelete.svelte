<script>
    import { deleteEntity } from "$lib/utils/api.js"; 
    export let name_entity = "";
    export let route = "";
    export let id = null;
    export let token = "";

    let data = null;
    let error = null;
    let showConfirm = false;
    let showForm = false;
    let entity = null;
    let loading = false;
    
    function handleDelete() {
        showConfirm = true;
    }
    
    function cancelDelete() {
        showConfirm = false;
    }

    async function delete_entity() {
        let result = await deleteEntity(route, id, token, name_entity, showForm, entity, data, loading, error);
        loading = result.loading;
        error = result.error;
        showForm = result.showForm;
    }

</script>

<button 
    class="delete" 
    aria-label="Eliminar {name_entity}" 
    on:click|preventDefault={handleDelete}
>
    Eliminar {name_entity}
</button>

{#if showConfirm}
    <div class="confirm-overlay">
        <div class="confirm-dialog">
            {#if error}
                <div class="error-message">{error}</div>
            {/if}
            <p>¿Estás seguro de que deseas eliminar este {name_entity}?</p>
            <div class="button-group">
                <button 
                    class="confirm-button" 
                    on:click|preventDefault={delete_entity}
                >
                    Sí, eliminar
                </button>
                <button 
                    class="cancel-button" 
                    on:click|preventDefault={cancelDelete}
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    button {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .error-message {
        color: #e53e3e;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: 0.25rem;
    }

    .delete {
        background-color: #E63946;
        color: white;
    }
    
    .delete:hover {
        background-color: #c1121f;
    }
    
    .confirm-overlay {
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
    
    .confirm-dialog {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .confirm-dialog p {
        margin-bottom: 1.5rem;
        color: #1D3557;
        font-size: 1.1rem;
    }
    
    .button-group {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
    
    .confirm-button {
        background-color: #E63946;
        color: white;
    }
    
    .confirm-button:hover {
        background-color: #c1121f;
    }
    
    .cancel-button {
        background-color: #f1faee;
        color: #1D3557;
        border: 1px solid #ccc;
    }
    
    .cancel-button:hover {
        background-color: #e2e8f0;
    }
</style>