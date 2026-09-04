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
