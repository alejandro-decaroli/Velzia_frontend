// src/lib/stores/auth.ts
import { writable } from "svelte/store";
import { goto } from '$app/navigation';

export const user = writable(null);

export async function checkUser(error: string){
    try {
        const response = await fetch("http://localhost:3000/usuarios/check-user", {
            method: "GET",
            credentials: "include"
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || "Error al iniciar sesión";
            }
            const fondo = document.createElement("div");
            fondo.style.position = "fixed";
            fondo.style.top = "0";
            fondo.style.left = "0";
            fondo.style.width = "100%";
            fondo.style.height = "100%";
            fondo.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            fondo.style.zIndex = "999";
            fondo.style.display = "flex";
            fondo.style.justifyContent = "center";
            fondo.style.alignItems = "center";
            document.body.appendChild(fondo);
            const cartel_error = document.createElement("div");
            cartel_error.textContent = error;
            cartel_error.style.color = "red";
            cartel_error.style.fontSize = "2rem";
            cartel_error.style.position = "absolute";
            cartel_error.style.top = "40vh";
            cartel_error.style.left = "50%";
            cartel_error.style.transform = "translateX(-50%)";
            cartel_error.style.zIndex = "1000";
            cartel_error.style.padding = "20px";
            cartel_error.style.textAlign = "center";
            cartel_error.style.width = "50%";
            cartel_error.style.margin = "0 auto";
            cartel_error.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
            cartel_error.style.border = "2px solid red";
            cartel_error.style.borderRadius = "5px";
            cartel_error.style.backgroundColor = "#f8f8f8";
            document.body.appendChild(cartel_error);
            setTimeout(() => {
                document.body.removeChild(cartel_error);
                document.body.removeChild(fondo);
            }, 2000);
            setTimeout(() => {
                goto("/login");
            }, 2000);
            
        } else {
            error = "";
            return data;
        }
    } catch (e) {
        error = e as string;
        return error;
    }
}

export async function logout() {
    try {
        const response = await fetch("http://localhost:3000/usuarios/logout", {
            method: "POST",
            credentials: "include"
        });
        
        if (!response.ok) {
            throw new Error("Error al cerrar sesión");
        }
        
        user.set(null);
        await goto("/");
    } catch (e) {
        console.error(e);
    }
}

export async function checkAdmin(error: string) {
    try {

        const isUser = await checkUser(error);

        const response = await fetch("http://localhost:3000/usuarios/check-admin", {
            method: "GET",
            credentials: "include"
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || "Error al iniciar sesión";
            }
            const fondo = document.createElement("div");
            fondo.style.position = "fixed";
            fondo.style.top = "0";
            fondo.style.left = "0";
            fondo.style.width = "100%";
            fondo.style.height = "100%";
            fondo.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            fondo.style.zIndex = "999";
            fondo.style.display = "flex";
            fondo.style.justifyContent = "center";
            fondo.style.alignItems = "center";
            document.body.appendChild(fondo);
            const cartel_error = document.createElement("div");
            cartel_error.textContent = error;
            cartel_error.style.color = "red";
            cartel_error.style.fontSize = "2rem";
            cartel_error.style.position = "absolute";
            cartel_error.style.top = "40vh";
            cartel_error.style.left = "50%";
            cartel_error.style.transform = "translateX(-50%)";
            cartel_error.style.zIndex = "1000";
            cartel_error.style.padding = "20px";
            cartel_error.style.textAlign = "center";
            cartel_error.style.width = "50%";
            cartel_error.style.margin = "0 auto";
            cartel_error.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
            cartel_error.style.border = "2px solid red";
            cartel_error.style.borderRadius = "5px";
            cartel_error.style.backgroundColor = "#f8f8f8";
            document.body.appendChild(cartel_error);
            setTimeout(() => {
                document.body.removeChild(cartel_error);
                document.body.removeChild(fondo);
            }, 2000);
            if (isUser) {
                setTimeout(() => {
                    goto("/dashboard");
                }, 2000);
            } else {
                setTimeout(() => {
                    goto("/login");
                }, 2000);
            }
            
        } else {
            error = "";
            return data;
        }
    } catch (e) {
        error = e as string;
        return error;
    }
}