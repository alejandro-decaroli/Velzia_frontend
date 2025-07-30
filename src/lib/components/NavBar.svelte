<script>
    let menuOpen = false;

    function toggleMenu() {
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
</script>

<nav>
    <div class="logo-container">
        <img src="/escudo.png" alt="logo" class="logo">
        <h1><a href="/">Velzia</a></h1>
    </div>

    <div 
        class="menu-container" 
        on:click={toggleMenu} 
        role="button" 
        aria-label="Menú" 
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && toggleMenu()}>
        <img src="/avatar.png" alt="Avatar" class="menu" />
    </div>

    <ul class="nav-links" class:open={menuOpen}>
        <li><a href="/">Home</a></li>
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/login">Login</a></li>
    </ul>
</nav>


<style>
    nav {
        width: 100%;
        height: 5vh;
        background-color: rgb(63, 130, 255);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 1rem;
        padding-right: 1rem;
        color: white;
    }

    .logo-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    h1 {
        font-weight: bold;
        text-decoration: none;
    }

    .logo-container h1 a {
        text-decoration: none;
        color: black;
    }

    .logo {
        width: 30px;
        height: auto;
    }

    /* Móviles (menú oculto por defecto) */
    @media (max-width: 499px) {
        .nav-links {
            display: none;
            flex-direction: column;
            background-color: rgb(118, 166, 255);
            color: black;
            border-radius: 1rem;
            list-style: none;
            margin: 0;
            padding: 1rem;
            gap: 1.5rem;
            position: absolute;
            top: 6vh;
            right: 1rem;
        }

        .nav-links.open {
            display: flex;
        }
    }

    /* Pantallas grandes (siempre visible) */
    @media (min-width: 500px) {
        .nav-links {
            display: flex !important;
            color: black;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 1.5rem;
            position: static;
            background: none;
        }
    }

    @media (min-width: 500px) {
        .menu-container {
            display: none;
        }
    }

    .menu {
        width: 35px;
        height: auto;
    }

    a {
        color: black;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
    }

    a:hover {
        opacity: 0.8;
        text-decoration: underline;
    }
</style>

