import { parse } from "../engine.js";
import { PatternLibrary } from "./library.js";
import { Renderer } from "./renderer.js";
import { HUD } from "./hud.js";
import { Simulation } from "./simulation.js";

const WORLD_WIDTH  = 240;
const WORLD_HEIGHT = 120;

// Places a parsed pattern at the centre of a full WORLD_WIDTH×WORLD_HEIGHT grid.
function embedPattern(pattern) {
  const ph = pattern.length;
  const pw = Math.max(...pattern.map((r) => r.length));
  const ox = Math.floor((WORLD_WIDTH  - pw) / 2);
  const oy = Math.floor((WORLD_HEIGHT - ph) / 2);

  const world = Array.from({ length: WORLD_HEIGHT }, () =>
    Array(WORLD_WIDTH).fill(false)
  );
  pattern.forEach((row, y) => {
    row.forEach((cell, x) => {
      const wx = ox + x;
      const wy = oy + y;
      if (wx >= 0 && wx < WORLD_WIDTH && wy >= 0 && wy < WORLD_HEIGHT) {
        world[wy][wx] = cell;
      }
    });
  });
  return world;
}

const library = PatternLibrary.load();

// topSpace/leftSpace are 0 — the pattern is already positioned inside the world.
const renderer = new Renderer("life-canvas", {
  width:  WORLD_WIDTH,
  height: WORLD_HEIGHT,
  scale:  4,
});

const hud = new HUD();
const sim = new Simulation(renderer, hud, { initialSpeed: 3 });

const selectEl = document.getElementById("availableRecords");
library.populate(selectEl);

// Auto-select first pattern and show its description immediately
selectEl.selectedIndex = 0;
hud.setDescription(library.find(selectEl.value).description);

window.optionChange = (name) => {
  if (!name) return;
  sim.reset();
  hud.setDescription(library.find(name).description);
};

window.toggleProcess = () => {
  const name = selectEl.value;
  if (!name) {
    const pill = document.querySelector(".control-pill");
    const hint = document.getElementById("select-hint");
    pill.classList.add("no-selection");
    hint.classList.add("visible");
    setTimeout(() => {
      pill.classList.remove("no-selection");
      hint.classList.remove("visible");
    }, 2000);
    return;
  }
  if (!sim.isRunning && sim.generation === 0) {
    sim.load(embedPattern(parse(library.find(name).pattern)));
  }
  sim.toggle();
};

window.changeSpeed = (delta) => sim.adjustSpeed(delta);
