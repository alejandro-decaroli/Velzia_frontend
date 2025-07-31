<script>
    let success = "";
	let email = "";
	let contrasenia = "";
	let error = "";
	let validationErrors = [];

	function validarFormulario() {
		const errores = [];

		if (!email) {
			errores.push("El email es requerido.");
		} else if (!/^\S+@\S+\.\S+$/.test(email)) {
			errores.push("El email no tiene un formato válido.");
		}

		if (!contrasenia) {
			errores.push("La contraseña es requerida.");
		} else if (contrasenia.length < 6) {
			errores.push("La contraseña debe tener al menos 6 caracteres.");
		}

		return errores;
	}

	async function handleLogin(event) {
		event.preventDefault(); // evitar el envío automático

		// Validación del lado del cliente
		const errores = validarFormulario();
		if (errores.length > 0) {
			validationErrors = errores;
			error = "";
			return;
		}

		// Si pasa la validación del cliente, hacemos fetch
		try {
			const response = await fetch("http://localhost:3000/usuarios/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email, contrasenia })
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors && Array.isArray(data.errors)) {
					validationErrors = data.errors.map((e) => e.msg);
				} else {
					error = data.message || "Error al iniciar sesión";
				}
				return;
			}

			validationErrors = [];
			error = "";
			alert("Inicio de sesión exitoso"); // o navegás a otra ruta
		} catch (e) {
			error = "No se pudo conectar al servidor";
		}
	}
</script>

<div class="login_container">

    <form on:submit={handleLogin}>
        <label for="email">Email:</label>
        <input
            type="email"
            id="email"
            bind:value={email}
            on:input={() => (validationErrors = [])}
        />

        <label for="contrasenia">Contraseña:</label>
        <input
            type="password"
            id="contrasenia"
            bind:value={contrasenia}
            on:input={() => (validationErrors = [])}
        />

        <button type="submit">Login</button>
    </form>

    {#if validationErrors.length > 0}
        <div class="error_box">
            <strong>Revisá los siguientes errores:</strong>
            <ul>
                {#each validationErrors as err}
                    <li>{err}</li>
                {/each}
            </ul>
        </div>
    {/if}

    {#if error}
        <div class="error_box">
            <p>{error}</p>
        </div>
    {/if}

    {#if success}
        <div class="success_box">
            <p>{success}</p>
        </div>
    {/if}

</div>

<style>
    .login_container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
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