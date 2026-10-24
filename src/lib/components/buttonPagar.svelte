<script lang="ts">
    import { loadEntity, pagarEntity } from "$lib/utils/api.js";
    
    export let name_entity = "";
    export let route = "";
    export let id: string | number | null = null;
    export let cajas: any[] = [];

    let entity: any = null;
    let loading = false;
    let error: string | null = null;
    let showForm = false;

    let montoPagar = "";
    let cajaId = "";

    async function handleEditClick() {
        loading = true;
        error = null;
        try {
            const result = await loadEntity(route, String(id), name_entity, showForm, null, loading, "");
            if (result && result.error) {
                error = String(result.error);
            } else if (result && result.entity) {
                entity = result.entity;
                showForm = true;
                const totalAmount = entity.total !== undefined ? entity.total : (entity.monto !== undefined ? entity.monto : 0);
                montoPagar = String(totalAmount);
                cajaId = cajas.length > 0 ? cajas[0].id : "";
            }
        } catch (err: any) {
            error = err.message || "Error al cargar";
        } finally {
            loading = false;
        }
    }

    async function handlePay() {
        if (!entity) return;
        loading = true;
        error = null;
        try {
            entity.monto_pagar = montoPagar;
            entity.caja = cajaId;
            const result = await pagarEntity(route, String(id), name_entity, showForm, entity, loading, "");
            if (result && result.error) {
                error = String(result.error);
            } else {
                showForm = false;
            }
        } catch (err: any) {
            error = err.message || "Error al procesar el pago";
        } finally {
            loading = false;
        }
    }

    function handleClose() {
        showForm = false;
    }
</script>

<button 
    class="pay-btn-trigger" 
    on:click={handleEditClick}
    disabled={loading}
    aria-label="Pagar {name_entity}"
>
    {#if loading}
        <span class="mini-spinner"></span>
    {:else}
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Pagar</span>
    {/if}
</button>

{#if showForm && entity}
    <div 
        class="modal-overlay" 
        role="button" 
        tabindex="0" 
        on:click={handleClose}
        on:keydown={(e) => e.key === 'Escape' && handleClose()}
    >
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <h3>Registrar Pago de {name_entity.replace('_', ' ')}</h3>
                <button class="close-icon-btn" on:click={handleClose} aria-label="Cerrar modal">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <form on:submit|preventDefault={handlePay}>
                {#if error}
                    <div class="error-message">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>{error}</span>
                    </div>
                {/if}
                
                <div class="form-body">
                    <div class="form-field">
                        <label for="pay-monto">Monto a pagar (Pago total único)</label>
                        <input 
                            type="number" 
                            id="pay-monto" 
                            bind:value={montoPagar} 
                            readonly 
                            class="readonly-input"
                            required 
                        />
                        <span class="info-note">No se aceptan pagos en cuotas. El pago debe cubrir el monto total.</span>
                    </div>
                    
                    <div class="form-field">
                        <label for="pay-caja">Caja de destino / origen</label>
                        <select id="pay-caja" bind:value={cajaId} required>
                            {#each cajas as option}
                                <option value={option.id}>{option.nombre}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn-cancel" type="button" on:click={handleClose}>Cancelar</button>
                    <button class="btn-submit" type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Confirmar Pago'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .pay-btn-trigger {
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

    .pay-btn-trigger:hover {
        background-color: var(--color-success-glow);
        color: var(--color-success);
        border-color: var(--color-success);
    }

    .mini-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
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
        max-width: 440px;
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
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
    }

    label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    input, select {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: var(--bg-primary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    .readonly-input {
        background-color: rgba(255, 255, 255, 0.05);
        cursor: not-allowed;
        color: var(--text-secondary);
    }

    .info-note {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }

    select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        background-size: 1.25rem;
        padding-right: 2.5rem;
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-error);
        background-color: var(--color-error-glow);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.25rem;
        font-size: 0.875rem;
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
        background-color: var(--color-success);
        color: white;
        padding: 0.65rem 1.5rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 700;
        box-shadow: 0 4px 12px var(--color-success-glow);
    }

    .btn-submit:hover:not(:disabled) {
        background-color: #059669;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
    }
</style>
