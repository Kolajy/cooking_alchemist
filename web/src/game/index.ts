/**
 * Culinary Alchemy — Game entry point.
 * Wires modules together and boots the kitchen UI.
 */
import { createContext, getCtx } from "./context";
import { applyActionToCanvas, combineElements, applyToolToElement } from "./actions/cooking";
import { registerGameplayEffects } from "./events";
import { initGame } from "./ui/events";
import { setupHoverPanel } from "./ui/hover-panel";
import { initGoogleAnalytics } from "./analytics";

function startGame() {
  if (window.__culinaryGameStarted) return;

  if (!globalThis.STARTER_ELEMENTS?.length || !globalThis.Progression) {
    console.error("[Culinary Alchemy] Cannot start — data or progression not loaded.");
    return;
  }

  window.__culinaryGameStarted = true;

  initGoogleAnalytics();
  createContext();
  setupHoverPanel();
  registerGameplayEffects();
  const ctx = getCtx();
  ctx.actions.applyActionToCanvas = applyActionToCanvas;
  ctx.actions.combineElements = combineElements;
  ctx.actions.applyToolToElement = applyToolToElement;
  initGame();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame);
} else {
  startGame();
}
