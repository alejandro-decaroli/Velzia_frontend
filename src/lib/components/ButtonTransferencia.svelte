<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    let showModal = false;
    let loading = false;
    let error = "";
    let success = "";

    let cajas: any[] = [];
    let caja_origen: number | string = "";
    let caja_destino: number | string = "";
    let monto: number | string = "";
    let descripcion = "";

    $: cajaOrigenObj = cajas.find((c) => String(c.id) === String(caja_origen));
    $: cajaDestinoObj = cajas.find((c) => String(c.id) === String(caja_destino));
    $: saldoInsuficiente = cajaOrigenObj && Number(monto) > Number(cajaOrigenObj.monto);

    async function loadCajas() {
        try {
            const res = await fetch(`${API_URL}/cajas`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                cajas = data.cajas || [];
            }
        } catch (e) {
            console.error("Error al cargar cajas", e);
        }
    }

    async function openModal() {
        error = "";
        success = "";
        caja_origen = "";
        caja_destino = "";
        monto = "";
        descripcion = "";
        await loadCajas();
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function handleTransferencia() {
        if (!caja_origen || !caja_destino) {
            error = "Debe seleccionar la caja de origen y de destino";
            return;
        }

        if (String(caja_origen) === String(caja_destino)) {
            error = "La caja de origen y destino no pueden ser iguales";
            return;
        }

        if (!monto || Number(monto) <= 0) {
            error = "El monto debe ser mayor a 0";
            return;
        }

        if (saldoInsuficiente) {
            error = "La caja de origen no cuenta con saldo suficiente";
            return;
        }

        loading = true;
        error = "";

        try {
            const res = await fetch(`${API_URL}/cajas/transferencia`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    caja_origen: Number(caja_origen),
                    caja_destino: Number(caja_destino),
                    monto: Number(monto),
                    descripcion: descripcion.trim() || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    error = data.errors.map((e: any) => e.msg).join(", ");
                } else {
                    error = data.message || "Error al realizar la transferencia";
                }
                return;
            }

            dispatch("transferred");
            closeModal();
        } catch (err: any) {
            error = err.message || "Error al conectar con el servidor";
        } finally {
            loading = false;
        }
    }
</script>

<button class="btn-action transfer-trigger" on:click={openModal} title="Realizar transferencia entre cajas">
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
    <span>Realizar transferencia</span>
</button>

{#if showModal}
    <div
        class="modal-overlay"
        role="button"
        tabindex="0"
        on:click={closeModal}
        on:keydown={(e) => e.key === "Escape" && closeModal()}
    >
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <div class="header-title">
                    <div class="icon-wrap">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <h3>Realizar Transferencia</h3>
                </div>
                <button class="close-icon-btn" on:click={closeModal} aria-label="Cerrar modal">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form on:submit|preventDefault={handleTransferencia}>
                {#if error}
                    <div class="alert alert-error">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                {/if}

                <div class="form-body">
                    <div class="form-field">
                        <label for="caja_origen">Caja de origen</label>
                        <select id="caja_origen" bind:value={caja_origen} required>
                            <option value="" disabled selected>Seleccione la caja origen</option>
                            {#each cajas as caja}
                                <option value={caja.id}>
                                    {caja.nombre} (Disponible: ${Number(caja.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                                </option>
                            {/each}
                        </select>
                        {#if cajaOrigenObj}
                            <span class="field-hint">
                                Saldo disponible: <strong>${Number(cajaOrigenObj.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                            </span>
                        {/if}
                    </div>

                    <div class="form-field">
                        <label for="caja_destino">Caja de destino</label>
                        <select id="caja_destino" bind:value={caja_destino} required>
                            <option value="" disabled selected>Seleccione la caja destino</option>
                            {#each cajas as caja}
                                <option value={caja.id} disabled={String(caja.id) === String(caja_origen)}>
                                    {caja.nombre} (Saldo actual: ${Number(caja.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="monto">Monto a transferir</label>
                        <div class="input-currency">
                            <span class="currency-symbol">$</span>
                            <input
                                id="monto"
                                type="number"
                                step="0.01"
                                min="0.01"
                                bind:value={monto}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        {#if saldoInsuficiente}
                            <span class="error-hint">El monto excede el saldo de la caja de origen</span>
                        {/if}
                    </div>

                    <div class="form-field">
                        <label for="descripcion">Descripción (opcional)</label>
                        <input
                            id="descripcion"
                            type="text"
                            bind:value={descripcion}
                            placeholder="Ej: Movimiento de fondos a banco"
                            maxlength="150"
                        />
                    </div>

                    <div class="transfer-info-banner">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Las transferencias entre cajas mueven fondos internamente y no afectan los ingresos ni egresos del sistema.</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-cancel" type="button" on:click={closeModal}>Cancelar</button>
                    <button class="btn-submit" type="submit" disabled={loading || saldoInsuficiente}>
                        {loading ? "Procesando..." : "Confirmar transferencia"}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .btn-action.transfer-trigger {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.75rem 1.25rem;
        font-weight: 600;
        font-size: 0.95rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .btn-action.transfer-trigger:hover {
        background-color: rgba(99, 102, 241, 0.15);
        border-color: var(--color-brand);
        color: var(--color-brand);
        transform: translateY(-1px);
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
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .icon-wrap {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        background: rgba(99, 102, 241, 0.15);
        color: var(--color-brand);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--text-primary);
        font-weight: 700;
    }

    .close-icon-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color var(--transition-fast);
    }

    .close-icon-btn:hover {
        color: var(--text-primary);
    }

    .alert {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
    }

    .alert-error {
        background-color: var(--color-error-glow);
        border: 1px solid var(--color-error);
        color: var(--color-error);
    }

    .form-body {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin-top: 0.5rem;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-field label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .form-field select,
    .form-field input[type="text"],
    .form-field input[type="number"] {
        width: 100%;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        outline: none;
        transition: border-color var(--transition-fast);
    }

    .form-field select:focus,
    .form-field input:focus {
        border-color: var(--color-brand);
        box-shadow: 0 0 0 2px var(--color-brand-glow);
    }

    .input-currency {
        position: relative;
        display: flex;
        align-items: center;
    }

    .currency-symbol {
        position: absolute;
        left: 1rem;
        color: var(--text-muted);
        font-weight: 600;
    }

    .input-currency input {
        padding-left: 2rem !important;
    }

    .field-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .field-hint strong {
        color: var(--color-success);
    }

    .error-hint {
        font-size: 0.8rem;
        color: var(--color-error);
    }

    .transfer-info-banner {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background-color: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.25);
        color: #a5b4fc;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        line-height: 1.4;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .btn-cancel {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--glass-border);
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
        transition: background-color var(--transition-fast);
    }

    .btn-cancel:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .btn-submit {
        background-color: var(--color-brand);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 700;
        box-shadow: 0 4px 12px var(--color-brand-glow);
        transition: all var(--transition-fast);
    }

    .btn-submit:hover:not(:disabled) {
        background-color: var(--color-brand-hover);
        transform: translateY(-1px);
    }

    .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
