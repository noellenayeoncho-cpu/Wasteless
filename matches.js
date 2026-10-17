
function getSavedData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function getFoodName(item) {
    return String(
        item.food ||
        item.foodName ||
        item["food-name"] ||
        item.name ||
        item.item ||
        item.title ||
        ""
    ).trim().toLowerCase();
}

function getQuantity(item) {
    return Number(
        item.quantity ??
        item["food-quantity"] ??
        item.amount ??
        0
    );
}

function getLocation(item) {
    return String(
        item.location ||
        item["food-location"] ||
        ""
    ).trim().toLowerCase();
}

function findMatches() {
    const donations = getSavedData("donations");
    const needs = getSavedData("needs");
    const matches = [];

    donations.forEach((donation, donationIndex) => {
        needs.forEach((need, needIndex) => {
            const donationFood = getFoodName(donation);
            const needFood = getFoodName(need);

            const donationQuantity = getQuantity(donation);
            const needQuantity = getQuantity(need);

            const donationLocation = getLocation(donation);
            const needLocation = getLocation(need);

            const sameFood =
                donationFood !== "" &&
                donationFood === needFood;

            const enoughFood =
                donationQuantity > 0 &&
                needQuantity > 0 &&
                donationQuantity >= needQuantity;

            const locationCompatible =
                donationLocation === "" ||
                needLocation === "" ||
                donationLocation === needLocation;

            if (
                sameFood &&
                enoughFood &&
                locationCompatible
            ) {
                matches.push({
                    donation: donation,
                    need: need,
                    donationIndex: donationIndex,
                    needIndex: needIndex
                });
            }
        });
    });

    return matches;
}

function displayMatches() {
    const container = document.getElementById("matches-list");
    const matches = findMatches();

    container.innerHTML = "";

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="match-card">
                <h3>No matches yet!</h3>
                <p>
                   When matched, it will appear here.
                </p>
            </div>
        `;
        return;
    }

    matches.forEach(match => {
        const donation = match.donation;
        const need = match.need;

        const card = document.createElement("div");
        card.className = "match-card";

        const heading = document.createElement("h3");
        heading.textContent = "A Match Was Found!";

        const food = document.createElement("p");
        food.textContent = "Food: " + getFoodName(donation);

        const available = document.createElement("p");
        available.textContent =
            "Available: " + getQuantity(donation);

        const requested = document.createElement("p");
        requested.textContent =
            "Needed: " + getQuantity(need);

        const location = document.createElement("p");
        location.textContent =
            "Location: " +
            (getLocation(donation) ||
             getLocation(need) ||
             "Not specified");

        const status = document.createElement("p");
        status.textContent = "Status: Potential match";

        card.append(
            heading,
            food,
            available,
            requested,
            location,
            status
        );

        container.appendChild(card);
    });
}

displayMatches();