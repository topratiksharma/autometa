import { parse } from "../engine.js";
import { PatternLibrary } from "./library.js";
import { Renderer } from "./renderer.js";
import { HUD } from "./hud.js";
import { Simulation } from "./simulation.js";

const library = PatternLibrary.load();

const renderer = new Renderer("life-canvas", {
  width: 240,
  height: 120,
  scale: 4,
  topSpace: 40,
  leftSpace: 100,
});

const hud = new HUD();
const sim = new Simulation(renderer, hud, { initialSpeed: 3 });

library.populate(document.getElementById("availableRecords"));

window.optionChange = (name) => {
  if (!name) return;
  sim.reset();
  hud.setDescription(library.find(name).description);
};

window.toggleProcess = () => {
  const name = document.getElementById("availableRecords").value;
  if (!name) return;
  if (!sim.isRunning && sim.generation === 0) {
    sim.load(parse(library.find(name).pattern));
  }
  sim.toggle();
};

window.changeSpeed = (delta) => sim.adjustSpeed(delta);
