<script lang="ts">
    import type { FieldConfig } from "$lib/utils/entityConfig";

    export let fields: FieldConfig = {};
    export let formData: Record<string, any> = {};
    
    // Select options datasets
    export let cajas: any[] = [];
    export let clientes: any[] = [];
    export let productos: any[] = [];
    export let rol: string[] = ["Admin", "Empleado"]; // Default placeholder if roles exist
    export let movimiento: string[] = ["ingreso", "egreso"];

    function getLabel(key: string) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    }
</script>

<div class="entity-form-fields">
    {#each Object.entries(fields) as [fieldName, fieldType]}
        <div class="form-field">
            <label for={fieldName}>{getLabel(fieldName)}</label>
            
            {#if fieldType === "select"}
                <select id={fieldName} name={fieldName} bind:value={formData[fieldName]}>
                    <option value="" disabled selected>Seleccione una opción</option>
                    
                    {#if fieldName === "caja" || fieldName === "caja_origen" || fieldName === "caja_destino"}
                        {#each cajas as option}
                            <option value={option.id}>{option.nombre}</option>
                        {/each}
                    {:else if fieldName === "cliente"}
                        {#each clientes as option}
                            <option value={option.id}>{option.nombre} {option.apellido}</option>
                        {/each}
                    {:else if fieldName === "rol"}
                        {#each rol as option}
                            <option value={option}>{option}</option>
                        {/each}
                    {:else if fieldName === "movimiento"}
                        {#each movimiento as option}
                            <option value={option}>{option}</option>
                        {/each}
                    {:else if fieldName === "producto"}
                        {#each productos as option}
                            <option value={option.id}>{option.nombre}</option>
                        {/each}
                    {/if}
                </select>
            {:else}
                <input 
                    type={fieldType} 
                    id={fieldName} 
                    name={fieldName} 
                    bind:value={formData[fieldName]} 
                    placeholder={`Ingrese ${getLabel(fieldName).toLowerCase()}`}
                    required
                />
            {/if}
        </div>
    {/each}
</div>

<style>
    .entity-form-fields {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        text-align: left;
    }

    label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: 0.025em;
    }

    select, input {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: var(--bg-primary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: all var(--transition-fast);
    }

    select:focus, input:focus {
        border-color: var(--color-brand);
        box-shadow: 0 0 0 3px var(--color-brand-glow);
        outline: none;
    }

    select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        background-size: 1.25rem;
        padding-right: 2.5rem;
    }
</style>
