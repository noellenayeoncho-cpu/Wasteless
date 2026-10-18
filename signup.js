import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const signupMessage = document.getElementById("signup-message");
const signupButton = document.getElementById("signup-button");

const accountType = document.getElementById("signup-type");
const organizationField = document.getElementById("organization-field");
const organizationInput = document.getElementById("signup-organization");

// Show the organization name field only when needed.
accountType.addEventListener("change", () => {
    const isOrganization = accountType.value === "Organization";

    organizationField.hidden = !isOrganization;
    organizationInput.required = isOrganization;

    if (!isOrganization) {
        organizationInput.value = "";
    }
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const type = accountType.value;
    const organization = organizationInput.value.trim();

    if (!name || !email || !password || !type) {
        signupMessage.textContent = "Please complete all required fields.";
        return;
    }

    if (type === "Organization" && !organization) {
        signupMessage.textContent = "Please enter your organization name.";
        return;
    }

    signupButton.disabled = true;
    signupMessage.textContent = "Creating your account...";

    let createdUser = null;

    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        createdUser = result.user;

        await updateProfile(createdUser, {
            displayName: name
        });

        await setDoc(doc(db, "users", createdUser.uid), {
            uid: createdUser.uid,
            name: name,
            email: createdUser.email,
            bio: "",
            location: "",
            photoURL: "",
            accountType: type,
            organizationName: type === "Organization" ? organization : "",
            createdAt: serverTimestamp()
        });

        window.location.href = "profile.html";

    } catch (error) {
        console.error("Signup error:", error);

        if (createdUser) {
            signupMessage.textContent =
                "Your account was created, but your profile could not be saved. " +
                "Please check your Firestore rules before trying again.";
        } else if (error.code === "auth/email-already-in-use") {
            signupMessage.textContent =
                "That email already has an account. Please log in.";
        } else if (error.code === "auth/weak-password") {
            signupMessage.textContent =
                "Please choose a stronger password with at least 6 characters.";
        } else if (error.code === "auth/invalid-email") {
            signupMessage.textContent = "Please enter a valid email address.";
        } else {
            signupMessage.textContent =
                "Something went wrong. Please try again.";
        }
    } finally {
        signupButton.disabled = false;
    }});