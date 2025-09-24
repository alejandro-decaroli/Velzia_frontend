<script>
    import { onMount } from 'svelte';
    import { checkUser } from '$lib/stores/auth.js';
    let error = null;
    onMount(() => {
        checkUser(error);
    });
</script>

<h1>HOLA BABY SOY UN DETALLE</h1>