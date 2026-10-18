import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    addDoc,
    collection,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const popup = document.getElementById("post-popup");
const input = document.getElementById("post-text");
const container = document.getElementById("posts");

let currentUser = null;

window.togglePost = function () {
    popup.style.display =
        popup.style.display === "block" ? "none" : "block";
};

onAuthStateChanged(auth, function (user) {
    currentUser = user;

    if (!user) {
        container.textContent = "Please log in to view and post needs.";
        return;
    }

    showPosts();
});

window.addPost = async function () {
    const text = input.value.trim();

    if (!currentUser) {
        alert("Please log in before posting a need.");
        return;
    }

    if (text === "") {
        alert("Please describe what you need!");
        return;
    }

    try {
        await addDoc(collection(db, "needs"), {
            text: text,
            title: text,
            description: text,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        input.value = "";
        popup.style.display = "none";

        await showPosts();
    } catch (error) {
        console.error("Error saving need:", error);
        alert("Could not save your need. Check your Firebase settings and Firestore rules.");
    }
};

async function showPosts() {
    container.innerHTML = "Loading needs...";

    try {
        const snapshot = await getDocs(collection(db, "needs"));
        container.innerHTML = "";

        if (snapshot.empty) {
            container.textContent = "No needs posted yet. Be the first!";
            return;
        }

        snapshot.forEach(function (documentSnapshot) {
            const item = documentSnapshot.data();

            const post = document.createElement("div");
            post.className = "simple-post";

            const text = document.createElement("p");
            text.textContent = item.text || item.title || item.description || "";

            post.appendChild(text);
            container.appendChild(post);
        });
    } catch (error) {
        console.error("Error loading needs:", error);
        container.textContent = "Could not load needs. Check your Firestore rules.";
    }
}