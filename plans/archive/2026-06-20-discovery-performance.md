# Active Plan: Discovery Performance Fix

## Problem
Discovery feels laggy — especially in Electron — because `registerGameplayEffects` runs expensive synchronous work (full `renderCabinet`, `saveProgress`, achievements, milestones) **before** `queueDiscovery` opens the modal.

## Fixes
1. **`gameplay-effects.ts`** — Show discovery popup first; defer heavy side-effects via rAF + `requestIdleCallback`.
2. **`discovery.ts`** — Open modal earlier; defer sparkle/animation replay to rAF; fewer spark elements.
3. **`discovery.css`** — Disable `backdrop-filter` blur on discovery modals (expensive in Electron).
4. **`electron/main.js`** — Stop auto-opening DevTools (major Electron perf hit).

## Testing
Manual: trigger a discovery in Electron dev — modal should appear instantly; pantry updates shortly after.
