import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Profile elements
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const profileLocation = document.getElementById("profile-location");
const profilePicture = document.getElementById("profile-picture");
const profileMessage = document.getElementById("profile-message");

const editButton = document.getElementById("edit-profile-btn");
const editSection = document.getElementById("edit-profile-section");
const profileForm = document.getElementById("profile-form");
const cancelButton = document.getElementById("cancel-edit-btn");
const signOutButton = document.getElementById("sign-out-btn");

const donationsContainer = document.getElementById("my-donations");
const needsContainer = document.getElementById("my-needs");

const otherSection = document.getElementById("other-profile-section");
const backButton = document.getElementById("back-to-profile-btn");

let currentUser = null;
let viewingOwnProfile = true;

const params = new URLSearchParams(window.location.search);
const requestedUid = params.get("uid");

function showMessage(message) {
    profileMessage.textContent = message;
}

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text || "";
    parent.appendChild(element);
    return element;
}

function validPhotoUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

function showListings(container, items, emptyMessage) {
    container.replaceChildren();

    if (items.length === 0) {
        addText(container, "p", emptyMessage);
        return;
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "listing-card";

        addText(card, "h3", item.title || item.name || "Untitled item");
        addText(card, "p", item.description || "");
        addText(card, "p", item.category || "");

        container.appendChild(card);
    });
}

async function loadListings(uid, collectionName, container, emptyMessage) {
    container.replaceChildren();
    addText(container, "p", "Loading...");

    try {
        const listingsQuery = query(
            collection(db, collectionName),
            where("userId", "==", uid)
        );

        const snapshot = await getDocs(listingsQuery);

        const items = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        showListings(container, items, emptyMessage);
    } catch (error) {
        console.error(error);
        container.replaceChildren();
        addText(container, "p", "Could not load listings.");
    }
}

async function loadProfile(uid, isOwnProfile) {
    try {
        const profileRef = doc(db, "users", uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
            showMessage("This profile has not been created yet.");
            profileName.textContent = "Profile not found";
            profileBio.textContent = "";
            profileLocation.textContent = "";
            profilePicture.removeAttribute("src");
            donationsContainer.replaceChildren();
            needsContainer.replaceChildren();
            return;
        }

        const data = profileSnapshot.data();

        profileName.textContent = data.name || "WasteLess Member";
        profileBio.textContent = data.bio || "No bio yet.";
        profileLocation.textContent = data.location || "";

        const photo = validPhotoUrl(data.photoURL || "");
        if (photo) {
            profilePicture.src = photo;
        } else {
            profilePicture.removeAttribute("src");
        }

        // Only allow editing your own profile.
        editButton.hidden = !isOwnProfile;
        signOutButton.hidden = !isOwnProfile;

        if (isOwnProfile) {
            document.getElementById("name").value = data.name || "";
            document.getElementById("bio").value = data.bio || "";
            document.getElementById("location").value = data.location || "";
            document.getElementById("photo-url").value = data.photoURL || "";
        }

        await Promise.all([
            loadListings(uid, "donations", donationsContainer, "No donations posted yet."),
            loadListings(uid, "needs", needsContainer, "No requests posted yet.")
        ]);

        showMessage("");
    } catch (error) {
        console.error(error);
        showMessage("Could not load this profile. Check your Firebase rules.");
    }
}

// Show and hide the edit form.
editButton.addEventListener("click", () => {
    editSection.hidden = false;
});

cancelButton.addEventListener("click", () => {
    editSection.hidden = true;
});

// Save the signed-in user's profile.
profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser || !viewingOwnProfile) {
        showMessage("Please sign in to edit your profile.");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const location = document.getElementById("location").value.trim();
    const photoURL = document.getElementById("photo-url").value.trim();

    if (!name) {
        showMessage("Please enter your display name.");
        return;
    }

    if (photoURL && !validPhotoUrl(photoURL)) {
        showMessage("Please enter a valid HTTPS image URL.");
        return;
    }

    try {
        await setDoc(
            doc(db, "users", currentUser.uid),
            {
                name,
                bio,
                location,
                photoURL: validPhotoUrl(photoURL),
                updatedAt: new Date().toISOString()
            },
            { merge: true }
        );

        editSection.hidden = true;
        await loadProfile(currentUser.uid, true);
        showMessage("Profile saved!");
    } catch (error) {
        console.error(error);
        showMessage("Could not save your profile. Check Firestore rules.");
    }
});

// Sign out.
signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error(error);
        showMessage("Could not sign out. Please try again.");
    }
});

// View your own profile or another user's profile.
backButton.addEventListener("click", () => {
    window.location.href = "profile.html";
});

onAuthStateChanged(auth, async user => {
    currentUser = user;

    if (!user) {
        if (requestedUid) {
            profileName.textContent = "Community Profile";
            profileBio.textContent = "Sign in to view profiles.";
            editButton.hidden = true;
            signOutButton.hidden = true;
            donationsContainer.replaceChildren();
            needsContainer.replaceChildren();
            return;
        }

        window.location.href = "login.html";
        return;
    }

    const targetUid = requestedUid || user.uid;
    viewingOwnProfile = targetUid === user.uid;

    otherSection.hidden = viewingOwnProfile;
    document.querySelector(".profile-card").hidden = !viewingOwnProfile;
    editSection.hidden = true;

    if (!viewingOwnProfile) {
        // Display the selected user's public profile in the other-profile section.
        const otherName = document.getElementById("other-profile-name");
        const otherBio = document.getElementById("other-profile-bio");
        const otherLocation = document.getElementById("other-profile-location");
        const otherPicture = document.getElementById("other-profile-picture");

        try {
            const snapshot = await getDoc(doc(db, "users", targetUid));

            if (!snapshot.exists()) {
                otherName.textContent = "Profile not found";
                return;
            }

            const data = snapshot.data();
            otherName.textContent = data.name || "WasteLess Member";
            otherBio.textContent = data.bio || "No bio yet.";
            otherLocation.textContent = data.location || "";

            const photo = validPhotoUrl(data.photoURL || "");
            if (photo) {
                otherPicture.src = photo;
            } else {
                otherPicture.removeAttribute("src");
            }

            await Promise.all([
                loadListings(targetUid, "donations",
                    document.getElementById("other-donations"),
                    "No donations posted yet."),
                loadListings(targetUid, "needs",
                    document.getElementById("other-needs"),
                    "No requests posted yet.")
            ]);
        } catch (error) {
            console.error(error);
            otherName.textContent = "Could not load profile";
        }

        return;
    }

    await loadProfile(user.uid, true);
});