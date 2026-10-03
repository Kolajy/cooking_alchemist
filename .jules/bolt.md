## 2024-06-25 - Debounce SVG transform updates to prevent layout thrashing on zoom
**Learning:** A codebase-specific layout thrashing bottleneck occurred where synchronous SVG DOM updates (`setAttribute("transform", ...)`) mixed with layout reads (`getBoundingClientRect()`) in unthrottled trackpad `wheel` events caused redundant layout calculations, leading to CPU spikes and dropped frames during zoom.
**Action:** When handling high-frequency input events (like `wheel` or `pointermove`) that require both reading layout (e.g. `getBoundingClientRect`) and mutating the DOM, always debounce the synchronous DOM mutation inside a `requestAnimationFrame` loop.
## 2026-08-18 - Batch Particle DOM Insertions
**Learning:** Calling `appendChild` repeatedly inside loops (like particle generation in `createParticles`) causes unnecessary browser layout calculations and repaints.
**Action:** When repeatedly creating and appending DOM elements within a loop, use a `DocumentFragment` to batch the insertions before appending to the main DOM.
## 2024-08-26 - Prevent layout thrashing on element combination
**Learning:** Calling `getBoundingClientRect()` inside high-frequency interaction logic (like item combination) triggers expensive synchronous DOM layout reflows. When calculating canvas element positions relative to the workspace, prefer using the existing `getCanvasPosition(el)` helper (which reads `dataset.x`/`dataset.y`) over `getBoundingClientRect()` to avoid triggering synchronous layout recalculations.
**Action:** When calculating canvas element positions relative to the workspace, use `getCanvasPosition(el)` rather than `getBoundingClientRect()`.
## 2024-09-04 - Prevent layout thrashing in notifications
**Learning:** Calling `getBoundingClientRect()` within notification setup functions (`showHintNearElement`, `showFloatingWarning`) forces synchronous layout reflows, which causes layout thrashing and drops frames, especially when called repeatedly. The position calculation can be handled by `getCanvasPosition(el)` and a simple query of `el.offsetWidth` (or an approximation).
**Action:** Replace `getBoundingClientRect()` calls in notifications positioning logic with the custom `getCanvasPosition(el)` to avoid triggering synchronous layout recalculations and improve performance.
## 2024-11-20 - Cache DOM layout rect outside high-frequency spawn loops
**Learning:** Calling `getBoundingClientRect()` within a `.map()` or `.forEach()` loop (like `outputResults.map` in `cooking.ts`) triggers repeated synchronous layout recalculations for every spawned item, causing performance thrashing.
**Action:** When using `clampCanvasPosition` or similar helpers inside loops, always calculate and cache layout constraints (like `dom.workspace.getBoundingClientRect()`) outside the loop and pass the cached value down.
## 2024-09-12 - Layout thrashing when spawning multiple canvas elements
**Learning:** During gameplay (e.g. chopping, separating), multiple resulting output items are spawned on the counter. If the offsetWidth and offsetHeight properties are read synchronously inside the iteration loop without caching, it causes layout thrashing, as browser forced to recalculate layout repeatedly.
**Action:** When spawning multiple output elements in a loop, cache the first element's offsetWidth and offsetHeight and pass them down into the layout computation (`clampCanvasPosition`) for the rest.
## 2024-05-17 - [Optimizing getActiveTechniqueToolIds Object Iteration]
**Learning:** In high-frequency canvas or rendering functions (like `updateTechniqueTargetHighlights`), chaining array methods (`Object.keys().map().filter()`) on large data structures like `PROGRESSION_TIERS` causes severe garbage collection thrashing and performance overhead due to intermediate O(N) array/object allocations.
**Action:** Use a single `for...in` loop to iterate over objects directly to avoid intermediate allocations. This simple change yielded a ~3.5x speedup for `getActiveTechniqueToolIds` in benchmarks.
## 2024-12-05 - Avoid intermediate allocations in high-frequency functions
**Learning:** In high-frequency functions (like `pointermove` handlers) or frequently called getters, using chaining array methods like `Array.from(set).filter()` or `.map().forEach()` causes unnecessary memory allocations and garbage collection overhead, leading to performance thrashing.
**Action:** When iterating over collections in hot paths, avoid array methods that create intermediate arrays or objects. Use standard `for` or `for...of` loops instead to reduce memory churn and improve execution speed.
## 2024-09-28 - Avoid Array Methods on Game State Lookups
**Learning:** In highly called getters and UI rendering updates, transforming static dictionary-like configurations (e.g. `PROGRESSION_TIERS`) using `Object.keys(data.PROGRESSION_TIERS).map(...).find(...)` repeatedly allocates short-lived objects leading to garbage collection churn and unnecessary CPU spikes.
**Action:** Always favor native loops like `for...in` which support early returns instead of method chains when dealing with dictionaries or heavily queried object pools.
## 2024-10-24 - O(1) Cache Lookups for Render Loops
**Learning:** During UI rendering tasks that apply filtering over large lists (e.g., `renderCabinet` iterating over discovery sets), using `Array.prototype.includes` multiple times inside the iteration causes significant $O(N \times M)$ overhead.
**Action:** When filtering or sorting UI datasets based on dynamic conditions (like recent item lists), cache the target lookup arrays in an $O(1)$ `Set` before the loop and pass it to validation functions.
