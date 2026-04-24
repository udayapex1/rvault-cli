import Configstore from "configstore";

const store = new Configstore("rvault");

// ─── Token ───────────────────────────────────────────────
export function saveToken(token) {
    store.set("jwtToken", token);
}

export function getToken() {
    return store.get("jwtToken") || null;
}

export function deleteToken() {
    store.delete("jwtToken");
}

// ─── User ─────────────────────────────────────────────────
export function saveUser(user) {
    store.set("user", user);
}

export function getUser() {
    return store.get("user") || null;
}

export function deleteUser() {
    store.delete("user");
}

// ─── Clear everything ─────────────────────────────────────
export function clearSession() {
    deleteToken();
    deleteUser();
}

export function isLoggedIn() {
    return !!getToken();
}
