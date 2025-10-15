export async function showCountdown(secs = 3) {
  const overlay = document.getElementById("countdown");
  const num = document.getElementById("countdown-num");

  if (!overlay || !num) {
    // fallback if the overlay isn't in the DOM
    await wait(secs * 1000);
    return;
  }

  overlay.classList.remove("hidden");
  for (let t = secs; t > 0; t--) {
    num.textContent = t;
    // restart the CSS animation each tick
    num.style.animation = "none";
    void num.offsetWidth; // force reflow
    num.style.animation = "pop 1s ease both";
    await wait(1000);
  }
  overlay.classList.add("hidden");
}

export function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
