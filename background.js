// ==========================
// ===== SKY BACKGROUND =====
// ==========================
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Sky mode: "day", "evening", or "night"
const modes = ["day", "evening", "night"];
let skyMode = modes[Math.floor(Math.random() * modes.length)];

// ---------- Clouds (code-drawn, no image) ----------
const clouds = [];
for (let i = 0; i < 8; i++) {
  clouds.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * (window.innerHeight / 2),
    speed: 0.2 + Math.random() * 0.5,
    scale: 0.6 + Math.random() * 1.4
  });
}

// fluffy cartoon clouds using circles
function drawCloudShape(x, y, scale = 1, dark = false) {
  ctx.fillStyle = dark ? "rgba(200,200,200,0.8)" : "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 40 * scale, y + 10 * scale, 35 * scale, 0, Math.PI * 2);
  ctx.arc(x - 40 * scale, y + 10 * scale, 35 * scale, 0, Math.PI * 2);
  ctx.arc(x, y + 20 * scale, 40 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(dark = false) {
  for (let cloud of clouds) {
    drawCloudShape(cloud.x, cloud.y, cloud.scale, dark);

    // move cloud
    cloud.x -= cloud.speed;
    if (cloud.x < -200) {
      cloud.x = canvas.width + 50;
      cloud.y = Math.random() * (canvas.height / 2);
    }
  }
}

// ---------- Stars (night only) ----------
let stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    alpha: Math.random(),
    fade: Math.random() * 0.02
  });
}

function drawStars() {
  ctx.fillStyle = "white";
  for (let star of stars) {
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    // twinkle
    star.alpha += star.fade;
    if (star.alpha <= 0 || star.alpha >= 1) star.fade = -star.fade;
  }
  ctx.globalAlpha = 1;
}

// ---------- Sun & Moon ----------
function drawSun(x, y) {
  let gradient = ctx.createRadialGradient(x, y, 30, x, y, 80);
  gradient.addColorStop(0, "rgba(255,255,0,1)");
  gradient.addColorStop(1, "rgba(255,165,0,0.3)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoon(x, y) {
  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000814";
  ctx.beginPath();
  ctx.arc(x + 15, y - 5, 40, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- Main Draw Function ----------
function drawSky() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (skyMode === "day") {
    // Gradient blue sky
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#4682B4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSun(canvas.width * 0.8, 100);
    drawClouds(false);

  } else if (skyMode === "evening") {
    // Sunset gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#FF7E5F");
    gradient.addColorStop(0.4, "#FD3A69");
    gradient.addColorStop(1, "#2A2A72");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSun(canvas.width * 0.7, canvas.height * 0.85);
    drawClouds(true);

  } else if (skyMode === "night") {
    ctx.fillStyle = "#000814";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawMoon(canvas.width * 0.8, 120);
  }
}

// ---------- Animate ----------
function animateSky() {
  drawSky();
  requestAnimationFrame(animateSky);
}
animateSky();
