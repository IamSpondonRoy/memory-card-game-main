import { showCountdown, wait } from "./countdown.js";

/**
 * Reveal all cards -> 3-2-1 countdown -> flip down -> visible shuffle (FLIP).
 * @param {Object} opts
 * @param {HTMLElement|string} opts.board - board element or selector
 * @param {number} opts.countdownSecs - seconds to count down while face-up
 * @param {number} opts.swaps - number of visible swaps to perform
 * @param {number} opts.swapMs - duration of each swap animation
 * @param {number} opts.pauseBetween - pause between swaps (ms)
 * @param {boolean} opts.highlight - outline the two swapping cards
 */
export async function revealThenShuffle({
  board,
  countdownSecs = 3,
  swaps = 4,
  swapMs = 700,
  pauseBetween = 120,
  highlight = true
} = {}) {
  const boardEl = typeof board === "string" ? document.querySelector(board) : board;
  if (!boardEl) throw new Error("revealThenShuffle: board not found");
  const nodes = Array.from(boardEl.querySelectorAll(".card"));
  if (nodes.length < 2) return;

  // 1) Reveal all (face-up)
  nodes.forEach(c => c.classList.add("flipped"));

  // 2) Visible 3-2-1 countdown
  await showCountdown(countdownSecs);

  // 3) Flip down (brief beat so players see the flip before motion)
  nodes.forEach(c => c.classList.remove("flipped"));
  await wait(600);

  // 4) Perform visible swaps using FLIP
  for (let i = 0; i < swaps; i++) {
    const [a, b] = pickTwoDistinct(nodes);

    if (highlight) { a.classList.add("is-swapping"); b.classList.add("is-swapping"); }

    // FIRST: initial positions
    const firstA = a.getBoundingClientRect();
    const firstB = b.getBoundingClientRect();

    // SWAP in DOM order (same parent grid preferred)
    const parent = a.parentNode;
    if (parent === b.parentNode) {
      const aPh = document.createElement("div");
      const bPh = document.createElement("div");
      aPh.style.display = bPh.style.display = "contents";
      parent.replaceChild(aPh, a);
      parent.replaceChild(bPh, b);
      parent.replaceChild(a, bPh);
      parent.replaceChild(b, aPh);
    } else {
      const aNext = a.nextElementSibling;
      const bNext = b.nextElementSibling;
      const aParent = a.parentNode;
      const bParent = b.parentNode;
      aParent.insertBefore(b, aNext);
      bParent.insertBefore(a, bNext);
    }

    // LAST: final positions
    const lastA = a.getBoundingClientRect();
    const lastB = b.getBoundingClientRect();

    // INVERT
    const dxA = firstA.left - lastA.left;
    const dyA = firstA.top  - lastA.top;
    const dxB = firstB.left - lastB.left;
    const dyB = firstB.top  - lastB.top;

    a.style.transition = "none";
    b.style.transition = "none";
    a.style.transform = `translate(${dxA}px, ${dyA}px)`;
    b.style.transform = `translate(${dxB}px, ${dyB}px)`;

    // force reflow
    a.getBoundingClientRect();

    // PLAY
    a.style.transition = `transform ${swapMs}ms ease`;
    b.style.transition = `transform ${swapMs}ms ease`;
    a.style.transform = "";
    b.style.transform = "";

    await wait(swapMs);

    // cleanup
    if (highlight) { a.classList.remove("is-swapping"); b.classList.remove("is-swapping"); }
    a.style.transition = ""; b.style.transition = "";
    a.style.transform = "";  b.style.transform = "";

    if (pauseBetween > 0) await wait(pauseBetween);
  }
}

function pickTwoDistinct(arr) {
  if (arr.length < 2) throw new Error("need at least 2 cards");
  let i = Math.floor(Math.random() * arr.length);
  let j = Math.floor(Math.random() * arr.length);
  while (j === i) j = Math.floor(Math.random() * arr.length);
  return i < j ? [arr[i], arr[j]] : [arr[j], arr[i]];
}
