## 2024-05-15 - [Debouncing High-Frequency Events]
**Learning:** Raw `pointermove` events fire very frequently and modifying the DOM (`style.transform`) directly in them can cause unnecessary layout thrashing/style recalculations, hurting game UI performance when moving pointer elements like the hover-panel.
**Action:** Always wrap raw UI pointer/scroll coordinate-driven DOM updates in `requestAnimationFrame` and capture the event metrics (like `e.clientX`) outside the callback.
