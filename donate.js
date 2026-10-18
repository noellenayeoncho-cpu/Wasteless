
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
const imageInput = document.getElementById("post-image");
const container = document.getElementById("posts");

let currentUser = null;

window.togglePost = function () {
    popup.style.display =
        popup.style.display === "block" ? "none" : "block";
};

onAuthStateChanged(auth, function (user) {
    currentUser = user;

    if (!user) {
        container.textContent = "Please log in to view and post donations.";
        return;
    }

    showPosts();
});

window.addPost = async function () {
    const text = input.value.trim();
    const imageURL = imageInput.value.trim();

    if (!currentUser) {
        alert("Please log in before posting a donation.");
        return;
    }

    if (text === "") {
        alert("Please describe your donation!");
        return;
    }

    if (imageURL && !/^https:\/\//i.test(imageURL)) {
        alert("Please use an image link that starts with https://");
        return;
    }

    try {
        await addDoc(collection(db, "donations"), {
            text: text,
            title: text,
            description: text,
            imageURL: imageURL,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        input.value = "";
        imageInput.value = "";
        popup.style.display = "none";

        await showPosts();
    } catch (error) {
        console.error("Error saving donation:", error);
        alert("Could not save your donation. Check your Firebase settings.");
    }
};

async function showPosts() {
    container.textContent = "Loading donations...";

    try {
        const snapshot = await getDocs(collection(db, "donations"));
        container.innerHTML = "";

        if (snapshot.empty) {
            container.textContent = "No donations posted yet. Be the first!";
            return;
        }

        snapshot.forEach(function (documentSnapshot) {
            const item = documentSnapshot.data();

            const post = document.createElement("div");
            post.className = "simple-post";

            const text = document.createElement("p");
            text.textContent =
                item.text || item.title || item.description || "Donation";

            post.appendChild(text);

            if (item.imageURL) {
                const img = document.createElement("img");
                img.src = item.imageURL;
                img.alt = "Picture of donated item";
                img.className = "donation-image";

                img.onerror = function () {
                    img.alt = "Image could not be loaded";
                    img.style.display = "none";
                };

                post.appendChild(img);
            }

            container.appendChild(post);
        });
    } catch (error) {
        console.error("Error loading donations:", error);
        container.textContent = "Could not load donations. Check your Firestore rules.";
    }
}