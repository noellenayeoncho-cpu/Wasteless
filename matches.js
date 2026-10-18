import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const container = document.getElementById("matches-list");

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        container.textContent = "Please log in to view potential matches.";
        return;
    }

    await loadMatches();
});

async function loadMatches() {
    container.textContent = "Loading matches...";

    try {
        const donationSnapshot = await getDocs(
            collection(db, "donations")
        );

        const needsSnapshot = await getDocs(
            collection(db, "needs")
        );

        const usersSnapshot = await getDocs(
            collection(db, "users")
        );

        const donations = donationSnapshot.docs.map(function (doc) {
            return { id: doc.id, ...doc.data() };
        });

        const needs = needsSnapshot.docs.map(function (doc) {
            return { id: doc.id, ...doc.data() };
        });

        const users = {};

        usersSnapshot.forEach(function (doc) {
            users[doc.id] = doc.data();
        });

        container.innerHTML = "";

        let matchCount = 0;

        donations.forEach(function (donation) {
            needs.forEach(function (need) {
                const donationText = getPostText(donation);
                const needText = getPostText(need);

                if (!hasMatchingWords(donationText, needText)) {
                    return;
                }

                matchCount++;

                const card = document.createElement("div");
                card.className = "match-card";

                const heading = document.createElement("h3");
                heading.textContent = "Potential Match";

                const donor = users[donation.userId] || {};
                const donorName =
                    donor.displayName || donor.name || "WasteLess donor";

                const donorInfo = document.createElement("p");
                donorInfo.textContent = "Donated by: " + donorName;
                card.appendChild(heading);
                card.appendChild(donorInfo);

                if (donor.photoURL) {
                    const profileImage = document.createElement("img");
                    profileImage.src = donor.photoURL;
                    profileImage.alt = donorName + "'s profile picture";
                    profileImage.className = "donation-image";
                    profileImage.style.width = "65px";
                    profileImage.style.height = "65px";
                    profileImage.style.objectFit = "cover";
                    profileImage.style.borderRadius = "50%";
                    card.appendChild(profileImage);
                }

                if (donation.userId) {
                    const profileLink = document.createElement("a");
                    profileLink.href =
                        "profile.html?uid=" +
                        encodeURIComponent(donation.userId);
                    profileLink.textContent = "View donor profile";
                    card.appendChild(profileLink);
                }

                const donationHeading = document.createElement("p");
                donationHeading.textContent = "Donation: " + donationText;
                card.appendChild(donationHeading);

                if (donation.imageURL) {
                    const image = document.createElement("img");
                    image.src = donation.imageURL;
                    image.alt = "Picture of donated item";
                    image.className = "donation-image";

                    image.onerror = function () {
                        image.style.display = "none";
                    };

                    card.appendChild(image);
                }

                const needHeading = document.createElement("p");
                needHeading.textContent = "Requested: " + needText;
                card.appendChild(needHeading);

                addImpactSection(card, donation.id, need.id);

                container.appendChild(card);
            });
        });

        if (matchCount === 0) {
            const message = document.createElement("div");
            message.className = "match-card";

            const heading = document.createElement("h3");
            heading.textContent = "No matches yet!";

            const description = document.createElement("p");
            description.textContent =
                "Post a donation and a matching need to see potential matches here.";

            message.append(heading, description);
            container.appendChild(message);
        }
    } catch (error) {
        console.error("Error loading matches:", error);
        container.textContent =
            "Could not load matches. Check your Firebase connection and Firestore rules.";
    }
}

function getPostText(post) {
    return String(
        post.text ||
        post.description ||
        post.title ||
        post.item ||
        post.name ||
        ""
    ).trim();
}

function hasMatchingWords(donationText, needText) {
    const ignoredWords = [
        "the", "and", "for", "with", "that",
        "this", "are", "any", "need", "needs",
        "want", "some", "have", "from"
    ];

    const donationWords =
        donationText.toLowerCase().match(/[a-z0-9]+/g) || [];

    const needWords =
        needText.toLowerCase().match(/[a-z0-9]+/g) || [];

    return donationWords.some(function (word) {
        return word.length > 2 &&
            !ignoredWords.includes(word) &&
            needWords.includes(word);
    });
}

function addImpactSection(card, donationId, needId) {
    const impactKey = donationId + "|" + needId;

    const section = document.createElement("div");
    section.className = "impact-section";

    const heading = document.createElement("h3");
    heading.textContent = "How it helped:";

    const input = document.createElement("textarea");
    input.placeholder = "Share an impact update...";
    input.rows = 3;

    const button = document.createElement("button");
    button.textContent = "Update";

    const list = document.createElement("div");

    function displayUpdates() {
        list.innerHTML = "";

        let allUpdates = {};

        try {
            allUpdates = JSON.parse(
                localStorage.getItem("impactUpdates") || "{}"
            );
        } catch {
            allUpdates = {};
        }

        (allUpdates[impactKey] || []).forEach(function (update) {
            const updateCard = document.createElement("div");
            updateCard.className = "impact-update";

            const text = document.createElement("p");
            text.textContent = update.text;

            const date = document.createElement("small");
            date.textContent = update.date;

            updateCard.append(text, date);
            list.appendChild(updateCard);
        });
    }

    button.addEventListener("click", function () {
        const message = input.value.trim();

        if (!message) {
            alert("Please write an impact update first.");
            return;
        }

        let allUpdates = {};

        try {
            allUpdates = JSON.parse(
                localStorage.getItem("impactUpdates") || "{}"
            );
        } catch {
            allUpdates = {};
        }

        if (!allUpdates[impactKey]) {
            allUpdates[impactKey] = [];
        }

        allUpdates[impactKey].push({
            text: message,
            date: new Date().toLocaleDateString()
        });

        localStorage.setItem(
            "impactUpdates",
            JSON.stringify(allUpdates)
        );

        input.value = "";
        displayUpdates();
    });

    section.append(heading, input, button, list);
    card.appendChild(section);

    displayUpdates();
}