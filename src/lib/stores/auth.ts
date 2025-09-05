// src/lib/stores/auth.ts
import { writable } from "svelte/store";
import { browser } from "$app/environment";
import * as cookie from 'cookie';

// Función para obtener la cookie del usuario
function getUserFromCookie(): any | null {
    if (!browser) return null;
    
    const cookies = cookie.parse(document.cookie);
    return cookies.user ? JSON.parse(decodeURIComponent(cookies.user)) : null;
}

// Inicializar con el valor de la cookie
const initialValue = browser ? getUserFromCookie() : null;

export const user = writable(initialValue);

// Actualizar la cookie cuando cambie el usuario
if (browser) {
    user.subscribe(value => {
        if (value) {
            // Cookie que expira al cerrar el navegador
            document.cookie = cookie.serialize('user', JSON.stringify(value), {
                path: '/',
                sameSite: 'lax',
                secure: window.location.protocol === 'https:'
            });
        } else {
            // Eliminar la cookie
            document.cookie = cookie.serialize('user', '', {
                path: '/',
                expires: new Date(0)
            });
        }
    });
}

// Función para hacer login
export function login(userData: any) {
    user.set(userData);
}

// Función para hacer logout
export function logout() {
    user.set(null);
}