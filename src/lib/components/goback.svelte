<script lang="ts">
    import { goto } from '$app/navigation';
    export let route = "/dashboard";
</script>

<button type="button" on:click={() => goto(route)} class="back-btn" aria-label="Volver">
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
    <span>Volver</span>
</button>

<style>
    .back-btn {
        background-color: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all var(--transition-fast);
        text-decoration: none;
    }

    .back-btn:hover {
        background-color: var(--bg-tertiary);
        color: #ffffff;
        border-color: var(--glass-border-hover);
        transform: translateX(-2px);
    }
</style>
