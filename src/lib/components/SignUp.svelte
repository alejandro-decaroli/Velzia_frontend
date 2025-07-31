<script>
    let nombre = "";
    let apellido = "";
    let email = "";
    let contrasenia = "";
    let error = "";
    let validationErrors = [];
    let success = "";

    async function handleSignUp(event) {
        event.preventDefault();
        error = "";
        success = "";
        validationErrors = [];

        try {
            const response = await fetch("http://localhost:3000/usuarios/sing-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre, apellido, email, contrasenia })  // ¡nombre del campo correcto!
            });

            const data = await response.json();

            if (!response.ok) {
                // Si viene un array de errores de validación
                if (data.errors && Array.isArray(data.errors)) {
                    validationErrors = data.errors.map(e => e.msg);
                } else {
                    error = data.message || "Error al crear el usuario";
                }
                return;
            }

            // Si todo salió bien
            validationErrors = [];
            error = "";
            success = "Sign Up exitoso";
            console.log("Sign Up exitoso:", data);
        } catch (e) {
            error = "No se pudo conectar al servidor";
            console.error(e);
        }
    }

    function clearMessages() {
        error = "";
        validationErrors = [];
        success = "";
    }
</script>


<div class="sign_in_container">
<form onsubmit={handleSignUp} onreset={clearMessages}>

    <label for="name">Name:</label>
    <input type="text" id="name" bind:value={nombre} required />

    <label for="last_name">Last Name:</label>
    <input type="text" id="last_name" bind:value={apellido} required />

    <label for="email">Email:</label>
    <input type="email" id="email" bind:value={email} required />

    <label for="password">Password:</label>
    <input type="password" id="password" bind:value={contrasenia} required />

    <button type="submit">Sign Up</button>
</form>

{#if error}
    <div class="error_box">
        <strong>Algo salio mal:</strong>
        <p>{error}</p>
    </div>
{/if}

{#if validationErrors.length > 0}
    <div class="error_box">
        <strong>Algo salio mal:</strong>
        <ul style="list-style: none;">
            {#each validationErrors as error}
                <li style="text-decoration: none;">{error}</li>
            {/each}
        </ul>
    </div>
{/if}

{#if success}
    <div class="success_box">
        <p>{success}</p>
    </div>
{/if}
</div>

<style>
    .sign_in_container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        height: 100vh;
        gap: 1rem;
    }
    
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background-color: rgb(63, 130, 255);
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        margin: 0 auto;
    }

    label {
        font-weight: bold;
    }

    input {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
    }

    button {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        background-color: white;
        color: rgb(63, 130, 255);
        font-weight: bold;
    }

    .error_box {
        background-color: red;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        margin: 0 auto;
    }

    .success_box {
        background-color: green;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        margin: 0 auto;
    }
</style>