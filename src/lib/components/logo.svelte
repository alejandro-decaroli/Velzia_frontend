<script>
    import { goto } from "$app/navigation";
</script>

<div class="logo-container" onclick={() => goto("/")} onkeydown={(e) => e.key === 'Enter' && goto("/")} role="button" tabindex="0" aria-label="Logo">
    <img src="velzia_name.png" alt="icon">
</div>

<style>
    .logo-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .logo-container:hover {
        cursor: pointer;
    }

    img {
        width: 200px;
        height: auto;
    }
</style>