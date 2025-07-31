<script>
    export let success;
</script>

{#if success}
    <div class="success_box">
        <p>{success}</p>
    </div>
{/if}

<style>
    .success_box {
    background-color: #2A9D8F;
    color: white;
    padding: 1rem;
    border-radius: 1rem;
    width: 300px;
    margin: 0 auto;
}
</style>