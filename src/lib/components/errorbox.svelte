<script>
    export let validationErrors = [];
    export let error = "";
</script>

{#if validationErrors.length > 0}
    <div class="error_box">
        <strong>Revisá los siguientes errores:</strong>
        <ul style="list-style: none;">
            {#each validationErrors as err}
                <li style="margin: 0.5rem 0;">{err}</li>
            {/each}
        </ul>
    </div>
{/if}

{#if error}
    <div class="error_box">
        <strong>Algo salio mal:</strong>
        <p style="margin: 0.5rem 0;">{error}</p>
    </div>
{/if}

<style>
    .error_box {
        background-color: #E63946;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: auto;
        margin: 0 auto;
    }
</style>
