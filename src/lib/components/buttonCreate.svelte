<script>
    import { createEntity } from "$lib/utils/api.js";
    
    export let name_entity = "";
    export let route = "";
    export let fields = {};
    export let options = {};
    export let monedas = {};
    export let cajas = {};
    export let clientes = {};
    export let rol = [];

    let data = null;
    let loading = false;
    let showModal = false;
    let formData = {};
    let error = "";

    function openModal() {
        formData = {}; // Reset form data when opening
        error = "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function handleCreateEntity() {
        let result = await createEntity(route, formData, closeModal, error, loading, name_entity);
        error = result.error;
    }

</script>

<button 
    class="create" 
    aria-label="Crear {name_entity}" 
    on:click={openModal}
>
    Crear {name_entity}
</button>

{#if showModal}
    <div class="modal-overlay" role="button" tabindex="0" on:click={closeModal} on:keydown={(e) => e.key === 'Enter' && closeModal()}>
        <div class="modal-content" on:click|stopPropagation>
            <form class="create_form" on:submit|preventDefault={handleCreateEntity}>
                <h3>Crear {name_entity}</h3>
                {#if error}
                    <div class="error-message">{error}</div>
                {/if}
                {#each Object.entries(fields) as [fieldName, fieldType]}
                    <label for={fieldName}>{fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}</label>
                    {#if fieldType === "select"}
                        <select id={fieldName} name={fieldName} bind:value={formData[fieldName]}>
                            {#if fieldName === "moneda" && monedas.length > 0}
                                {#each monedas as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {:else if fieldName === "caja" && cajas.length > 0}
                                {#each cajas as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {:else if fieldName === "cliente" && clientes.length > 0}
                                {#each clientes as option}
                                    <option value={option.id}>{option.nombre + " " + option.apellido}</option>
                                {/each}
                            {:else if fieldName === "rol" && rol.length > 0}
                                {#each rol as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            {:else}
                                {#each options as option}
                                    <option value={option.id}>{option.nombre}</option>
                                {/each}
                            {/if}
                        </select>
                        {:else}
                            <input type={fieldType} id={fieldName} name={fieldName} bind:value={formData[fieldName]} placeholder="Ingrese {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}">
                        {/if}
                {/each}
                <div class="form-actions">
                    <button class="create-btn" type="submit">Crear</button>
                    <button class="cancel-btn" type="button" on:click={closeModal}>Cancelar</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>

    select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }

    h3 {
        align-self: center;
        margin-bottom: 1rem;
        color: #1D3557;
        font-size: 1.1rem;
    }

    .create_form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        min-width: 300px;
        max-width: 500px;
    }
    
    .create_form label {
        display: block;
        text-align: left;
        margin-top: 1rem;
        color: #1D3557;
        font-weight: bold;
    }
    
    .create_form input {
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
        color: red;
        background-color: #ffebee;
        border: 1px solid red;
        padding: 0.5rem;
        border-radius: 4px;
    }

    .create {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        display: block;
        margin: 0 auto;
    }

    .create:hover {
        background-color: #1D3557;
    }

    .create:active {
        transform: scale(0.95);
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

    .create-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .create-btn:hover:not(:disabled) {
        background-color: #1D3557;
    }

    .create-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

</style>