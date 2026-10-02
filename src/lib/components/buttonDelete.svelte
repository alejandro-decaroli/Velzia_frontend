<script lang="ts">
    import { deleteEntity } from "$lib/utils/api.js"; 
    export let name_entity = "";
    export let route = "";
    export let id: string | number | null = null;

    let error: string | null = null;
    let showConfirm = false;
    let loading = false;
    
    function handleDelete() {
        showConfirm = true;
    }
    
    function cancelDelete() {
        showConfirm = false;
    }

    async function confirmDelete() {
        loading = true;
        error = null;
        try {
            const result = await deleteEntity(route, String(id), name_entity, loading, "");
            if (result && result.error) {
                error = String(result.error);
            } else {
                showConfirm = false;
            }
        } catch (err: any) {
            error = err.message || "Error al eliminar";
        } finally {
            loading = false;
        }
    }
</script>

<button 
    class="delete-btn-trigger" 
    aria-label="Eliminar {name_entity}" 
    on:click|preventDefault={handleDelete}
>
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
    <span>Eliminar</span>
</button>

{#if showConfirm}
    <div class="modal-overlay" role="button" tabindex="0" on:click={cancelDelete} on:keydown={(e) => e.key === 'Escape' && cancelDelete()}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="confirm-header">
                <div class="warning-avatar">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3>¿Confirmar eliminación?</h3>
            </div>
            
            <p class="confirm-message">
                Esta acción no se puede deshacer. ¿Realmente deseas eliminar este registro de <strong>{name_entity.replace('_', ' ')}</strong>?
            </p>

            {#if error}
                <div class="error-message">
                    <span>{error}</span>
                </div>
            {/if}

            <div class="confirm-actions">
                <button class="btn-cancel" on:click={cancelDelete} disabled={loading}>Cancelar</button>
                <button class="btn-danger" on:click={confirmDelete} disabled={loading}>
                    {loading ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .delete-btn-trigger {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        transition: all var(--transition-fast);
    }

    .delete-btn-trigger:hover {
        background-color: var(--color-error-glow);
        color: var(--color-error);
        border-color: var(--color-error);
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
        max-width: 420px;
        animation: scaleIn var(--transition-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .confirm-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .warning-avatar {
        background-color: var(--color-error-glow);
        color: var(--color-error);
        padding: 0.75rem;
        border-radius: 50%;
    }

    .confirm-header h3 {
        font-size: 1.2rem;
        font-weight: 700;
    }

    .confirm-message {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.925rem;
        line-height: 1.5;
        margin-bottom: 1.5rem;
    }

    .error-message {
        color: var(--color-error);
        background-color: var(--color-error-glow);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.25rem;
        font-size: 0.85rem;
        text-align: center;
    }

    .confirm-actions {
        display: flex;
        gap: 0.75rem;
        width: 100%;
    }

    .btn-cancel, .btn-danger {
        flex: 1;
        padding: 0.65rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
    }

    .btn-cancel {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
    }

    .btn-cancel:hover {
        background-color: var(--text-muted);
        border-color: var(--glass-border-hover);
    }

    .btn-danger {
        background-color: var(--color-error);
        color: white;
    }

    .btn-danger:hover {
        background-color: #dc2626;
        box-shadow: 0 4px 12px var(--color-error-glow);
    }
</style>