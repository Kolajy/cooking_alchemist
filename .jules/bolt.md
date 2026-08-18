## 2024-06-25 - Debounce SVG transform updates to prevent layout thrashing on zoom
**Learning:** A codebase-specific layout thrashing bottleneck occurred where synchronous SVG DOM updates (`setAttribute("transform", ...)`) mixed with layout reads (`getBoundingClientRect()`) in unthrottled trackpad `wheel` events caused redundant layout calculations, leading to CPU spikes and dropped frames during zoom.
**Action:** When handling high-frequency input events (like `wheel` or `pointermove`) that require both reading layout (e.g. `getBoundingClientRect`) and mutating the DOM, always debounce the synchronous DOM mutation inside a `requestAnimationFrame` loop.
## 2026-08-18 - Batch Particle DOM Insertions
**Learning:** Calling `appendChild` repeatedly inside loops (like particle generation in `createParticles`) causes unnecessary browser layout calculations and repaints.
**Action:** When repeatedly creating and appending DOM elements within a loop, use a `DocumentFragment` to batch the insertions before appending to the main DOM.
