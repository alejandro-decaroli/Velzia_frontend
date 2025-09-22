<script>
    import Success from "./success.svelte";
    import ErrorBox from "./errorbox.svelte";
    import { goto } from '$app/navigation';
    import { user } from "../stores/auth";
    

    let success = "";
	let email = "";
	let contrasenia = "";
	let error = "";
    let data = null;
	let validationErrors = [];

    async function redirect(data) {
        setTimeout(async () => {
            user.set({ email: data.user_json.email, nombre: data.user_json.nombre, apellido: data.user_json.apellido});
            await goto("/dashboard");
            // después del login exitoso
        }, 2000);
    }

	async function handleLogin(event) {

		event.preventDefault(); // evitar el envío automático
        

		// Si pasa la validación del cliente, hacemos fetch
		try {
			const response = await fetch("http://localhost:3000/usuarios/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email, contrasenia })
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
				success = "Inicio de sesión exitoso";
                redirect(data);
			}
		} catch (e) {
			error = "No se pudo conectar al servidor";
		}
	}
</script>

<div class="login_container">

    <form on:submit={handleLogin}>
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

        <button type="submit">Login</button>
    </form>

    <ErrorBox validationErrors={validationErrors} error={error} />

    <Success success={success} />

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
        background-color: #405B81;
        color: white;
        padding: 1rem;
        border-radius: 1rem;
        width: 300px;
        height: 250px;
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