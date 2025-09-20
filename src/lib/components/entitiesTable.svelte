<script>
    import { fetchEntity } from "$lib/utils/api.js";
    
    export let token = "";
    export let entity = "";
    export let loading = true;
    export let error = null;
    export let data = null;
    export let entities = [];
    // Modificamos el array para incluir todas las variantes de los campos
    const standardFields = [
        "cliente", "Cliente",
        "Moneda", "moneda",
        "id", "Id", "ID",
        "caja", "Caja",
        "Visible", "visible",
        "usuario", "Usuario",
        "caja_origen", "Caja Origen",
        "caja_destino", "Caja Destino",
        "ActualizadoEn", "actualizadoEn",
        "moneda_origen", "Moneda Origen",
        "moneda_destino", "Moneda Destino",
        "eliminadoEn", "EliminadoEn"
    ];

    // Función auxiliar para normalizar las claves
    function normalizeKey(key) {
        if (!key) return '';
        return key.toLowerCase().replace(/_/g, '');
    }

    // Función para manejar la actualización después de editar/eliminar
    function handleUpdate() {
        loading, error, entities = fetchEntity(entity, entities, token, data, loading, error);
    }

    function handleDate(date) {
        return new Date(date).toLocaleDateString();
    }

</script>

<div class="table-container">
    {#if loading}
        <div class="loading">Cargando datos...</div>
    {:else if error}
        <div class="error-message">{error}</div>
        <button on:click={handleUpdate} class="retry-btn">Reintentar</button>
    {:else}
        <table class="table">
            <thead>
                <tr>
                    {#if entities.length > 0}
                        {#each Object.keys(entities[0])
                            .filter(key => !standardFields.some(field => 
                                normalizeKey(field) === normalizeKey(key)
                            ))
                            .map(key => ({
                                original: key,
                                display: key.split(/(?=[A-Z])/).join(' ')
                            }))
                            as {original, display}}
                            <th>{display.charAt(0).toUpperCase() + display.slice(1)}</th>
                        {/each}
                        <th>Acciones</th>
                    {:else}
                        <th>No hay datos disponibles</th>
                    {/if}
                </tr>
            </thead>
            <tbody>
                {#each entities as item}
                    <tr>
                        {#each Object.entries(item)
                            .filter(([key]) => !standardFields.some(field => 
                                normalizeKey(field) === normalizeKey(key)
                            ))
                            as [key, value]}
                            {#if key === "creadoEn" || key === "actualizadoEn" || key === "eliminadoEn"}
                                <td>{handleDate(value)}</td>
                            {:else}
                                <td>{value}</td>
                            {/if}
                        {/each}
                        <td class="actions">
                            <slot name="actions" {item}/>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    .table-container {
        width: 100%;
        overflow-x: auto;
        padding: 2rem;
    }

    .table {
        width: 100%;
        background-color: #F1FAFB;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        border-radius: 1rem;
        color: #1D3557;
        border-collapse: separate;
        border-spacing: 0;
    }

    .table th {
        padding: 1rem;
        background-color: #405B81;
        color: white;
        text-align: center;
        font-weight: 600;
    }

    .table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #E9ECEF;
    }

    .table tr:last-child td {
        
        border-bottom: none;
    }

    .table tr:hover td {
        background-color: rgba(69, 123, 157, 0.1);
    }

    .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #405B81;
    }

    .error-message {
        color: #E63946;
        background-color: #FFE3E3;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        text-align: center;
    }

    .retry-btn {
        background-color: #405B81;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        display: block;
        margin: 0 auto;
    }

    .retry-btn:hover {
        background-color: #1D3557;
    }

    tbody {
        color: black;
        background-color: #CDE2FF;
    }

    tbody tr td {
        color: black;
        text-align: center;
        border-bottom: 1px solid black;
        border-top: 1px solid black;
    }

</style>