import { next, parse } from "../engine.js";

// ─── Constants ─────────────────────────────────────────────────
const scale = 4;
const worldWidth = 480;
const worldHeight = 240;
const topSpace = 100;
const leftSpace = 220;
const speedLevels = [500, 200, 100, 50, 16];

// ─── State ─────────────────────────────────────────────────────
let ctx;
let selectedWorld;
let timer;
let isRunning = false;
let generation = 0;
let currentSpeed = 3;

// ─── Boot ───────────────────────────────────────────────────────
const worldData = await readFile();
initializeSelectOptions();
initializeCanvas();

// ─── Init ───────────────────────────────────────────────────────
function initializeSelectOptions() {
  const selectEl = document.getElementById("availableRecords");
  worldData.forEach((entry) => {
    const opt = document.createElement("option");
    opt.text = entry.name;
    selectEl.add(opt);
  });
}

function initializeCanvas() {
  const canvas = document.getElementById("life-canvas");
  canvas.width = worldWidth * scale;
  canvas.height = worldHeight * scale;
  ctx = canvas.getContext("2d");
  clearCanvas();
}

function clearCanvas() {
  ctx.fillStyle = "#050A0E";
  ctx.fillRect(0, 0, worldWidth * scale, worldHeight * scale);
}

// ─── Render ─────────────────────────────────────────────────────
function render(world) {
  clearCanvas();

  let aliveCount = 0;

  ctx.shadowBlur = 4;
  ctx.shadowColor = "#00FF9D";
  ctx.fillStyle = "#00FF9D";

  world.forEach((rows, y) => {
    rows.forEach((alive, x) => {
      if (alive) {
        aliveCount++;
        ctx.fillRect(
          (x + leftSpace) * scale,
          (y + topSpace) * scale,
          scale - 1,
          scale - 1
        );
      }
    });
  });

  ctx.shadowBlur = 0;

  document.getElementById("alive-counter").textContent =
    String(aliveCount).padStart(5, "0");
}

// ─── HUD updates ────────────────────────────────────────────────
function setGeneration(n) {
  generation = n;
  document.getElementById("gen-counter").textContent =
    String(generation).padStart(5, "0");
}

function setStatus(label, className = "") {
  const badge = document.getElementById("status-badge");
  badge.textContent = label;
  badge.className = "stat-value status-badge" + (className ? " " + className : "");
}

function setButtonState(icon, label, isPaused) {
  const btn = document.getElementById("main-btn");
  btn.querySelector(".btn-icon").textContent = icon;
  btn.querySelector(".btn-label").textContent = label;
  btn.classList.toggle("paused", isPaused);
}

function updateSpeedPips() {
  document.querySelectorAll(".pip").forEach((pip, i) => {
    pip.classList.toggle("active", i < currentSpeed);
  });
}

// ─── Simulation loop ────────────────────────────────────────────
function startLoop() {
  clearInterval(timer);
  timer = setInterval(() => {
    selectedWorld = next(selectedWorld);
    setGeneration(generation + 1);
    render(selectedWorld);
  }, speedLevels[currentSpeed - 1]);
}

// ─── File loading ────────────────────────────────────────────────
async function readFile() {
  return new Promise((resolve) => {
    readJsonFile("./src/lexicon.json", (text) => resolve(JSON.parse(text)));
  });
}

function readJsonFile(file, callback) {
  const rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = () => {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

// ─── Event handlers (window-scoped for HTML onXxx) ───────────────
window.optionChange = (selectedOption) => {
  if (!selectedOption) return;

  // Stop any running simulation
  clearInterval(timer);
  isRunning = false;
  setGeneration(0);
  setStatus("IDLE");
  setButtonState("▶", "START", false);
  document.getElementById("canvas-container").classList.remove("running");
  clearCanvas();

  const entry = worldData.find((s) => s.name === selectedOption);
  const descEl = document.getElementById("pattern-description");
  descEl.innerHTML = `<span>${entry.description}</span>`;
};

window.toggleProcess = () => {
  const selectedOption = document.getElementById("availableRecords").value;
  if (!selectedOption) return;

  if (!isRunning) {
    // Fresh start (or resume from paused)
    if (generation === 0) {
      selectedWorld = parse(
        worldData.find((s) => s.name === selectedOption).pattern
      );
      render(selectedWorld);
    }
    isRunning = true;
    setButtonState("⏸", "PAUSE", false);
    setStatus("RUNNING", "running");
    document.getElementById("canvas-container").classList.add("running");
    startLoop();
  } else {
    // Pause
    clearInterval(timer);
    isRunning = false;
    setButtonState("▶", "RESUME", true);
    setStatus("PAUSED", "paused");
    document.getElementById("canvas-container").classList.remove("running");
  }
};

window.changeSpeed = (delta) => {
  const next_ = Math.max(1, Math.min(5, currentSpeed + delta));
  if (next_ === currentSpeed) return;
  currentSpeed = next_;
  updateSpeedPips();
  if (isRunning) startLoop();
};
