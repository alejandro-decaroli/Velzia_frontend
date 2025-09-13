<script>
    import NavBar from "$lib/components/NavBar.svelte"
    import "../app.css";
</script>

<header>
    <NavBar />
</header>

<main>
    <slot />
</main>

<footer>
    <p>2025 Alejandro Decaroli, Gonzalo Zinni. Todos los derechos reservados</p>
    <p>Desarrollado por Alejandro Decaroli y Gonzalo Zinni</p>
    <p>Version 1.0.0</p>
</footer>


<style>
    header {
        height: 7vh;
        width: 100%;
        background-color: #1D3557;
        color: #FFFFFF;
        text-align: center;
    }
    
    main {
        height: 78vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #F1FAFB;

    }
    footer {
        display: flex;
        flex-direction: column;
        height: 15vh;
        width: 100%;
        background-color: #1D3557;
        color: #FFFFFF;
        text-align: center;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }

</style>
