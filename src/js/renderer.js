export class Renderer {
  #ctx;
  #width;
  #height;
  #scale;
  #topSpace;
  #leftSpace;

  constructor(canvasId, { width, height, scale, topSpace = 0, leftSpace = 0 }) {
    const canvas = document.getElementById(canvasId);
    canvas.width = width * scale;
    canvas.height = height * scale;
    this.#ctx = canvas.getContext("2d");
    this.#width = width;
    this.#height = height;
    this.#scale = scale;
    this.#topSpace = topSpace;
    this.#leftSpace = leftSpace;
    this.clear();
  }

  clear() {
    this.#ctx.fillStyle = "#050A0E";
    this.#ctx.fillRect(0, 0, this.#width * this.#scale, this.#height * this.#scale);
  }

  /** Draws the world and returns the alive cell count. */
  render(world) {
    this.clear();
    let aliveCount = 0;

    this.#ctx.shadowBlur = 4;
    this.#ctx.shadowColor = "#00FF9D";
    this.#ctx.fillStyle = "#00FF9D";

    world.forEach((rows, y) => {
      rows.forEach((alive, x) => {
        if (alive) {
          aliveCount++;
          this.#ctx.fillRect(
            (x + this.#leftSpace) * this.#scale,
            (y + this.#topSpace) * this.#scale,
            this.#scale - 1,
            this.#scale - 1
          );
        }
      });
    });

    this.#ctx.shadowBlur = 0;
    return aliveCount;
  }
}
