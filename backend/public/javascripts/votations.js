const cards = document.querySelectorAll(".votationCard");
const submitButton = document.querySelector(".submitVotations");
const form = document.getElementById("voteForm");

// initialization of votations
function initializeVotations() {
    cards.forEach(setupCard);
    submitButton?.addEventListener("click", handleSubmit);
    console.log("Votation system initialized successfully");
}

// initialization of each votation card
function setupCard(card) {
    if (card.dataset.readonly === "true") return;
    const stars = card.querySelectorAll(".star");
    const scoreElement = card.querySelector(".votationCard__score");
    const memberId = card.dataset.memberId;
    const hiddenIdInput = form.querySelector(`input[name="userIds[]"][value="${memberId}"]`);
    const hiddenScoreInput = hiddenIdInput.nextElementSibling;


    stars.forEach(star => {
        star.addEventListener("click", () => {
            const rating = parseInt(star.dataset.value);
            updateStars(stars, rating);
            scoreElement.textContent = rating;
            card.dataset.rating = rating;
            hiddenScoreInput.value = rating;
        });
    });
}

// update visual stars
function updateStars(stars, rating) {
    stars.forEach((star, index) => {
        star.textContent = index < rating ? "★" : "☆";
    });
}

// handle submission of votations
function handleSubmit() {
    const allRated = Array.from(cards).every(card => parseInt(card.dataset.rating || "0") > 0);
    if (!allRated) {
        alert("Please rate all team members before submitting!");
        return;
    }
    submitFormById("voteForm");
}

// === Start ===
initializeVotations();