<script lang="ts">
    import Success from "./success.svelte";
    import ErrorBox from "./errorbox.svelte";
    import { goto } from '$app/navigation';
    import { user } from "../stores/auth";
    
    let success = "";
	let email = "";
	let contrasenia = "";
	let apellido = "";
	let nombre = "";
	let error = "";
	let validationErrors: string[] = [];
    let data: any = null;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    async function redirect(userData: any) {
        setTimeout(async () => {
            user.set({ 
                email: userData.user_json.email, 
                nombre: userData.user_json.nombre, 
                apellido: userData.user_json.apellido
            });
            await goto("/dashboard");
        }, 2000);
    }

	async function handleSignUp(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch(`${API_URL}/usuarios/sign-up`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ nombre, apellido, email, contrasenia }),
                credentials: "include"
			});

			data = await response.json();
			if (!response.ok) {
				if (data.errors && Array.isArray(data.errors)) {
					validationErrors = data.errors.map((e: any) => e.msg);
				} else {
					error = data.message || "Error al registrarse";
				}
				return;
			} else {
				validationErrors = [];
				error = "";
				success = "Registrado exitosamente";
                redirect(data);
			}
		} catch (e) {
			error = "No se pudo conectar al servidor";
		}
	}
</script>

<div class="signup-wrapper">
    <div class="signup-card">
        <div class="card-header">
            <h2>Crear Cuenta</h2>
            <p>Únete a Velzia para empezar a registrar tus movimientos</p>
        </div>

        <form on:submit={handleSignUp} class="signup-form">
            <div class="name-row">
                <div class="input-group">
                    <label for="nombre">Nombre</label>
                    <input
                        required
                        placeholder="Nombre"
                        type="text"
                        id="nombre"
                        bind:value={nombre}
                        on:input={() => (validationErrors = [], error = "", success = "")}
                    />
                </div>
                <div class="input-group">
                    <label for="apellido">Apellido</label>
                    <input
                        required
                        placeholder="Apellido"
                        type="text"
                        id="apellido"
                        bind:value={apellido}
                        on:input={() => (validationErrors = [], error = "", success = "")}
                    />
                </div>
            </div>

            <div class="input-group">
                <label for="email">Email</label>
                <input
                    required
                    placeholder="correo@ejemplo.com"
                    type="email"
                    id="email"
                    bind:value={email}
                    on:input={() => (validationErrors = [], error = "", success = "")}
                />
            </div>

            <div class="input-group">
                <label for="contrasenia">Contraseña</label>
                <input
                    required
                    placeholder="••••••••"
                    type="password"
                    id="contrasenia"
                    bind:value={contrasenia}
                    on:input={() => (validationErrors = [], error = "", success = "")}
                />
            </div>

            <button type="submit" class="submit-btn">Registrarse</button>
        </form>

        {#if validationErrors.length > 0 || error}
            <div class="error-wrapper">
                <ErrorBox {validationErrors} {error} />
            </div>
        {/if}

        {#if success}
            <div class="success-wrapper">
                <Success {success} />
            </div>
        {/if}

        <div class="card-footer">
            <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
        </div>
    </div>
</div>

<style>
    .signup-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem 0;
        animation: fadeIn 0.4s ease-out;
    }

    .signup-card {
        background-color: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        width: 100%;
        max-width: 460px;
        padding: 2.5rem;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        text-align: center;
    }

    .card-header {
        margin-bottom: 2rem;
    }

    .card-header h2 {
        font-size: 1.75rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .card-header p {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .signup-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .name-row {
        display: flex;
        gap: 1rem;
        width: 100%;
    }

    .name-row .input-group {
        flex: 1;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
    }

    .input-group label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .submit-btn {
        background-color: var(--color-brand);
        color: white;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        font-weight: 700;
        width: 100%;
        margin-top: 0.75rem;
        box-shadow: 0 4px 12px var(--color-brand-glow);
    }

    .submit-btn:hover {
        background-color: var(--color-brand-hover);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
    }

    .error-wrapper, .success-wrapper {
        margin-top: 1.25rem;
    }

    .card-footer {
        margin-top: 1.5rem;
        border-top: 1px solid var(--glass-border);
        padding-top: 1.25rem;
    }

    .card-footer p {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .card-footer a {
        color: var(--color-brand);
        text-decoration: none;
        font-weight: 600;
        transition: color var(--transition-fast);
    }

    .card-footer a:hover {
        color: var(--color-brand-hover);
        text-decoration: underline;
    }
</style>