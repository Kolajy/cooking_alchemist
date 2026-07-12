# Google Jules Tasks — Optimized Batches for Culinary Alchemy

To prevent merge conflicts and avoid excessively long session times, these 18 tasks have been grouped into **9 optimized execution batches**.

*   **Parallel Execution:** Batches marked with 🟢 can be run at the same time because they touch completely different files.
*   **Sequential Execution:** Batches marked with 🟡 touch overlapping files or contain major refactors and should be run one after the other.

---

## 🟢 Batch 1: Static Code Quality & Metrics (Parallel-Safe)
> **Goal:** Set up non-visual metrics scripts that do not touch the active game UI.
> **Files:** `web/package.json`, `web/tsconfig.json`, new script files.

### Task 1.1: Bundle Size Tracking
*   **Action:** Create `web/scripts/bundle_size.ts`. Measure build size and compare against a budget JSON file. Exit with code 1 if exceeded. Add `"test:bundle"` script.

### Task 1.2: Content Completeness Report
*   **Action:** Create `web/src/engine/content_report.ts`. Scan ingredient catalogs, recipes, and progress configs to report completeness percentages (e.g., missing descriptions or science tips). Add `"test:content-report"` script.

---

## 🟢 Batch 2: CLI Testing & Benchmarks (Parallel-Safe)
> **Goal:** Establish test automation scripts that run completely in Node.js (no browser).
> **Files:** `web/package.json`, new script files.

### Task 2.1: Performance Benchmarking Script
*   **Action:** Create `web/src/engine/perf_bench.ts`. Benchmark combination engine lookups, graph rendering, pantry filtering, and save serialization using `performance.now()`. Fail if p99 exceeds 16ms. Add `"test:perf"`.

---

## 🟡 Batch 3: HTML & UI Accessibility (Sequential)
> **Goal:** Enhance index.html with loading, structure, and accessibility states.
> **Files:** `web/src/index.html`, `web/src/main.ts`, `web/src/styles/`
> **Why Sequential:** Prevents HTML structure conflicts.

### Task 3.1: CSS Loading Skeleton & ARIA Live Regions (Combined)
*   **Action:** 
    1. Add a CSS-only loading skeleton in `index.html` (with a shimmer effect) to render before JS loads, and hide it in `main.ts` after boot.
    2. Add visually hidden `aria-live` elements (`polite` for discoveries, `assertive` for combination errors) and hook up UI triggers to update them.

### Task 3.2: Keyboard focus & Focus Trap (Separate)
*   **Action:** Add focus indicators (`:focus-visible`), focus-traps for modals, and ensure toolbar ↔ counter ↔ pantry can be fully navigated with Tab/Arrow keys.

---

## 🟢 Batch 4: Dev Tools & Inspector Overlay (Parallel-Safe)
> **Goal:** Build debugging tools that only exist in development environments.
> **Files:** Create `web/src/engine/dev_inspector.ts`, modify `web/src/main.ts`.

### Task 4.1: Dev-Only Graph/Transition Inspector
*   **Action:** Build a visual dev overlay toggled via `` ` `` key that shows ingredient connections. Gate all code behind `import.meta.env.DEV` to ensure zero production footprint.

### Task 4.2: Dev Render Performance Monitor
*   **Action:** Create `web/src/game/perf_monitor.ts`. Use `requestAnimationFrame` and a `MutationObserver` to render an FPS/mutation counter in dev mode. Toggle with `Ctrl+Shift+P`.

---

## 🟡 Batch 5: Core Loop & Memory Tests (Sequential)
> **Goal:** End-to-end browser automation and leak tracking.
> **Files:** Create `web/tests/smoke.spec.ts` and `web/tests/memory.spec.ts`.
> **Why Sequential:** Keeps Playwright configuration and local browser execution aligned.

### Task 5.1: Playwright Smoke Test
*   **Action:** Add browser automation that boots Vite, drags ingredients on the counter, verifies discovery modal pops up, and separate works.

### Task 5.2: Memory Leak Detection Test
*   **Action:** Add a test that triggers 100 game cycles (pantry filters, discovery popups) and asserts that heap memory growth is < 5MB using Playwright heap metrics.

---

## 🟡 Batch 6: Security & Save Management (Sequential)
> **Goal:** Sanitize and schema-validate external user data.
> **Files:** `web/src/game/save/`, `web/src/game/security/`.
> **Why Sequential:** Protects local save states.

### Task 6.1: Save Import Sanitization & Validation
*   **Action:** Validate incoming JSON files against schema, check if item IDs exist, strip HTML tags, enforce 1MB size limits, and update `security.test.ts`.

---

## 🟡 Batch 7: Structural Architecture Cleanup (Solo Run)
> **Goal:** Clean up structural code pattern changes.
> **Files:** `web/src/ingredient_graph.ts`, `web/src/main.ts`.
> **Why Solo:** Modifies structural game bindings; running anything else at the same time will cause major conflicts.

### Task 7.1: Convert ingredient_graph.ts to ES Module
*   **Action:** Remove `globalThis.renderIngredientGraph` assignments. Refactor to ES exports and clean up matching imports.

---

## 🟡 Batch 8: Global Typings & Strict Mode (Solo Run)
> **Goal:** Eliminate global variable bindings and enforce strict types.
> **Files:** `web/tsconfig.json`, `web/src/**/*.ts`, `web/src/types/globals.d.ts`.
> **Why Solo:** Touches almost every file in the directory. Must be run when all other branches are merged.

### Task 8.1: Eliminate globalThis Bridge Pattern
*   **Action:** Convert `CombinationEngine`, `ProgressionEngine`, and `STARTER_ELEMENTS` to ES exports. Remove them from `globals.d.ts` and update imports project-wide.

### Task 8.2: Enable Strict TypeScript Compilation
*   **Action:** Set `"strict": true` in `tsconfig.json` and fix all strict null check / implicitly-any errors across the entire codebase.

---

## 🟢 Batch 9: Stale PR Feature Recovery (Parallel-Safe)
> **Goal:** Re-implement key functional enhancements from old stale PR branches directly on the modern branch structure, completely avoiding branch merge conflicts.
> **Files:** `web/src/game/`, `web/src/engine/`, `web/package.json`.

### Task 9.1: Optimize UI Rendering Array Allocations
*   **Action:** Refactor performance-critical loops in `web/src/game/cabinet.ts` and `web/src/game/canvas/workspace.ts`. Replace heavy functional chains (e.g. `.filter().map().forEach()`) with high-performance standard `for` loops where elements are rendered or queried frequently. Verify render metrics before/after.

### Task 9.2: Unit Test Coverage Expansion (State, Progression & IO)
*   **Action:** Implement robust unit testing files in `web/src/game/` to cover all edge cases:
    1. Create `web/src/game/state.test.ts` to test state transitions.
    2. Create `web/src/game/save-io.test.ts` to test saving/loading files.
    3. Create `web/src/game/security/html.test.ts` to test visual escaping and XSS safety.
    4. Create `web/src/engine/progression_engine.test.ts` to test milestones/levels.
    5. Wire them all into `web/package.json`'s `"test"` script.

### Task 9.3: Secure Random PRNG Integration
*   **Action:** Search `web/src/` for all usages of `Math.random()`. Replace them with a custom cryptographically secure PRNG function (e.g., using `crypto.getRandomValues`) to prevent predictable seeding in game events and daily challenge recipes. Ensure standard node testing remains predictable.

### Task 9.4: LocalStorage Audio Volume Control & Synth Polish
*   **Action:** In `web/src/game/feedback/sounds.ts`, add support for a sliding volume level (e.g., `0.0` to `1.0`) and save it to `localStorage` under `culinary_sound_volume`. Modify the Web Audio API synthesis logic to scale oscillator output gains based on this value.

### Task 9.5: Analytics Schema Validation
*   **Action:** In `web/src/game/analytics.ts`, implement runtime schema verification for tracked events. Define a list of approved events (e.g., `discovery`, `level_up`, `milestone_unlocked`). If an event name or parameters do not conform to the schema, raise a console warning in dev mode (`import.meta.env.DEV`).

### Task 9.6: Visual Cheatsheet for Keyboard Shortcuts
*   **Action:** In `web/src/game/ui/keyboard-shortcuts.ts`, add a key listener for `?`. When pressed, trigger a modal overlay dialogue displaying all registered shortcut keys in `KEYBOARD_SHORTCUTS` formatted as a neat two-column table. Add a "Close" button.

### Task 9.7: Smooth Fade Transition on Start Menu Selection
*   **Action:** In `web/src/game/ui/start-menu.ts`, add a CSS transition to the `#start-menu-overlay` element. When a save slot is selected, apply a `.fade-out` class to fade the opacity from `1` to `0` over `300ms` using CSS animations, then hide the element from the DOM after the transition ends.

### Task 9.8: Cabinet Search Suggestion Caching
*   **Action:** In `web/src/game/ingredients.ts` and `web/src/game/cabinet.ts`, maintain a queue of the last 5 search queries in `localStorage`. Render these cached queries as small clickable bubbles beneath the search input box to let users quickly re-apply filters.

---

## Suggested Execution Matrix

| Run Order | Batch | Type | Target Files | Run Mode | Status |
|---|---|---|---|---|---|
| **1st** | **Batch 1** | Metrics | Scripts | 🟢 Parallel-Safe | Pending |
| **1st** | **Batch 2** | Tests | Scripts | 🟢 Parallel-Safe | Pending |
| **1st** | **Batch 4** | Dev Tools | `dev_inspector.ts`, `perf_monitor.ts` | 🟢 Parallel-Safe | Pending |
| **1st** | **Batch 9** | Stale PRs | `cabinet.ts`, new unit test files, PRNG | 🟢 Parallel-Safe | Pending |
| **2nd** | **Batch 3** | UI | `index.html`, `main.ts` | 🟡 Sequential | Pending |
| **3rd** | **Batch 5** | E2E | `web/tests/` | 🟡 Sequential | Pending |
| **4th** | **Batch 6** | Save | `save/`, `security/` | 🟡 Sequential | Pending |
| **5th** | **Batch 7** | Refactor | `ingredient_graph.ts` | 🔴 Solo Only | Pending |
| **6th** | **Batch 8** | Strict Type | `tsconfig.json`, all `.ts` files | 🔴 Solo Only | Pending |

## Content Creator / Documentation tasks (Parallel-Safe)
These tasks do not touch code and can be run at any time.

### Task 10: Content Authoring Guide
*   **Action:** Create `content/AUTHORING_GUIDE.md` detailing schemas, step-by-step additions of ingredients and techniques, and dependency checks.

---

## 🔍 Codebase-Specific Improvements (from source scan)

### Task 13: Eliminate globalThis Bridge Pattern Across All Modules
> **Scope:** `web/src/`
> **Files:** `web/src/main.ts`, `web/src/types/globals.d.ts`, `web/src/engine/combination_engine.ts`, `web/src/engine/progression_engine.ts`, `web/src/core/`, and all consuming modules
>
> The codebase currently mounts core engines and data on `globalThis` (e.g., `globalThis.CombinationEngine`, `globalThis.ProgressionEngine`, `globalThis.STARTER_ELEMENTS`) and uses a `globals.d.ts` file to type them. Refactor to proper ES module imports:
> 1. In each engine file (`combination_engine.ts`, `progression_engine.ts`), replace `globalThis.X = class ...` assignments with `export class ...` or `export function ...`
> 2. In data bootstrap files (`core/`), replace `globalThis.STARTER_ELEMENTS = ...` with proper exports
> 3. Update `main.ts` to import these directly instead of checking `typeof globalThis.CombinationEngine`
> 4. Update ALL other files across `web/src/game/` that read from `globalThis` for these values — use `grep -r "globalThis\."` to find them all
> 5. Remove or reduce `web/src/types/globals.d.ts` to only declare truly global types (like `Window` extensions), not app modules
> 6. Remove the `window.__culinaryGameStarted` global if it can be replaced with module-scoped state
> 7. Ensure `npm run build` and `npm test` pass with zero `globalThis` references for app modules
>
> This is a refactor. Do NOT change any runtime behavior or game logic.

---

### Task 14: Optimize Google Fonts Loading for LCP
> **Scope:** `web/src/index.html`
> **Files:** `web/src/index.html`, optionally `web/src/styles/`
>
> The game loads 4 Google Font families (`Caveat`, `Cinzel`, `Lora`, `Plus Jakarta Sans`) via external `<link>` tags which block rendering. Optimize:
> 1. Add `font-display: swap` to all font declarations (it should already be in the Google Fonts URL — verify the `&display=swap` param is present)
> 2. Add `<link rel="preload" as="font" crossorigin>` for the most critical font file (the one used in the start menu title — likely `Cinzel`)
> 3. Add `fetchpriority="high"` to the primary stylesheet `<link>`
> 4. Move non-critical fonts (e.g., `Caveat` for decorative text) to load asynchronously using the `media="print" onload="this.media='all'"` pattern
> 5. Add a CSS `@font-face` fallback with `size-adjust` to prevent layout shift while fonts load — match the fallback metrics to the primary UI font (`Plus Jakarta Sans`)
> 6. Verify that `npm run build` succeeds and the start menu renders with proper fonts
>
> Do NOT remove any fonts. Only change loading strategy.

---

### Task 15: Add Error Boundaries & Graceful Degradation
> **Scope:** `web/src/`
> **Files:** `web/src/main.ts`, `web/src/game/index.ts`
>
> The current boot sequence in `main.ts` has a single try/catch that shows a generic error panel. Improve error handling:
> 1. Wrap each initialization phase (data bootstrap, engine init, progression init, game UI init) in its own try/catch
> 2. For each phase failure, show a specific error message indicating which phase failed and what the likely cause is
> 3. If data loading fails, show a "Retry" button that re-attempts `bootstrapSharedData()`
> 4. If the game UI fails but engines loaded, show a reduced-functionality message rather than a blank screen
> 5. Add `window.onerror` and `window.onunhandledrejection` handlers that log to a visible in-page error console (dev mode only, gated by `import.meta.env.DEV`)
> 6. Ensure all error panels are accessible (have `role="alert"` and are keyboard-focusable)
> 7. Ensure `npm run build` passes
>
> Do NOT change the happy-path behavior.

---

### Task 16: Add Render Performance Monitoring (Dev Mode)
> **Scope:** `web/src/game/`
> **Files:** Create `web/src/game/perf_monitor.ts`, update `web/src/game/ui/refresh.ts`
>
> The game uses UI refresh batching (`refresh.ts` is 912 bytes). Add a dev-mode performance monitor:
> 1. Create `perf_monitor.ts` that tracks frame times using `requestAnimationFrame` and `performance.now()`
> 2. Track: FPS (rolling 60-frame average), longest frame in last second, total DOM mutation count
> 3. Hook into the existing refresh/render cycle to measure how long each UI update takes
> 4. Display as a small overlay in the top-right corner (only when `import.meta.env.DEV` is true)
> 5. Color-code the FPS: green (>55), yellow (30-55), red (<30)
> 6. Add a keyboard shortcut (`Ctrl+Shift+P`) to toggle the overlay
> 7. Ensure it's completely tree-shaken from production builds — verify by checking `npm run build` output contains no perf monitor code
>
> Use `MutationObserver` to count DOM mutations. Do NOT add any dependencies.

---

### Task 17: Add Automated Content Completeness Report
> **Scope:** `web/src/engine/`, `content/`
> **Files:** Create `web/src/engine/content_report.ts`, update `web/package.json`
>
> The game has stub files for achievements (`achievement_rules.ts` and `achievements.ts` in `web/src/data/` are just re-exports with no actual content). Create a content completeness report:
> 1. Scan all ingredient data files in `web/src/data/ingredients/` and count: total ingredients, ingredients with descriptions, ingredients without descriptions, ingredients with science tips
> 2. Scan all transition/recipe data in `web/src/data/transitions/` and count: total recipes, recipes with blurbs, recipes without blurbs
> 3. Check `content/data/` for achievement definitions — report how many are defined vs. how many trigger IDs exist in the codebase
> 4. Check `content/progression_config.ts` — report how many milestone unlocks are configured vs. how many placeholder/empty slots exist
> 5. Output a formatted table showing completeness percentages per category
> 6. Exit with code 1 if any category is below 50% complete (configurable threshold)
> 7. Add a `"test:content-report"` script to `web/package.json`
>
> Use only Node.js built-ins and TypeScript imports. No new dependencies.
