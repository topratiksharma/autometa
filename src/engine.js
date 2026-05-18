// (world: boolean[][]) => boolean[][]
export const next = (world) => {
  const nextWorld = structuredClone(world);
  const rows = nextWorld.length;
  const columns = nextWorld[0].length;
  // Change each cell
  for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
    for (let colIdx = 0; colIdx < columns; colIdx++) {
      nextWorld[rowIdx][colIdx] = census(colIdx, rowIdx, rows, columns, world);
    }
  }
  return nextWorld;
};

// #region Automaton

/**
 * This returns if the current coordinate should live or die
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {Array} rows world rows
 * @param {Array} columns world columns
 * @param {worldDataObject} data World data
 * @returns {boolean}
 */
function census(x, y, rows, columns, data) {
  const c = getNeighbors(x, y, rows, columns, data);
  return isLive(x, y, data) ? isHealthy(c) : isBorn(c);
}

/**
 * This returns the current coordinate counts
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {Array} rows world rows
 * @param {Array} columns world columns
 * @param {worldDataObject} data World data
 * @returns {boolean}
 */
function getNeighbors(x, y, rows, columns, data) {
  const l = (x - 1 + columns) % columns;
  const r = (x + 1) % columns;
  const u = (y - 1 + rows) % rows;
  const d = (y + 1) % rows;
  return (
    isLive(x, u, data) + isLive(x, d, data) +
    isLive(l, y, data) + isLive(r, y, data) +
    isLive(l, u, data) + isLive(r, u, data) +
    isLive(l, d, data) + isLive(r, d, data)
  );
}

/**
 * Checks if given coordinate is under populated with the count
 * @param {number} c
 * @returns {boolean}
 */
function isUnderPopulated(c) {
  return c < 2;
}

/**
 * Checks if given coordinate is Healthy or should live with the count
 * @param {number} c
 * @returns {boolean}
 */
function isHealthy(c) {
  return c === 2 || c === 3;
}

/**
 * Checks if given coordinate is over populated with the count
 * @param {number} c
 * @returns {boolean}
 */
function isOverPopulated(c) {
  return c > 3;
}

/**
 * Checks if given coordinate is should be born or generated
 * @param {number} c
 * @returns {boolean}
 */
function isBorn(c) {
  return c === 3;
}

/**
 *
 * @param {number} x X coordinate
 * @param {number} y Y Coordinates
 * @param {worldObject} data World Object
 * @returns {boolean} isCurrent Coordinate is live
 */
function isLive(x, y, data) {
  return data[y][x];
}
// #endregion

// (pattern: string) => boolean[][]
export const parse = (pattern) => {
  let parsedWorld = pattern
    .split("\n")
    .map((e) => e.split(""))
    .filter((n) => n.length > 0);

  for (let rowIdx = 0; rowIdx < parsedWorld.length; rowIdx++) {
    for (let colIdx = 0; colIdx < parsedWorld[rowIdx].length; colIdx++) {
      parsedWorld[rowIdx][colIdx] =
        parsedWorld[rowIdx][colIdx] === "O";
    }
  }

  return parsedWorld;
};
