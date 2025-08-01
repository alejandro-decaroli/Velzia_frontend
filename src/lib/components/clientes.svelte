<!-- <script>
    let clientes = {};
    let user = $user; 

    async function fetchClientes() {
        const response = await fetch("http://localhost:3000/clientes", {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        });
        clientes = await response.json();
    }

    fetchClientes();
</script>

<div class="clientes">
    <h2>Clientes</h2>
    {#if $user}
        {#each clientes as cliente}
            <p>{cliente.nombre}</p>
        {/each}
    {/if}
</div>

<style>
    .clientes {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        background-color: #1D3557;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        height: 250px;
        margin: 0 auto;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        overflow-y: auto;
    }

    .clientes h2 {
        font-weight: bold;
    }
</style> -->