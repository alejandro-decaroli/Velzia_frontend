<script>
    import Logo from "./logo.svelte";
    import { user } from "../stores/auth.js";
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    let menuUser = false;
    let menuOpen = false;
    
    onMount(() => {
        addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                menuUser = false;
            }
            if (!e.target.closest('.nav-links')) {
                menuOpen = false;
            }
        });
    });

    function toggleMenuUser() {
        menuUser = !menuUser;
    }

    function toggleMenuOpen() {
        menuOpen = !menuOpen;
    }

    // Cierra el menú si se redimensiona a más de 500px
    if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(min-width: 500px)');
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                menuOpen = false;
            }
        });
    }

    async function logout() {
        user.set(null);
        await goto("/");
    }

</script>
<nav>
    <Logo />
    {#if $user === null}
        <button class="menu-button-1" on:click={toggleMenuOpen} on:keydown={(e) => e.key === 'Enter' && toggleMenuOpen()}>
            <img src="/usuario.png" alt="icon" class="user-logo" />
        </button>
        <ul class:open={menuOpen} class="nav-links">
            <li><a href="/signup">Sign Up</a></li>
            <li><a href="/login">Login</a></li>
        </ul>
    {:else}
        <ul class="user-menu">
            <p class="user-name-user-menu">{$user?.nombre} {$user?.apellido}</p>
            <button class="menu-button-2" on:click={toggleMenuUser} on:keydown={(e) => e.key === 'Enter' && toggleMenuUser()}>
                <img src="/usuario.png" alt="icon" class="user-logo" />
            </button>
            <div class="user-menu-items" class:open={menuUser}>
                <li class="user-name"><p>{$user?.nombre} {$user?.apellido}</p></li>
                <li><p>{$user?.email}</p></li>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/user">Profile</a></li>
                <li><button on:click={logout} >Logout</button></li>
            </div>
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

    .nav-links {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .user-menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .menu-button-1 {
        display: none;
        background-color: transparent;
        border: none;
        cursor: pointer;
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
        gap: 1rem;
        background-color: #405B81 ;
        color: white;
        border-radius: 1rem;
        list-style: none;
        margin: 0;
        padding: 1rem;
        gap: 1.5rem;
        position: absolute;
        top: 8vh;
        right: 1rem;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #1D3557;
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

    /* Móviles (menú oculto por defecto) */
    @media (max-width: 350px) {

        .nav-links {
            display: none;
        }

        .nav-links.open {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            background-color: #405B81 ;
            color: white;
            border-radius: 1rem;
            list-style: none;
            margin: 0;
            padding: 1rem;
            gap: 1.5rem;
            position: absolute;
            top: 8vh;
            right: 1rem;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border: 1px solid #1D3557;
        }

        .menu-button-1 {
            display: block;
        }
    }

    @media (min-width: 350px) {
        .menu-button-1 {
            display: none;
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

