<script>
    import Logo from "./logo.svelte";
    import { user } from "../stores/auth.js";
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { logout } from "$lib/stores/auth";
    
    let menuOpen = false;    
    onMount(() => {
        const closeMenu = (e) => {
            if (!e.target.closest('.user-menu-container')) {
                menuOpen = false;
            }
        };
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    });

    function toggleMenu() {
        menuOpen = !menuOpen;
    }
</script>

<nav class="navbar">
    <Logo />
    {#if $user === null}
        <div class="auth-links">
            <a href="/login" class="nav-link">Iniciar sesión</a>
            <a href="/signup" class="nav-btn">Registrarse</a>
        </div>
    {:else}
        <div class="user-menu-container">
            <button 
                class="user-trigger" 
                on:click={toggleMenu} 
                aria-expanded={menuOpen}
                aria-label="Menú de usuario"
            >
                <span class="user-display">{$user?.nombre} {$user?.apellido}</span>
                <div class="avatar">
                    {#if $user?.nombre}
                        {$user.nombre.charAt(0).toUpperCase()}{$user.apellido?.charAt(0).toUpperCase() || ''}
                    {:else}
                        U
                    {/if}
                </div>
            </button>
            
            {#if menuOpen}
                <div class="dropdown-menu">
                    <div class="dropdown-header">
                        <p class="name">{$user?.nombre} {$user?.apellido}</p>
                        <p class="email">{$user?.email}</p>
                    </div>
                    <hr class="divider" />
                    <ul class="menu-list">
                        <li>
                            <a href="/dashboard" on:click={() => menuOpen = false}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="/user" on:click={() => menuOpen = false}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Mi Perfil
                            </a>
                        </li>
                        <hr class="divider" />
                        <li>
                            <button class="logout-btn" on:click={() => { logout(); menuOpen = false; }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            {/if}
        </div>
    {/if}
</nav>

<style>
    .navbar {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .auth-links {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .nav-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        transition: color var(--transition-fast);
    }

    .nav-link:hover {
        color: #ffffff;
    }

    .nav-btn {
        background-color: var(--color-brand);
        color: #ffffff;
        padding: 0.5rem 1.25rem;
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        box-shadow: 0 4px 12px var(--color-brand-glow);
        transition: all var(--transition-fast);
    }

    .nav-btn:hover {
        background-color: var(--color-brand-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
    }

    .user-menu-container {
        position: relative;
    }

    .user-trigger {
        background: none;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.35rem 0.5rem 0.35rem 1rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--glass-border);
        background-color: rgba(255, 255, 255, 0.03);
        transition: all var(--transition-fast);
    }

    .user-trigger:hover {
        background-color: rgba(255, 255, 255, 0.08);
        border-color: var(--glass-border-hover);
    }

    .user-display {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--text-primary);
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-brand) 0%, #a855f7 100%);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 240px;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1000;
        overflow: hidden;
        padding: 0.5rem 0;
    }

    .dropdown-header {
        padding: 0.75rem 1.25rem;
    }

    .dropdown-header .name {
        font-weight: 600;
        color: #ffffff;
        font-size: 0.95rem;
    }

    .dropdown-header .email {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 0.1rem;
    }

    .divider {
        border: 0;
        border-top: 1px solid var(--glass-border);
        margin: 0.5rem 0;
    }

    .menu-list {
        list-style: none;
        padding: 0 0.5rem;
    }

    .menu-list li a, .menu-list li button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.65rem 0.75rem;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        text-align: left;
        background: none;
    }

    .menu-list li a:hover, .menu-list li button:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }

    .menu-list li button.logout-btn:hover {
        color: var(--color-error);
        background-color: var(--color-error-glow);
    }
</style>
