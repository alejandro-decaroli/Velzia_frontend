<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    let showModal = false;
    let loading = false;
    let error = "";

    let cajas: any[] = [];
    let caja_id: number | string = "";
    let monto_fisico: number | string = "";
    let descripcion = "";

    $: cajaSeleccionada = cajas.find((c) => String(c.caja_id || c.id) === String(caja_id));
    $: montoSistema = cajaSeleccionada ? Number(cajaSeleccionada.monto_sistema ?? cajaSeleccionada.monto ?? 0) : 0;
    $: montoFisicoNum = monto_fisico !== "" ? Number(monto_fisico) : null;
    $: diferencia = montoFisicoNum !== null ? Number((montoFisicoNum - montoSistema).toFixed(2)) : null;

    async function loadCajas() {
        try {
            const res = await fetch(`${API_URL}/cajas/conciliacion`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                cajas = data.conciliacion || [];
            }
        } catch (e) {
            console.error("Error al cargar datos de conciliación", e);
        }
    }

    async function openModal() {
        error = "";
        caja_id = "";
        monto_fisico = "";
        descripcion = "";
        await loadCajas();
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function handleConciliacion() {
        if (!caja_id) {
            error = "Debe seleccionar una caja para conciliar";
            return;
        }

        if (monto_fisico === "" || Number(monto_fisico) < 0) {
            error = "El monto físico debe ser un número mayor o igual a 0";
            return;
        }

        loading = true;
        error = "";

        try {
            const res = await fetch(`${API_URL}/cajas/conciliacion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    caja_id: Number(caja_id),
                    monto_fisico: Number(monto_fisico),
                    descripcion: descripcion.trim() || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    error = data.errors.map((e: any) => e.msg).join(", ");
                } else {
                    error = data.message || "Error al realizar la conciliación";
                }
                return;
            }

            dispatch("reconciled");
            closeModal();
        } catch (err: any) {
            error = err.message || "Error al conectar con el servidor";
        } finally {
            loading = false;
        }
    }
</script>

<button class="btn-action reconcile-trigger" on:click={openModal} title="Realizar conciliación de saldos">
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
    <span>Realizar conciliación</span>
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3>Realizar Conciliación</h3>
                </div>
                <button class="close-icon-btn" on:click={closeModal} aria-label="Cerrar modal">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form on:submit|preventDefault={handleConciliacion}>
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
                        <label for="caja_id">Caja a conciliar</label>
                        <select id="caja_id" bind:value={caja_id} required>
                            <option value="" disabled selected>Seleccione una caja</option>
                            {#each cajas as caja}
                                <option value={caja.caja_id || caja.id}>
                                    {caja.nombre} (Sistema: ${Number(caja.monto_sistema ?? caja.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                                </option>
                            {/each}
                        </select>
                    </div>

                    {#if cajaSeleccionada}
                        <div class="system-balance-card">
                            <span class="label">Monto actual según el sistema:</span>
                            <span class="value">${montoSistema.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    {/if}

                    <div class="form-field">
                        <label for="monto_fisico">Monto real físico</label>
                        <div class="input-currency">
                            <span class="currency-symbol">$</span>
                            <input
                                id="monto_fisico"
                                type="number"
                                step="0.01"
                                min="0"
                                bind:value={monto_fisico}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <span class="field-hint">Ingrese el total de dinero real contado en la caja</span>
                    </div>

                    {#if diferencia !== null && cajaSeleccionada}
                        <div class="diff-card {diferencia > 0 ? 'diff-positive' : diferencia < 0 ? 'diff-negative' : 'diff-neutral'}">
                            <div class="diff-header">
                                <span class="diff-title">Diferencia calculada:</span>
                                <strong class="diff-value">
                                    {diferencia > 0 ? `+$${diferencia.toFixed(2)}` : diferencia < 0 ? `-$${Math.abs(diferencia).toFixed(2)}` : '$0.00'}
                                </strong>
                            </div>
                            <p class="diff-explanation">
                                {#if diferencia > 0}
                                    Sobrante detectado. Se creará un <strong>MovF de Ingreso</strong> con categoría <strong>"Ajuste"</strong> por ${diferencia.toFixed(2)}.
                                {:else if diferencia < 0}
                                    Faltante detectado. Se creará un <strong>MovF de Egreso</strong> con categoría <strong>"Ajuste"</strong> por ${Math.abs(diferencia).toFixed(2)}.
                                {:else}
                                    El monto físico coincide con el sistema. No se requiere crear movimiento de ajuste.
                                {/if}
                            </p>
                        </div>
                    {/if}

                    <div class="form-field">
                        <label for="descripcion">Descripción (opcional)</label>
                        <input
                            id="descripcion"
                            type="text"
                            bind:value={descripcion}
                            placeholder="Ej: Arqueo de caja al cierre de jornada"
                            maxlength="150"
                        />
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-cancel" type="button" on:click={closeModal}>Cancelar</button>
                    <button class="btn-submit" type="submit" disabled={loading || !caja_id || monto_fisico === ""}>
                        {loading ? "Procesando..." : "Confirmar ajuste y conciliación"}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .btn-action.reconcile-trigger {
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

    .btn-action.reconcile-trigger:hover {
        background-color: rgba(16, 185, 129, 0.15);
        border-color: var(--color-success);
        color: var(--color-success);
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
        background: rgba(16, 185, 129, 0.15);
        color: var(--color-success);
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

    .system-balance-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(30, 41, 66, 0.6);
        border: 1px dashed var(--glass-border);
        padding: 0.85rem 1rem;
        border-radius: var(--radius-md);
    }

    .system-balance-card .label {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .system-balance-card .value {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
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

    .diff-card {
        padding: 0.9rem 1.1rem;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.9rem;
    }

    .diff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .diff-title {
        font-weight: 600;
    }

    .diff-value {
        font-size: 1.1rem;
        font-weight: 800;
    }

    .diff-explanation {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .diff-positive {
        background-color: var(--color-success-glow);
        border: 1px solid var(--color-success);
        color: var(--color-success);
    }

    .diff-negative {
        background-color: var(--color-error-glow);
        border: 1px solid var(--color-error);
        color: var(--color-error);
    }

    .diff-neutral {
        background-color: rgba(148, 163, 184, 0.1);
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: var(--text-secondary);
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
