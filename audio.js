const sounds = {
  flip: new Audio("./assets/SoundsForGame/flipcard-91468.mp3"),
  match: new Audio("./assets/SoundsForGame/correct-choice-43861.mp3"),
  wrong: new Audio("./assets/SoundsForGame/wronganswer-37702.mp3"),
  win: new Audio("./assets/SoundsForGame/success-340660.mp3"),
  button: new Audio("./assets/SoundsForGame/interface-button-154180.mp3")
};

let soundEnabled = true;

// Play sound helper
export function playSound(sound) {
  if (soundEnabled && sounds[sound]) {
    sounds[sound].currentTime = 0; // restart if already playing
    sounds[sound].play();
  }
}

// Toggle ON/OFF
export function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("toggle-sound");
  if (btn) btn.textContent = soundEnabled ? "🔊 Sound On" : "🔇 Sound Off";
}
