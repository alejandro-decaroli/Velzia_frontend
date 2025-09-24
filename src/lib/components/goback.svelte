<script>
    import { goto } from "$app/navigation";
</script>

<button onclick={() => goto("/dashboard")}>
    <img src="/goback_1.png" alt="icon">
</button>

<style>
    button {
        position: absolute;
        top: 5rem;
        left: 2rem;
        display: flex;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
</style>
