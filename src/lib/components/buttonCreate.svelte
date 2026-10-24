<script lang="ts">
    import { createEntity, registrarDetalle } from "$lib/utils/api.js";
    import EntityForm from "./EntityForm.svelte";
    
    export let name_entity = "";
    export let route = "";
    export let fields = {};
    
    // Select options props
    export let cajas: any[] = [];
    export let clientes: any[] = [];
    export let productos: any[] = [];
    export let proveedores: any[] = [];
    export let pedidos: any[] = [];
    export let rol: string[] = [];
    export let movimiento: string[] = [];
    
    export let id_venta_2 = "";

    let loading = false;
    let showModal = false;
    let formData: Record<string, any> = {};
    let error = "";

    function openModal() {
        formData = {}; 
        error = "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function handleCreateEntity() {
        loading = true;
        error = "";
        try {
            let result;
            if (name_entity === "detalle") {
                result = await registrarDetalle(id_venta_2, false, formData, loading, error);
            } else {
                result = await createEntity(route, formData, closeModal, error, loading, name_entity);
            }
            if (result && result.error) {
                error = String(result.error);
            }
        } catch (err: any) {
            error = err.message || "Error al realizar la creación";
        } finally {
            loading = false;
        }
    }
</script>

<button 
    class="create-btn-trigger" 
    aria-label="Crear {name_entity}" 
    on:click={openModal}
>
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    <span>Crear {name_entity.replace('_', ' ')}</span>
</button>

{#if showModal}
    <div 
        class="modal-overlay" 
        role="button" 
        tabindex="0" 
        on:click={closeModal} 
        on:keydown={(e) => e.key === 'Escape' && closeModal()}
    >
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <h3>Crear {name_entity.replace('_', ' ')}</h3>
                <button class="close-icon-btn" on:click={closeModal} aria-label="Cerrar modal">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <form on:submit|preventDefault={handleCreateEntity}>
                {#if error}
                    <div class="error-message">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>{error}</span>
                    </div>
                {/if}
                
                <div class="form-body">
                    <EntityForm 
                        {fields} 
                        bind:formData 
                        {cajas} 
                        {clientes} 
                        {productos} 
                        {proveedores} 
                        {pedidos} 
                        {rol} 
                        {movimiento} 
                    />
                </div>
                
                <div class="form-actions">
                    <button class="btn-cancel" type="button" on:click={closeModal}>Cancelar</button>
                    <button class="btn-submit" type="submit" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .create-btn-trigger {
        background-color: var(--color-brand);
        color: white;
        border-radius: var(--radius-md);
        padding: 0.75rem 1.5rem;
        font-weight: 700;
        font-size: 0.95rem;
        box-shadow: 0 4px 12px var(--color-brand-glow);
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .create-btn-trigger:hover {
        background-color: var(--color-brand-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(11, 15, 25, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn var(--transition-fast) ease-out;
    }

    .modal-content {
        background-color: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        padding: 2rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        width: 90%;
        max-width: 480px;
        animation: scaleIn var(--transition-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .modal-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        text-transform: capitalize;
    }

    .close-icon-btn {
        background: none;
        color: var(--text-secondary);
        padding: 0.25rem;
        border-radius: 50%;
        transition: all var(--transition-fast);
    }

    .close-icon-btn:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }

    .form-body {
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 0.25rem;
        margin-bottom: 1.5rem;
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-error);
        background-color: var(--color-error-glow);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.25rem;
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        border-top: 1px solid var(--glass-border);
        padding-top: 1.25rem;
    }

    .btn-cancel {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 0.65rem 1.25rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
    }

    .btn-cancel:hover {
        background-color: var(--text-muted);
        border-color: var(--glass-border-hover);
    }

    .btn-submit {
        background-color: var(--color-brand);
        color: white;
        padding: 0.65rem 1.5rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 700;
        box-shadow: 0 4px 12px var(--color-brand-glow);
    }

    .btn-submit:hover:not(:disabled) {
        background-color: var(--color-brand-hover);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
    }
</style>