# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server (http://localhost:8080, hot-reload)
yarn start

# Run tests in watch mode
yarn test

# Run a single test file
yarn mocha --require ./mocha/register.js src/engine.test.js
```

## Architecture

This is a browser-based Conway's Game of Life simulator with a clean separation between logic and UI.

**Core engine** (`src/engine.js`) — pure functional, no DOM knowledge:
- `next(world)` — computes the next generation; deep-clones input via JSON serialization
- `parse(pattern)` — converts a multiline `O`/`.` string into a `boolean[][]` grid
- Internal helpers: `census()`, `getNeighbors()`, `isLive()`, `isBorn()`, etc.

**UI controller** (`src/js/index.js`) — imperative shell:
- Loads `src/lexicon.json` via AJAX on startup and populates the pattern dropdown
- `optionChange()` and `startProcess()` are global functions bound to HTML event handlers
- Animation loop: `setInterval` at 100ms calls `next()` then `render()` (canvas 2D)
- Canvas is 1920×960px; each cell is 4px, giving a 480×240 cell grid

**Pattern data** (`src/lexicon.json`) — array of `{ name, description, pattern }` objects; pattern strings use `O` for alive and `.` for dead.

**Entry point** (`index.html`) — single page; loads styles and `src/js/index.js` as an ES module.

## Key Details

- Babel transpilation is used **only for tests** (via `mocha/register.js`); the browser relies on native ES modules — no build step needed
- World state is `boolean[][]` (`true` = alive cell)
- Tests live alongside source: `src/engine.test.js` (Mocha + Chai, BDD style)
- Some tests are marked `.skip` and are incomplete
