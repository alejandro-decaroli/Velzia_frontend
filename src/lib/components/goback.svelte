<script>
    import { goto } from "$app/navigation";
</script>

<button onclick={() => goto("/dashboard")}>
    <img src="/goback_1.png" alt="icon">
</button>

<style>
    button {
        display: flex;
        margin-top: 1rem;
        margin-left: 1rem;
        align-self: flex-start;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
</style>
