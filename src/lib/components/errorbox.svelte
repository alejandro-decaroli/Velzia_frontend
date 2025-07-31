<script>
    export let validationErrors;
    export let error;
</script>

{#if validationErrors.length > 0}
    <div class="error_box">
        <strong>Revisá los siguientes errores:</strong>
        <ul>
            {#each validationErrors as err}
                <li>{err}</li>
            {/each}
        </ul>
    </div>
{/if}

{#if error}
    <div class="error_box">
        <strong>Algo salio mal:</strong>
        <p>{error}</p>
    </div>
{/if}

<style>
    .error_box {
        background-color: #E63946;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        margin: 0 auto;
    }
</style>
