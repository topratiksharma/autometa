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
  // Row 0 is at the top of the canvas; y increases downward.
  let s = y != rows - 1;    // can look south (y + 1 exists)
  let w = x != 0;            // can look west  (x - 1 exists)
  let n = y != 0;            // can look north (y - 1 exists)
  let e = x != columns - 1; // can look east  (x + 1 exists)
  let count = 0;
  if (s && isLive(x, y + 1, data)) count++;
  if (s && w && isLive(x - 1, y + 1, data)) count++;
  if (w && isLive(x - 1, y, data)) count++;
  if (n && w && isLive(x - 1, y - 1, data)) count++;
  if (n && isLive(x, y - 1, data)) count++;
  if (n && e && isLive(x + 1, y - 1, data)) count++;
  if (e && isLive(x + 1, y, data)) count++;
  if (s && e && isLive(x + 1, y + 1, data)) count++;
  return count;
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
