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
let FUN_FACTS_POOL = null; // 會是一個 [{en: "..."}, ...] 的陣列

async function ensureFunFactsLoaded() {
  if (FUN_FACTS_POOL) return;              // 已載入就跳過
  try {
    const res = await fetch("./data/funfacts.json");
    const raw = await res.json();
    // 支援兩種格式：
    // 1) 物件 { Koala:[{en},{en}], Wombat:[{en}] }
    // 2) 陣列 [{en}, {en}]
    if (Array.isArray(raw)) {
      FUN_FACTS_POOL = raw.filter(x => x?.ff);
    } else {
      FUN_FACTS_POOL = Object.values(raw).flat().filter(x => x?.ff);
    }
  } catch (e) {
    console.warn("Failed to load funfacts.json", e);
    FUN_FACTS_POOL = [];
  }
}

function pickRandomFactEN() {
  if (!FUN_FACTS_POOL || FUN_FACTS_POOL.length === 0) return null;
  const i = Math.floor(Math.random() * FUN_FACTS_POOL.length);
  return FUN_FACTS_POOL[i].ff;
}

const funfactContainer = document.getElementById("funfact-container");
let toastSideRight = false; // 左/右交錯

function pushToast({ title = "Fun Fact", text = "", timeout = 3000 } = {}) {
  if (!funfactContainer) return;
  if (!text) return;

  funfactContainer.style.display = "block"; // 有東西才顯示

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

  // 關閉（手動/自動）
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

// 從池子抽一句英文 → 丟一個 toast
function showFunFact() {
  const text = pickRandomFactEN();
  if (!text) return false;
  pushToast({ title: "Fun Fact", text, timeout: 2200 });
  return true;
}

function disableCards() {
  matches++;
  updateScore();

  playSound("match");

  showFunFact();

  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  if (matches === cards.length / 2) {
    stopTimer();
    const score = calculateScore();
    saveBest(score);

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
