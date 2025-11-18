import LEVELS from "./levels.js";
import { playSound, toggleSound } from "./audio.js";
import { revealThenShuffle } from "./shuffle.js";

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
const winTitle = document.getElementById("win-title");
const levelEl = document.querySelector(".level");

let currentLevel = 0;
let rowsForLevel = 3;

// ==========================
// ===== POPUP HANDLING =====
// ==========================
const popup = document.getElementById("welcome-popup");
const startBtn = document.getElementById("start-btn");
const winPopup = document.getElementById("win-popup");
const playAgainBtn = document.getElementById("play-again-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const restartBtn = document.getElementById("restart-btn");
const toggleSoundBtn = document.getElementById("toggle-sound");

// Level buttons
const levelPickerPopup = document.getElementById("level-picker-popup");
const levelButtonsContainer = document.getElementById("level-buttons");
const levelSelectBtn = document.getElementById("level-select-btn");
const levelSelectBtnWin = document.getElementById("level-select-btn-win");
const closeLevelPicker = document.getElementById("close-level-picker");

startBtn.addEventListener("click", () => {
  playSound("button");
  popup.style.display = "none";
  startGame(currentLevel);
});

playAgainBtn.addEventListener("click", () => {
  playSound("button");
  winPopup.style.display = "none";
  restart();
});

if (nextLevelBtn) {
  nextLevelBtn.addEventListener("click", () => {
    playSound("button");
    winPopup.style.display = "none";
    currentLevel = (currentLevel + 1) % LEVELS.length;
    startGame(currentLevel);
  });
}

// Restart button
restartBtn.addEventListener("click", () => {
  playSound("button");
  restart();
});

// Toggle sound button
toggleSoundBtn.addEventListener("click", () => {
  toggleSound();
});

// Resize event
window.addEventListener("resize", () => setGrid(cards.length, rowsForLevel));

// ==========================
// ===== GAME FUNCTIONS =====
// ==========================
async function startGame(level = currentLevel) {
  await ensureFunFactsLoaded();

  const res = await fetch("./data/cards.json");
  const data = await res.json();

  const { pairs, rows } = LEVELS[level];
  rowsForLevel = rows;
  const pool = data.slice(0, Math.min(pairs, data.length));
  cards = [...pool, ...pool];
  shuffleCards();

  gridContainer.innerHTML = "";
  setGrid(cards.length, rows);
  generateCards();
  resetStats();
  updateBest();
  levelEl.textContent = level + 1;

  // Reveal → 3-2-1 countdown → flip down → visible shuffle
  lockBoard = true;
  gridContainer.classList.add("is-shuffling");
  await revealThenShuffle({
    board: gridContainer,
    countdownSecs: 3,
    swaps: Math.min(1 + Math.floor(level / 2), 4),
    swapMs: 1600,
    pauseBetween: 200,
    highlight: true
  });
  gridContainer.classList.remove("is-shuffling");
  lockBoard = false;
}

// Shuffle
function shuffleCards() {
  cards.sort(() => 0.5 - Math.random());
}

// Set Grid
function setGrid(n, rows = 3) {
  const cols = Math.ceil(n / rows);
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(80px, 120px))`;
}

// Generate cards
function generateCards() {
  gridContainer.innerHTML = "";
  setGrid(cards.length, rowsForLevel);
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
  playSound("flip");

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
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

// ===== Fun Facts popup =====
let FUN_FACTS_POOL = null;

async function ensureFunFactsLoaded() {
  if (FUN_FACTS_POOL) return;
  try {
    const res = await fetch("./data/funfacts.json");
    const raw = await res.json();

    if (Array.isArray(raw)) {
      // If it's just a flat list, fallback to a global pool
      FUN_FACTS_POOL = { _all: raw.filter(x => x?.ff) };
    } else {
      // Keep it as a dictionary keyed by animal name
      FUN_FACTS_POOL = {};
      for (const [animal, arr] of Object.entries(raw)) {
        FUN_FACTS_POOL[animal.toLowerCase()] = arr.filter(x => x?.ff);
      }
    }
  } catch (e) {
    console.warn("Failed to load funfacts.json", e);
    FUN_FACTS_POOL = [];
  }
}

function pickFactEN(animal) {
  if (!FUN_FACTS_POOL) return null;

  const key = animal?.toLowerCase().replace(/2$/, "");
  let pool = FUN_FACTS_POOL[key];

  // fallback if missing
  if (!pool || pool.length === 0) {
    pool = FUN_FACTS_POOL._all || [];
  }

  if (pool.length === 0) return null;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i].ff;
}

const funfactContainer = document.getElementById("funfact-container");
let toastSideRight = false;

function pushToast({ title = "Fun Fact", text = "", timeout = 3000 } = {}) {
  if (!funfactContainer) return;
  if (!text) return;

  funfactContainer.style.display = "block";

  if (funfactContainer.children.length >= 2) {
    funfactContainer.firstElementChild?.remove();
  }

  toastSideRight = !toastSideRight;
  const sideClass = toastSideRight ? "right" : "left";

  const el = document.createElement("div");
  el.className = `funfact-toast ${sideClass}`;
  el.innerHTML = `
    <h2>${title}</h2>
    <button class="close-btn" aria-label="Close">×</button>
    <p>${text}</p>
  `;

  const close = () => {
    if (!el.parentNode) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    setTimeout(() => {
      el.remove();
      if (funfactContainer.children.length === 0) {
        funfactContainer.style.display = "none";
      }
    }, 200);
  };
  el.querySelector(".close-btn").addEventListener("click", close);
  setTimeout(close, timeout);

  funfactContainer.appendChild(el);
}

function showFunFact(animal) {
  const text = pickFactEN(animal);
  if (!text) return false;
  pushToast({ title: `Fun Fact about  ${animal}`, text, timeout: 5000 });
  return true;
}

function renameAnimal(name) {
  return name
    .replace(/2$/, "")  
    .toLowerCase();       
}
function disableCards() {
  matches++;
  updateScore();

  playSound("match");

  const animal = renameAnimal(firstCard.dataset.name);
  
  showFunFact(animal);


  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  if (matches === cards.length / 2) {
    stopTimer();
    const score = calculateScore();
    saveBest(score);
    localStorage.setItem(`levelCompleted-${currentLevel}`, true);
    playSound("win");

    winTitle.textContent = `🎉 You finished Level ${currentLevel + 1}! 🎉`;
    finalScoreMsg.textContent = `Your Score: ${score} | Best Score: ${localStorage.getItem(bestKey())} | Best Time: ${formatTime(seconds)}`;

    setTimeout(() => {
      winPopup.style.display = "flex";
    }, 500);
  }
    resetBoard();
}

function unflipCards() {
  playSound("wrong");
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
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
  timerEl.textContent = "00:00";
  clearInterval(timerInterval);
}

function updateScore() {
  const score = calculateScore();
  scoreEl.textContent = score;
}

function calculateScore() {
  return matches * 100 - moves * 5 - Math.floor(seconds / 2);
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
    updateScore();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function bestKey() {
  return `bestScore-L${currentLevel}`;
}

// Best Score
function saveBest(score) {
  const key = bestKey();
  const best = Number(localStorage.getItem(key));
  if (!best || score > best) {
    localStorage.setItem(key, score);
  }
  updateBest();
}

function updateBest() {
  bestEl.textContent = localStorage.getItem(bestKey()) || 0;
}

// Restart
function restart() {
  resetBoard();
  startGame(currentLevel);
}

// Level buttons

levelSelectBtn.addEventListener("click", () => {
  playSound("button");
  showLevelPicker();
});

levelSelectBtnWin.addEventListener("click", () => {
  playSound("button");
  showLevelPicker();
});

closeLevelPicker.addEventListener("click", () => {
  playSound("button");
  levelPickerPopup.style.display = "none";
});

function showLevelPicker() {
  levelButtonsContainer.innerHTML = "";
  levelPickerPopup.style.display = "flex";

  LEVELS.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    // If player has completed the level, mark it
    const prevCompleted = i === 0 || localStorage.getItem(`levelCompleted-${i - 1}`);
    if (!prevCompleted) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }

    btn.addEventListener("click", () => {
      playSound("button");
      levelPickerPopup.style.display = "none";
      winPopup.style.display = "none";
      popup.style.display= "none";
      currentLevel = (currentLevel + i) % LEVELS.length;
      restart();
      startGame(currentLevel);
    });

    levelButtonsContainer.appendChild(btn);
  });
}