## 2024-07-12 - [Removed Expensive DOM Method from frequent PointerMove callback]
**Learning:** In pointermove callbacks, calling `getBoundingClientRect` causes expensive layout recalculations (thrashing). Since dragging occurs very frequently, these calls add up to significant frame drops and stuttering. In `technique-target.ts`, checking for nearby elements on the board for the "merge" mode was checking DOM rects for every active item per pointer frame!
**Action:** Replaced `getBoundingClientRect` calls with dataset checks and cached DOM measurements where necessary, particularly in `findMergeTarget` which is invoked on every single dragged-frame loop.

## 2024-07-13 - [Caching DOM Geometry and translate3d in pointermove]
**Learning:** Frequent `pointermove` events querying DOM geometry properties like `offsetWidth` and `offsetHeight` trigger expensive synchronous layout recalculations (layout thrashing) in the game's UI layers. Modifying `top` and `left` properties similarly causes layout repaints in the render loop.
**Action:** When updating floating UI elements like the hover panel or item tooltips, dimensions should be queried once upon visibility and cached. To position them, `transform: translate3d(x, y, 0)` should be used alongside base `top: 0` / `left: 0` styles to push the rendering to the GPU and eliminate layout recalculations.

## 2025-02-12 - [Cache workspace rect during cabinet drag to avoid layout thrashing]
**Learning:** In pointermove callbacks, calling `getBoundingClientRect` causes expensive layout recalculations (thrashing). Since dragging occurs very frequently, these calls add up to significant frame drops and stuttering. In `cabinet-drag.ts`, checking if the pointer is over the workspace was checking DOM rects for every dragged frame!
**Action:** Cached the workspace `DOMRect` on `pointerdown` and reused it in `pointermove` to avoid calling `getBoundingClientRect` repeatedly.

## 2025-02-12 - [Cached Collision Validations in pointermove]
**Learning:** Checking combination validity `canCombineIngredients` (which performs an O(N) array search on the transition index) and mutating DOM `classList` properties on every single active element in `updateCollisionHighlight` during a `pointermove` event causes extreme CPU overhead and layout thrashing. Since dragging happens at 60fps or higher, doing this unconditionally was a major performance bottleneck.
**Action:** When performing complex validations in a hot drag loop, memoize the inputs (the dragged element and current action) and only re-calculate and apply classes when those change, rather than unconditionally every frame.
