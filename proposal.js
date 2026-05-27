/* ========== Easy config (edit these) ========== */

// GIF/Image: change this one URL, or set to "" to hide the image on the second screen.
const CELEBRATION_IMAGE_URL =
  "https://media.giphy.com/media/MDJ9Ib6vE0a4yDMpDM/giphy.gif";

const NO_MESSAGES = [
  "Are you sure?",
  "Really sure?",
  "Last chance…",
  "You can’t escape 😭",
  "The Yes button is getting ideas…",
  "Okay but what if you misclicked?",
  "I’m not crying, you’re crying.",
  "Plot twist: resistance is futile.",
];

/* ========== DOM refs ========== */
const launchScreen = document.getElementById("launch-screen");
const questionHeader = document.getElementById("question-header");
const subtitleHint = document.getElementById("subtitle-hint");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const celebrationScreen = document.getElementById("celebration-screen");
const celebrationMediaWrap = document.getElementById("celebration-media-wrap");
const celebrationImg = document.getElementById("celebration-img");
const fxLayer = document.getElementById("fx-layer");

/* ========== Button logic ========== */
let noClickCount = 0;
const YES_SCALE_STEP = 0.22;
const YES_SCALE_MAX = 6.5;
const NO_SCALE_MIN = 0.35;
const NO_SCALE_STEP = 0.08;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function setNoButtonOffset() {
  const maxShift = Math.min(48, 12 + noClickCount * 4);
  const x = randomInRange(-maxShift, maxShift);
  const y = randomInRange(-maxShift, maxShift);
  document.documentElement.style.setProperty("--no-x", x + "px");
  document.documentElement.style.setProperty("--no-y", y + "px");
}

function applySizesFromCount() {
  const root = document.documentElement;
  const yesScale = Math.min(1 + noClickCount * YES_SCALE_STEP, YES_SCALE_MAX);
  const noScale = Math.max(1 - noClickCount * NO_SCALE_STEP, NO_SCALE_MIN);
  root.style.setProperty("--yes-scale", String(yesScale));
  root.style.setProperty("--no-scale", String(noScale));
}

function triggerDrama() {
  questionHeader.classList.remove("dramatic-wiggle");
  void questionHeader.offsetWidth;
  questionHeader.classList.add("dramatic-wiggle");

  btnYes.classList.remove("pulse-glow");
  void btnYes.offsetWidth;
  btnYes.classList.add("pulse-glow");

  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  setTimeout(function () {
    document.body.classList.remove("shake");
  }, 500);
}

function onNoClick() {
  noClickCount += 1;
  const msgIndex = Math.min(noClickCount - 1, NO_MESSAGES.length - 1);
  questionHeader.textContent = NO_MESSAGES[msgIndex];
  subtitleHint.textContent =
    noClickCount >= NO_MESSAGES.length
      ? "There is no escape from the Yes button. 💘"
      : "Still thinking? The universe is watching…";

  setNoButtonOffset();
  applySizesFromCount();
  triggerDrama();
}

function setupCelebrationMedia() {
  if (CELEBRATION_IMAGE_URL && CELEBRATION_IMAGE_URL.trim() !== "") {
    celebrationImg.src = CELEBRATION_IMAGE_URL;
    celebrationMediaWrap.classList.remove("is-hidden");
  } else {
    celebrationMediaWrap.classList.add("is-hidden");
    celebrationImg.removeAttribute("src");
  }
}

/* ========== Second screen + FX ========== */
let fxIntervalId = null;

function spawnHeart() {
  const el = document.createElement("span");
  el.className = "heart-bit";
  el.textContent = ["💕", "💖", "💗", "✨", "💘"][
    Math.floor(Math.random() * 5)
  ];
  el.style.left = randomInRange(0, 100) + "%";
  el.style.animationDuration = randomInRange(7, 14) + "s";
  el.style.animationDelay = randomInRange(0, 2) + "s";
  fxLayer.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 16000);
}

function spawnConfetti() {
  const el = document.createElement("span");
  el.className = "confetti-bit";
  const colors = ["#ff9ec7", "#c9b6ff", "#ffe08a", "#9ee4ff", "#ffb7d5"];
  el.style.background = colors[Math.floor(Math.random() * colors.length)];
  el.style.left = randomInRange(0, 100) + "%";
  el.style.animationDuration = randomInRange(5, 9) + "s";
  el.style.animationDelay = randomInRange(0, 1.5) + "s";
  fxLayer.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 12000);
}

function startBackgroundFx() {
  for (let i = 0; i < 12; i++) {
    setTimeout(spawnHeart, i * 200);
    setTimeout(spawnConfetti, i * 180 + 90);
  }
  fxIntervalId = window.setInterval(function () {
    if (Math.random() > 0.45) spawnHeart();
    else spawnConfetti();
  }, 450);
}

function stopBackgroundFx() {
  if (fxIntervalId) {
    clearInterval(fxIntervalId);
    fxIntervalId = null;
  }
  fxLayer.innerHTML = "";
}

function goToCelebration() {
  launchScreen.classList.add("is-leaving");
  setupCelebrationMedia();
  window.setTimeout(function () {
    celebrationScreen.classList.add("is-visible");
    startBackgroundFx();
  }, 550);
}

function onYesClick() {
  btnYes.disabled = true;
  btnNo.disabled = true;
  goToCelebration();

  /*
    Optional: start background music after first user gesture.
    Uncomment the <audio> block in proposal.html first, then uncomment below:

    var m = document.getElementById('bg-music');
    if (m) { m.volume = 0.35; m.play().catch(function() {}); }
  */
}

btnNo.addEventListener("click", onNoClick);
btnYes.addEventListener("click", onYesClick);

window.addEventListener(
  "beforeunload",
  function () {
    stopBackgroundFx();
  },
  { once: true }
);
