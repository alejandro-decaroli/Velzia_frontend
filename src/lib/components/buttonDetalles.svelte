<script lang="ts">
    import { goto } from "$app/navigation";
    export let id_venta: string | number;
</script>

<button 
    class="detalles-btn" 
    on:click={() => goto(`/detalles/${id_venta}`)}
    aria-label="Gestionar detalles"
>
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    <span>Detalles</span>
</button>

<style>
    .detalles-btn {
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

    .detalles-btn:hover {
        background-color: var(--color-brand-glow);
        color: var(--color-brand);
        border-color: var(--color-brand);
    }
</style>
