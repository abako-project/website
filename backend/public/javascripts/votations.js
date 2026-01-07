const cards = document.querySelectorAll(".votationCard");
const submitButton = document.querySelector(".submitVotations");
const form = document.getElementById("voteForm");

// incialización de las votaciones
function initializeVotations() {
    cards.forEach(setupCard);
    submitButton?.addEventListener("click", handleSubmit);
    console.log("Votation system initialized successfully");
}

// incialización de cada tarjeta de votación
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

// actualizar las estrellas visuales
function updateStars(stars, rating) {
    stars.forEach((star, index) => {
        star.textContent = index < rating ? "★" : "☆";
    });
}

//  gestionar el envío de votaciones
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