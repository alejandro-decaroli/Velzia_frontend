<script>
    import { onMount } from 'svelte';
    import { user } from "$lib/stores/auth.js";
    
    export let entity = "";
    export let route = "";
    export let id = null;
    
    let data = null;
    let loading = false;
    let error = null;
    let showForm = false;
    const standardFields = [
        "Estado",
        "Id",
        "Usuario",
        "CreatedAt",
        "UpdatedAt",
        "DeletedAt"
    ];

    async function loadEntity() {
        try {
            loading = true;
            error = null;
            
            const response = await fetch(`http://localhost:3000/${route}/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${$user?.token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }
            
            data = await response.json();
            entity = data.cliente;
            console.log(data);
            showForm = true;
        } catch (err) {
            console.error("Error:", err);
            error = 'Error al cargar los datos del cliente';
        } finally {
            loading = false;
        }
    }

    async function updateEntity() {
        try {
            loading = true;
            error = null;
            
            const response = await fetch(`http://localhost:3000/${route}/update/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${$user?.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(entity)
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar los datos');
            }
            
            // Cerrar el formulario después de actualizar
            showForm = false;
            // Emitir evento para notificar al componente padre
            dispatch('updated');
        } catch (err) {
            console.error("Error:", err);
            error = `Error al actualizar los datos de ${entity}`;
        } finally {
            loading = false;
        }
    }

    function handleEditClick() {
        loadEntity();
    }

    function handleClose() {
        showForm = false;
    }
</script>

<button 
    class="edit-btn" 
    on:click={handleEditClick}
    disabled={loading}
    aria-label="Editar {entity}"
>
    {#if loading}
        Cargando...
    {:else}
        Editar {entity}
    {/if}
</button>

{#if showForm && entity}
<div class="edit-form-overlay">
    <div class="edit-form">
        <h3>Editar {entity}</h3>
        
        {#if error}
            <div class="error-message">{error}</div>
        {/if}
        
        {#if entity}
            {#each Object.keys(entity).map(key => key.charAt(0).toUpperCase() + key.slice(1)).filter(key => !standardFields.includes(key)) as key}
                <div>
                    <label for={key}>{key}:</label>
                    <input type="text" id={key} placeholder={key} bind:value={entity[key]} />
                </div>
            {/each}  
            <div class="form-actions">
                <button 
                    class="cancel-btn"
                    type="button" 
                    on:click={handleClose}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button 
                    class="save-btn"
                    type="button" 
                    on:click={updateEntity}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        {/if}
    </div>
</div>
{/if}

<style>
    .edit-btn {
        background-color: #F59E0B;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .edit-btn:hover:not(:disabled) {
        background-color: #D97706;
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
        margin-bottom: 0.5rem;
        margin-top: 0.5rem;
        color: #1D3557;
        font-weight: bold;
    }
    
    .edit-form input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
    }
    
    .form-actions {
        display: flex;
        justify-content: flex-end;
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
        background-color: #F59E0B;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .save-btn:hover:not(:disabled) {
        background-color: #D97706;
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
