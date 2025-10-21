
const cards = document.querySelectorAll(".votationCard");
const submitButton = document.querySelector(".submitVotations");

// incialización de las votaciones
function initializeVotations() {
  cards.forEach(setupCard);
  submitButton.addEventListener("click", handleSubmit);
  console.log("Votation system initialized successfully");
}

// incialización de cada tarjeta de votación
function setupCard(card) {
  const stars = card.querySelectorAll(".star");
  const scoreElement = card.querySelector(".votationCard__score");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.value);
      updateStars(stars, rating);
      scoreElement.textContent = rating;
      card.dataset.rating = rating;
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
  const results = [];
  let allRated = true;

  cards.forEach(card => {
    const name = card.dataset.member;
    const rating = parseInt(card.dataset.rating || "0");
    if (rating === 0) allRated = false;
    results.push({ name, rating });
  });

  if (!allRated) {
    alert("Please rate all team members before submitting!");
    console.warn("Incomplete ratings:", results);
    return;
  }

  console.log("Submitted ratings:", results);
}

// === Start ===
initializeVotations();