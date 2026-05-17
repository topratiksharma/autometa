# Code Review: autometa src/js/ — JavaScript module suite

## Summary

The refactor into focused classes (`Renderer`, `HUD`, `Simulation`, `PatternLibrary`) is well executed: each class owns exactly one concern, private `#fields` are used consistently, and the orchestrator in `index.js` is appropriately thin. The engine logic in `engine.js` is functionally correct and well-tested, though several of its helpers can be substantially simplified. No blocking correctness bugs were found; the main areas for improvement are code clarity and a handful of defensive-programming gaps.

**Verdict:** `APPROVE_WITH_SUGGESTIONS`

## Statistics

- **Total Comments:** 14
- **Blocking Issues:** 0
- **Non-blocking Suggestions:** 8
- **Nitpicks:** 2
- **Praise:** 4

## Prioritized Recommendations

1. **(Non-blocking, security)** Replace `innerHTML` in `HUD.setDescription` with safe DOM construction — low effort, eliminates a class of risk.
2. **(Non-blocking)** Simplify `census()` from ~20 lines to 2 — the current form is correct but the predicate flags obscure what is fundamentally a one-liner.
3. **(Non-blocking)** Fix the swapped compass-direction comments in `getNeighbors` — they will confuse anyone debugging neighbor-counting logic.
4. **(Non-blocking)** Swap `JSON.parse(JSON.stringify(...))` for `structuredClone()` in `next()` — clearer intent and better performance on large grids.

---

## Detailed Feedback

### Blocking Issues

_None._

---

### Suggestions & Improvements

---

**suggestion (non-blocking, security): Replace innerHTML with safe DOM construction**

**Location:** `src/js/hud.js:L33–34`

**Original Code:**
```javascript
setDescription(text) {
  document.getElementById("pattern-description").innerHTML =
    `<span>${text}</span>`;
}
```

**Suggested Fix:**
```javascript
setDescription(text) {
  const el = document.getElementById("pattern-description");
  el.replaceChildren(Object.assign(document.createElement("span"), { textContent: text }));
}
```

**Rationale:**
`text` comes from `lexicon.json` which is a local file, so exploitation requires the file to be compromised. That said, using `innerHTML` with any externally-read string establishes a habit that becomes dangerous the moment the data source changes (e.g., a remote API). `textContent` or DOM node construction costs nothing and eliminates the risk entirely.

---

**suggestion (non-blocking): Simplify `census()` to a direct conditional return**

**Location:** `src/engine.js:L31–51`

**Original Code:**
```javascript
function census(x, y, rows, columns, data) {
  let c = getNeighbors(x, y, rows, columns, data);
  let underPopulated = false;
  let healthy = false;
  let overPopulated = false;
  let born = false;
  if (isLive(x, y, data)) {
    underPopulated = isUnderPopulated(c);
    healthy = isHealthy(c);
    overPopulated = isOverPopulated(c);
  } else {
    born = isBorn(c);
  }
  if (underPopulated || overPopulated) { return false; }
  if (healthy || born) { return true; }
  return false;
}
```

**Suggested Fix:**
```javascript
function census(x, y, rows, columns, data) {
  const c = getNeighbors(x, y, rows, columns, data);
  return isLive(x, y, data) ? isHealthy(c) : isBorn(c);
}
```

**Rationale:**
The four flag variables are each initialised to `false` and at most one branch conditionally sets some of them. The final logic reduces to: a live cell survives iff it's healthy (2–3 neighbours); a dead cell is born iff it has exactly 3 neighbours. `isHealthy` already covers the full live-cell survival condition (`c === 2 || c === 3`), making `isUnderPopulated` and `isOverPopulated` redundant at the call site. The one-liner expresses the Game of Life rules exactly as Conway stated them.

---

**suggestion (non-blocking): Fix swapped compass-direction comments in `getNeighbors`**

**Location:** `src/engine.js:L63–66`

**Original Code:**
```javascript
let n = y != rows - 1; // has northern neighbors
let e = x != 0;        // has eastern neighbors
let s = y != 0;        // has southern neighbors
let w = x != columns - 1; // has western neighbors
```

**Suggested Fix:**
```javascript
// Canvas renders row 0 at the top; y increases downward.
let s = y != rows - 1;     // can look south  (y + 1 exists)
let w = x != 0;             // can look west   (x - 1 exists)
let n = y != 0;             // can look north  (y - 1 exists)
let e = x != columns - 1;  // can look east   (x + 1 exists)
```

**Rationale:**
The renderer places row 0 at the top of the canvas, so y increases going *down* (south). The variable `n` is used to guard `isLive(x, y + 1, ...)` which accesses the row *below* — south, not north. Similarly, `e` guards `isLive(x - 1, ...)` which is the column to the *left* — west. The mislabelling doesn't affect correctness (the logic itself is right) but will mislead anyone reasoning through a debugging session.

---

**suggestion (non-blocking, performance): Replace JSON round-trip clone with `structuredClone`**

**Location:** `src/engine.js:L3`

**Original Code:**
```javascript
const nextWorld = JSON.parse(JSON.stringify(world));
```

**Suggested Fix:**
```javascript
const nextWorld = structuredClone(world);
```

**Rationale:**
`structuredClone` (baseline-available since 2022) was designed for exactly this use case, is implemented natively in the engine, and avoids the serialize→string→parse round-trip. For the current 480×240 boolean grid (~115 k cells) running at 16–500 ms intervals the difference is modest, but `structuredClone` communicates intent more precisely and will scale better if the grid ever grows.

---

**suggestion (non-blocking): Eliminate redundant ternary in `parse`**

**Location:** `src/engine.js:L137`

**Original Code:**
```javascript
parsedWorld[rowIdx][colIdx] =
  parsedWorld[rowIdx][colIdx] === "O" ? true : false;
```

**Suggested Fix:**
```javascript
parsedWorld[rowIdx][colIdx] = parsedWorld[rowIdx][colIdx] === "O";
```

**Rationale:**
`=== "O"` already returns a boolean; wrapping it in `? true : false` is noise that a reader has to parse before concluding it does nothing extra.

---

**suggestion (non-blocking): Validate `initialSpeed` in `Simulation` constructor**

**Location:** `src/js/simulation.js:L14–18`

**Original Code:**
```javascript
constructor(renderer, hud, { initialSpeed = 3 } = {}) {
  this.#renderer = renderer;
  this.#hud = hud;
  this.#speed = initialSpeed;
}
```

**Suggested Fix:**
```javascript
constructor(renderer, hud, { initialSpeed = 3 } = {}) {
  if (initialSpeed < 1 || initialSpeed > 5) {
    throw new RangeError(`initialSpeed must be 1–5, got ${initialSpeed}`);
  }
  this.#renderer = renderer;
  this.#hud = hud;
  this.#speed = initialSpeed;
}
```

**Rationale:**
`SPEED_LEVELS[this.#speed - 1]` silently returns `undefined` for any out-of-range speed, causing `setInterval(fn, undefined)` to fire as fast as possible. A constructor-level guard surfaces the misconfiguration immediately at the call site rather than producing mysterious behaviour at runtime. `adjustSpeed` already clamps correctly; the constructor should match that vigilance.

---

**suggestion (non-blocking): Guard `PatternLibrary.find()` against `undefined`**

**Location:** `src/js/library.js:L25–26` / `src/js/index.js:L25, L32`

**Original Code:**
```javascript
// library.js
find(name) {
  return this.#patterns.find((p) => p.name === name);
}

// index.js callers
hud.setDescription(library.find(name).description);
sim.load(parse(library.find(name).pattern));
```

**Suggested Fix:**
```javascript
// library.js
find(name) {
  const entry = this.#patterns.find((p) => p.name === name);
  if (!entry) throw new Error(`Unknown pattern: "${name}"`);
  return entry;
}
```

**Rationale:**
`Array.prototype.find` returns `undefined` when no element matches. Both callers immediately access `.description` / `.pattern` on the result; a missing match would throw `TypeError: Cannot read properties of undefined` — a confusing error that hides the real problem. Throwing a descriptive error in `find()` puts the failure message at the source and makes future debugging trivial. Since the names come directly from the populated `<select>`, a mismatch shouldn't happen in practice — but constraints that "can't happen" are exactly where a clear error message pays off.

---

**suggestion (non-blocking): Simplify multi-flag boolean variables in `census`**

**Location:** `src/engine.js:L33–36`

**Original Code:**
```javascript
let underPopulated = false;
let healthy = false;
let overPopulated = false;
let born = false;
```

**Rationale:**
These four variables are initialised to `false` and conditionally overwritten before being read exactly once each. Addressed by the `census` simplification above (see suggestion 2), but if the verbosity is kept intentionally for readability, the `let` declarations should at minimum be `const` — the variables are never mutated after their conditional assignment.

---

### Nitpicks & Polish

---

**nitpick: `window.*` global event handlers**

**Location:** `src/js/index.js:L22–37`

The `window.optionChange` / `window.toggleProcess` / `window.changeSpeed` pattern exists because the HTML uses `onchange` / `onclick` inline attributes. Switching to `addEventListener` calls in `index.js` would remove these names from the global namespace entirely. Minor change — but worth noting for future maintenance.

---

**nitpick: `let` used where `const` fits in `census`**

**Location:** `src/engine.js:L32`

```javascript
let c = getNeighbors(x, y, rows, columns, data);
```

`c` is never reassigned; `const c` is more accurate and signals that to the reader.

---

### Questions

_None._

---

### Praise

---

**praise: Clean four-class decomposition with genuine single responsibility**

**Location:** `src/js/renderer.js`, `hud.js`, `simulation.js`, `library.js`

Each class owns exactly one concern and the boundaries hold: `Renderer` has no knowledge of the HUD, `HUD` never touches the canvas, `Simulation` coordinates between them via its constructor-injected collaborators. This is the right shape for this domain.

---

**praise: Private `#fields` used consistently throughout**

**Location:** All four classes

Every piece of mutable state is truly private — not just conventionally prefixed. This eliminates the category of bugs where external code accidentally pokes into implementation details. It's a small discipline that compounds over time.

---

**praise: `PatternLibrary.load()` as a static async factory**

**Location:** `src/js/library.js:L8–23`

Placing async initialisation in a static factory rather than the constructor is the correct pattern in JavaScript — constructors can't be `async`, so the factory prevents a partially-constructed instance from ever escaping. The error path via `reject` is also correctly wired.

---

**praise: `render()` returns `aliveCount` rather than calling `hud.setAlive()` directly**

**Location:** `src/js/renderer.js:L27–52`

This is a subtle but meaningful design choice. `Renderer` computes the alive count as a natural by-product of iterating the world — returning it keeps the class canvas-only. The caller (`Simulation`) decides what to do with the count. Had `Renderer` taken a `HUD` dependency, the separation would have collapsed.

---

## Additional Notes

The predicate helpers in `engine.js` (`isUnderPopulated`, `isHealthy`, `isOverPopulated`, `isBorn`) are well named and correctly implement Conway's rules. If `census()` is simplified as suggested, these helpers still earn their keep as named concepts — they can remain as named constants or be inlined, either is fine. The existing test coverage in `engine.test.js` covers the basic alive/dead cases; the skipped tests for `parse()` and edge-case `next()` behaviour are worth completing, particularly boundary-cell behaviour (cells at x=0 or y=rows-1 where neighbour bounds kick in).
