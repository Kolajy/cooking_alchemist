## 2024-07-12 - [Removed Expensive DOM Method from frequent PointerMove callback]
**Learning:** In pointermove callbacks, calling `getBoundingClientRect` causes expensive layout recalculations (thrashing). Since dragging occurs very frequently, these calls add up to significant frame drops and stuttering. In `technique-target.ts`, checking for nearby elements on the board for the "merge" mode was checking DOM rects for every active item per pointer frame!
**Action:** Replaced `getBoundingClientRect` calls with dataset checks and cached DOM measurements where necessary, particularly in `findMergeTarget` which is invoked on every single dragged-frame loop.

## 2024-07-13 - [Caching DOM Geometry and translate3d in pointermove]
**Learning:** Frequent `pointermove` events querying DOM geometry properties like `offsetWidth` and `offsetHeight` trigger expensive synchronous layout recalculations (layout thrashing) in the game's UI layers. Modifying `top` and `left` properties similarly causes layout repaints in the render loop.
**Action:** When updating floating UI elements like the hover panel or item tooltips, dimensions should be queried once upon visibility and cached. To position them, `transform: translate3d(x, y, 0)` should be used alongside base `top: 0` / `left: 0` styles to push the rendering to the GPU and eliminate layout recalculations.
