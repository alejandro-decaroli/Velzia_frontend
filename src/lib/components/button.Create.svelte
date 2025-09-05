<script>
    import { user } from "$lib/stores/auth.js";
    
    export let entity = "";
    export let route = "";
    
    let showConfirm = false;
    
    async function createEntity() {
        try {
            const response = await fetch(`http://localhost:3000/${route}/create`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${$user?.token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (response.ok) {
                // Recargar la página después de crear
                window.location.reload();
            } else {
                console.error(`Error al crear ${entity}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    
    function handleCreate() {
        showConfirm = true;
    }
    
    function cancelCreate() {
        showConfirm = false;
    }
    
</script>

<button 
    class="create" 
    aria-label="Crear {entity}" 
    on:click|preventDefault={handleCreate}
>
    Crear {entity}
</button>

{#if showConfirm}
    <div class="confirm-overlay">
        <div class="confirm-dialog">
            <p>¿Estás seguro de que deseas crear {entity}?</p>
            <div class="button-group">
                <button 
                    class="confirm-button" 
                    on:click|preventDefault={createEntity}
                >
                    Sí, crear
                </button>
                <button 
                    class="cancel-button" 
                    on:click|preventDefault={cancelCreate}
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

    .create {
        background-color: #405B81;
        color: white;
    }
    
    .create:hover {
        background-color: #1D3557;
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