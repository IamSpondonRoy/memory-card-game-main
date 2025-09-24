const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let matches = 0;
let timerInterval;
let seconds = 0;

// Score elements
const scoreEl = document.querySelector(".score");
const movesEl = document.querySelector(".moves");
const timerEl = document.querySelector(".timer");
const bestEl = document.querySelector(".best");
const finalScoreMsg = document.getElementById("final-score-msg");

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
      resetStats();
      updateBest();
    });
}

// Shuffle
function shuffleCards() {
  cards.sort(() => 0.5 - Math.random());
}

// Generate cards
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
  if (lockBoard || this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    if (moves === 0 && matches === 0) startTimer();
    return;
  }

  secondCard = this;
  moves++;
  movesEl.textContent = moves;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  matches++;
  updateScore();

  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  if (matches === cards.length / 2) {
    stopTimer();
    let score = calculateScore();
    saveBest(score);
    finalScoreMsg.textContent = `Your Score: ${score} | Best: ${localStorage.getItem("bestScore")}`;
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
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

// ==========================
// ===== STATS & SCORE ======
// ==========================
function resetStats() {
  moves = 0;
  matches = 0;
  seconds = 0;
  movesEl.textContent = 0;
  scoreEl.textContent = 0;
  timerEl.textContent = "0s";
  clearInterval(timerInterval);
}

function updateScore() {
  let score = calculateScore();
  scoreEl.textContent = score;
}

function calculateScore() {
  return matches * 100 - moves * 5 - Math.floor(seconds / 2);
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = `${seconds}s`;
    updateScore();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Best Score
function saveBest(score) {
  let best = localStorage.getItem("bestScore");
  if (!best || score > best) {
    localStorage.setItem("bestScore", score);
  }
  updateBest();
}

function updateBest() {
  bestEl.textContent = localStorage.getItem("bestScore") || 0;
}

// Restart
function restart() {
  resetBoard();
  shuffleCards();
  generateCards();
  resetStats();
}
