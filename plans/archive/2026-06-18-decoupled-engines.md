# Plan: Decouple Core Game Logic from UI

This plan describes the strategy to isolate the progression and combination logic into pure JavaScript modules. This saves tokens by allowing us to edit and test cooking rules without parsing the UI, rendering, or DOM handling loops.

---

## 1. Decoupled Architecture

We will create two pure, logic-only modules under a new `src/engine/` folder:

1. **`src/engine/progression_engine.js`**:
   - Manages player skill states (attempts/XP).
   - Resolves dependencies and checks if child nodes are unlocked.
   - Decoupled from `localStorage` (uses a pluggable storage interface).
2. **`src/engine/combination_engine.js`**:
   - Matches ingredients and tools against the recipe database.
   - Evaluates milestone triggers.
3. **`src/engine/cli_test.js`**:
   - A Node.js console script to simulate a player's cooking session.
   - Verifies recipe combinations, attempts tracking, and unlocks.

The main `src/game.js` UI file will import these engines and supply the DOM/canvas bindings and `localStorage` hooks.

---

## 2. Proposed Changes

### [NEW] `src/engine/progression_engine.js`
- Core `ProgressionEngine` class containing the state, unlock checker, ancestor counter, and attempts updater.

### [NEW] `src/engine/combination_engine.js`
- Core `CombinationEngine` class matching inputs and active tools to outputs in `DISCOVERABLE_ITEMS`.

### [NEW] `src/engine/cli_test.js`
- Executable script run via `node src/engine/cli_test.js` that tests cooking combinations and progression unlocking.

### [MODIFY] `src/game.js`
- Adapt the UI listeners, updates, and canvas spawning to call the clean `ProgressionEngine` and `CombinationEngine` instances.

---

## 3. Verification Plan

### Automated CLI Verification
Run the simulation test:
```bash
node src/engine/cli_test.js
```
Expected output: successful console prints showing potato + smash yielding Mashed Potato, attempts logging, skill unlocks, and milestone triggers.
