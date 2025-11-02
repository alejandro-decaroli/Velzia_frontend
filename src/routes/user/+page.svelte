<script>
    import { checkUser, user } from "$lib/stores/auth.js";
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte"
    let error = "";
    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
    });



</script>
<GoBack/>
<div class="user-profile-container">
    <h1>Hola {$user?.nombre} {$user?.apellido}, bienvenido/a a tu perfil</h1>
    <div class="user-info">
        <h2>Tus datos</h2>
        <p>Nombre: {$user?.nombre}</p>
        <p>Apellido: {$user?.apellido}</p>
        <p>Email: {$user?.email}</p>
    </div>
</div>

<style>
    .user-profile-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        background-color: #405B81;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
    }
    
    .user-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    button {
        background-color: #A2C9FF;
        color: #1D3557;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: background-color 0.2s;
    }
    
    button:hover {
        background-color: #1D3557;
        color: white;
    }
    
</style>