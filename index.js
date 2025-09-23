const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let matchedPairs = 0;

// Show score
document.querySelector(".score").textContent = score;

// ==========================
// ===== POPUP HANDLING =====
// ==========================
const popup = document.getElementById("welcome-popup");
const startBtn = document.getElementById("start-btn");
const winPopup = document.getElementById("win-popup");
const playAgainBtn = document.getElementById("play-again-btn");

startBtn.addEventListener("click", () => {
  popup.style.display = "none";
  startGame();
});

playAgainBtn.addEventListener("click", () => {
  winPopup.style.display = "none";
  restart();
});

// ==========================
// ===== GAME FUNCTIONS =====
// ==========================
function startGame() {
  fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
      cards = [...data, ...data]; // duplicate for pairs
      shuffleCards();
      generateCards();
      matchedPairs = 0;
      score = 0;
      document.querySelector(".score").textContent = score;
    });
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  gridContainer.innerHTML = "";
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  document.querySelector(".score").textContent = score;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  matchedPairs++;

  if (matchedPairs === cards.length / 2) {
    setTimeout(() => {
      winPopup.style.display = "flex";
    }, 500);
  }

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  matchedPairs = 0;
  document.querySelector(".score").textContent = score;
  gridContainer.innerHTML = "";
  generateCards();
}
