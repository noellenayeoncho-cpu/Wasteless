
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyA-aFDtSyL67w3n6-mc7daxBso9ROiQlMs",
    authDomain: "wasteless-1d474.firebaseapp.com",
    projectId: "wasteless-1d474",
    storageBucket: "wasteless-1d474.firebasestorage.app",
    messagingSenderId: "309137035345",
    appId: "1:309137035345:web:1cdf05f03960e7b8ba2870",
    measurementId: "G-RDLCM35XGQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);