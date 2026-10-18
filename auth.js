
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth } from "./firebase.js";
export async function signUp(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;
    } catch (error) {
        alert(error.message);
        return null;
    }
}
export async function logIn(email, password) {
    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;
    } catch (error) {
        alert("Login failed. Please check your email and password.");
        return null;
    }
}
export async function logOut() {
    try {
        await signOut(auth);
        window.location.href = "main.html";
    } catch (error) {
        alert("Could not log out. Please try again.");
    }
}
export function checkAuth(callback) {
    return onAuthStateChanged(auth, callback);
}