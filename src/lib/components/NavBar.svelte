<script>
    import Logo from "./logo.svelte";
    import { user } from "../stores/auth.js";
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { logout } from "$lib/stores/auth";
    
    let menuUser = false;    
    onMount(() => {
        addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                menuUser = false;
            }
        });
    });

    function toggleMenuUser() {
        menuUser = !menuUser;
    }

    

</script>
<nav>
    <Logo />
    {#if $user === null}
        <ul class="nav-links" class:open={menuUser} >
            <li><a href="/signup">Sign Up</a></li>
            <li><a href="/login">Login</a></li>
        </ul>
    {:else}
        <ul class="user-menu">
            <p class="user-name-user-menu">{$user?.nombre} {$user?.apellido}</p>
            <button class="menu-button-2" on:click={toggleMenuUser} on:keydown={(e) => e.key === 'Enter' && toggleMenuUser()}>
                <img src="/usuario.png" alt="icon" class="user-logo" />
            </button>
            <ul class="user-menu-items" class:open={menuUser}>
                <li class="user-name"><p>{$user?.nombre} {$user?.apellido}</p></li>
                <li><p>{$user?.email}</p></li>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/user">Profile</a></li>
                <li><button on:click={logout} >Logout</button></li>
            </ul>
        </ul>
    {/if}
</nav>

<style>
    nav {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 1rem;
        padding-right: 1rem;
        color: white;
    }

    .user-menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .menu-button-2 {
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    .user-menu-items {
        display: none;
        flex-direction: column;
        align-items: center;
        background-color: #405B81 ;
        color: white;
        border-radius: 1rem;
        list-style: none;
        margin: 0;
        padding: 1rem;
        position: absolute;
        top: 8vh;
        right: 1rem;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #1D3557;
    }

    .user-menu-items li {
        width: 100%;
        height: 100%;
        padding: 1rem;
        
    }

    .user-menu-items li a {
        text-decoration: none; 
    }

    .user-menu-items li:hover {
        color: black;
        background-color: #CDE2FF;
        border-radius: 1rem;
        transition: background-color 0.2s;
    }

    .user-menu-items li:hover a {
        color: black;
    }

    .user-menu-items li:hover button {
        color: black;
    }

    .user-menu-items button {
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
    }

    .user-menu-items.open {
        display: flex;
    }

    .user-name {
        display:none
    }

    .user-logo {
        width: 35px;
        height: auto;
    }

    .nav-links {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    /* Móviles (menú oculto por defecto) */
    @media (max-width: 350px) {

        .nav-links {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.1rem;
        }

    }

    /* Pantallas grandes (siempre visible) */
    @media (max-width: 365px) {
        .user-name-user-menu {
            display: none;
        }
        .user-name {
            display: block;
        }

    }

    a {
        color: white;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
    }

    a:hover {
        opacity: 0.8;
        text-decoration: underline;
    }
</style>

