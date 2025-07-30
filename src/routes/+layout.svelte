<script>
    import NavBar from "$lib/components/NavBar.svelte"
    import Footer from "$lib/components/Footer.svelte"
    import "../app.css";
</script>

<NavBar />

<main>
    <slot />
</main>

<Footer />

<style>
    main {
        min-height: calc(100vh - 10rem);
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
