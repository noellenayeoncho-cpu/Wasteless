function getSavedData(key) {
    try {
        let data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
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
    ).trim().toLowerCase().replace(/\s+/g, " ");
}

function getLocation(item) {
    return String(
        item.location ||
        item["food-location"] ||
        ""
    ).trim().toLowerCase().replace(/\s+/g, " ");
}

function findMatches() {
    let donations = getSavedData("donations");
    let needs = getSavedData("needs");
    let matches = [];

    donations.forEach(function(donation) {
        needs.forEach(function(need) {
            let sameFood = getFoodName(donation) !== "" &&
                getFoodName(donation) === getFoodName(need);

            let enoughFood = getQuantity(donation) > 0 &&
                getQuantity(need) > 0 &&
                getQuantity(donation) >= getQuantity(need);

            let donationLocation = getLocation(donation);
            let needLocation = getLocation(need);

            let sameLocation = donationLocation === "" ||
                needLocation === "" ||
                donationLocation === needLocation;

            if (sameFood && enoughFood && sameLocation) {
                matches.push({
                    donation: donation,
                    need: need
                });
            }
        });
    });

    return matches;
}

function displayMatches() {
    let container = document.getElementById("matches-list");
    let matches = findMatches();

    container.innerHTML = "";

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="match-card">
                <h3>No matches yet!</h3>
                <p>When a match is found, it will appear here.</p>
            </div>
        `;
        return;
    }

    matches.forEach(function(match) {
        let card = document.createElement("div");
        card.className = "match-card";

        let heading = document.createElement("h3");
        heading.textContent = "A Match Was Found!";

        let food = document.createElement("p");
        food.textContent = "Food: " + getFoodName(match.donation);

        let available = document.createElement("p");
        available.textContent = "Available: " + getQuantity(match.donation);

        let needed = document.createElement("p");
        needed.textContent = "Needed: " + getQuantity(match.need);

        let location = document.createElement("p");
        location.textContent = "Location: " +
            (getLocation(match.donation) ||
            getLocation(match.need) ||
            "Not specified");

        let status = document.createElement("p");
        status.textContent = "Status: Potential match";

        card.append(heading, food, available, needed, location, status);
        container.appendChild(card);
    });
}

displayMatches();