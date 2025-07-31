<script>
    import NavBar from "$lib/components/NavBar.svelte"
    import Footer from "$lib/components/Footer.svelte"
    import "../app.css";
</script>
    
<header>
    <NavBar />
</header>

<main>
    <slot />
</main>

<footer>
    <Footer />
</footer>



<style>
    header {
        height: 5vh;
        width: 100%;
        background-color: #1D3557;
        color: #FFFFFF;
        text-align: center;
        padding: 1rem;
    }
    
    main {
        min-height: calc(85vh);
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #F1FAFB;

    }
    footer {
        height: 10vh;
        width: 100%;
        background-color: #1D3557;
        color: #FFFFFF;
        text-align: center;
        padding: 1rem;
    }

</style>
