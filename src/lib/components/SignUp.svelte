<script>
    import Success from "./success.svelte";
    import ErrorBox from "./errorbox.svelte";
    import { user } from "../stores/auth.js";
    import { goto } from '$app/navigation';

    let success = "";
	let email = "";
	let contrasenia = "";
	let apellido = "";
	let nombre = "";
	let error = "";
	let validationErrors = [];
    let data = null;

    async function redirect(data) {
        setTimeout(async () => {
            user.set({ id: data.user.id, email: data.user.email, nombre: data.user.nombre, apellido: data.user.apellido, token: data.token });
            await goto("/user");
            // después del login exitoso
        }, 2000);
    }

	async function handleLogin(event) {

		event.preventDefault(); // evitar el envío automático

		// Si pasa la validación del cliente, hacemos fetch
		try {
			const response = await fetch("http://localhost:3000/usuarios/sign-up", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ nombre, apellido, email, contrasenia })
			});

			data = await response.json();

			if (!response.ok) {
				if (data.errors && Array.isArray(data.errors)) {
					validationErrors = data.errors.map((e) => e.msg);
				} else {
					error = data.message || "Error al iniciar sesión";
				}
				return;
			} else {
				validationErrors = [];
				error = "";
				success = "Sign Up exitoso";
                redirect(data);
			}
		} catch (e) {
			error = "No se pudo conectar al servidor";
		}
	}
</script>

<div class="signup_container">

    <form on:submit={handleLogin}>
        <label for="nombre">Nombre:</label>
        <input
            required
            placeholder="Nombre"
            type="text"
            id="nombre"
            bind:value={nombre}
            on:input={() => (validationErrors = [], error = "", success = "")}
        />
        <label for="apellido">Apellido:</label>
        <input
            required
            placeholder="Apellido"
            type="text"
            id="apellido"
            bind:value={apellido}
            on:input={() => (validationErrors = [], error = "", success = "")}
        />
        <label for="email">Email:</label>
        <input
            required
            placeholder="gonzalo@example.com"
            type="email"
            id="email"
            bind:value={email}
            on:input={() => (validationErrors = [], error = "", success = "")}
        />
        <label for="contrasenia">Contraseña:</label>
        <input
            required
            placeholder="********"
            type="password"
            id="contrasenia"
            bind:value={contrasenia}
            on:input={() => (validationErrors = [], error = "", success = "")}
        />

        <button type="submit">Sign Up</button>
    </form>

    <ErrorBox validationErrors={validationErrors} error={error} />

    <Success success={success} />

</div>

<style>
    .signup_container {
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
        background-color: #1D3557;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        height: 420px;
        margin: 0 auto;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        background-color: #ffffff;
        color: #1D3557;
        font-weight: bold;
    }

</style>