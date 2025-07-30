<script>
    let email = "";
    let contrasenia = "";
    let error = "";
    let success = "";

    async function handleLogin(event) {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    contrasenia
                })
            });

            if (!response.ok) {
                const err = await response.json();
                error = err.message || "Error al iniciar sesión";
                success = "";
            } else {
                const data = await response.json();
                success = "Inicio de sesión exitoso";
                error = "";

                // Aquí podrías guardar el token si el backend lo devuelve
                // localStorage.setItem("token", data.token);

                console.log("Respuesta del backend:", data);
            }
        } catch (e) {
            error = "No se pudo conectar al servidor";
            success = "";
            console.error(e);
        }
    }
</script>


<form onsubmit={handleLogin}>
    <label for="email">Email:</label>
    <input type="email" id="email" bind:value={email} required />

    <label for="password">Password:</label>
    <input type="password" id="password" bind:value={contrasenia} required />

    <button type="submit">Login</button>
</form>

{#if error}
    <p style="color: red">{error}</p>
{/if}

{#if success}
    <p style="color: green">{success}</p>
{/if}


<style>
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
</style>