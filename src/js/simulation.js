import { next } from "../engine.js";

const SPEED_LEVELS = [500, 200, 100, 50, 16];

export class Simulation {
  #renderer;
  #hud;
  #world = null;
  #timer = null;
  #running = false;
  #generation = 0;
  #speed;

  constructor(renderer, hud, { initialSpeed = 3 } = {}) {
    if (initialSpeed < 1 || initialSpeed > 5) {
      throw new RangeError(`initialSpeed must be 1-5, got ${initialSpeed}`);
    }
    this.#renderer = renderer;
    this.#hud = hud;
    this.#speed = initialSpeed;
  }

  get isRunning() {
    return this.#running;
  }
  get generation() {
    return this.#generation;
  }

  load(world) {
    this.#world = world;
    const alive = this.#renderer.render(world);
    this.#hud.setAlive(alive);
  }

  start() {
    if (!this.#world) return;
    this.#running = true;
    this.#hud.setButtonState("⏸", "PAUSE", false);
    this.#hud.setStatus("RUNNING", "running");
    this.#hud.setCanvasRunning(true);
    this.#startLoop();
  }

  pause() {
    clearInterval(this.#timer);
    this.#running = false;
    this.#hud.setButtonState("▶", "RESUME", true);
    this.#hud.setStatus("PAUSED", "paused");
    this.#hud.setCanvasRunning(false);
  }

  toggle() {
    this.#running ? this.pause() : this.start();
  }

  reset() {
    clearInterval(this.#timer);
    this.#running = false;
    this.#world = null;
    this.#generation = 0;
    this.#hud.setGeneration(0);
    this.#hud.setAlive(0);
    this.#hud.setStatus("IDLE");
    this.#hud.setButtonState("▶", "START", false);
    this.#hud.setCanvasRunning(false);
    this.#renderer.clear();
  }

  adjustSpeed(delta) {
    const clamped = Math.max(1, Math.min(5, this.#speed + delta));
    if (clamped === this.#speed) return;
    this.#speed = clamped;
    this.#hud.setSpeedPips(this.#speed);
    if (this.#running) this.#startLoop();
  }

  #startLoop() {
    clearInterval(this.#timer);
    this.#timer = setInterval(
      () => {
        this.#world = next(this.#world);
        this.#generation++;
        const alive = this.#renderer.render(this.#world);
        this.#hud.setGeneration(this.#generation);
        this.#hud.setAlive(alive);
      },
      SPEED_LEVELS[this.#speed - 1],
    );
  }
}
