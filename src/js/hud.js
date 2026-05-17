export class HUD {
  setGeneration(n) {
    document.getElementById("gen-counter").textContent =
      String(n).padStart(5, "0");
  }

  setAlive(n) {
    document.getElementById("alive-counter").textContent =
      String(n).padStart(5, "0");
  }

  setStatus(label, className = "") {
    const badge = document.getElementById("status-badge");
    badge.textContent = label;
    badge.className =
      "stat-value status-badge" + (className ? " " + className : "");
  }

  setButtonState(icon, label, isPaused) {
    const btn = document.getElementById("main-btn");
    btn.querySelector(".btn-icon").textContent = icon;
    btn.querySelector(".btn-label").textContent = label;
    btn.classList.toggle("paused", isPaused);
  }

  setSpeedPips(level) {
    document.querySelectorAll(".pip").forEach((pip, i) => {
      pip.classList.toggle("active", i < level);
    });
  }

  setDescription(text) {
    document.getElementById("pattern-description").innerHTML =
      `<span>${text}</span>`;
  }

  setCanvasRunning(running) {
    document
      .getElementById("canvas-container")
      .classList.toggle("running", running);
  }
}
