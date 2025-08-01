// src/lib/stores/auth.ts
import { writable } from "svelte/store";
import { browser } from "$app/environment";

let initialValue = null;

if (browser) {
	const storedUser = localStorage.getItem("user");
	initialValue = storedUser ? JSON.parse(storedUser) : null;
}

export const user = writable(initialValue);

if (browser) {
	user.subscribe(value => {
		if (value) {
			localStorage.setItem("user", JSON.stringify(value));
		} else {
			localStorage.removeItem("user");
		}
	});
}
