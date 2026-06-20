/**
 * Single app entry — loads styles, shared data bundle, engines, and boots the game.
 */
import "./index.css";
import { bootstrapSharedData } from "./core";
import "./engine/progression_engine";
import "./engine/combination_engine";
import { bootstrapProgression } from "./progression";
import "./ingredient_graph";

function showBootError(error: unknown): void {
  console.error("[Culinary Alchemy] Boot failed:", error);
  const panel = document.createElement("div");
  panel.className = "boot-error-panel";
  panel.setAttribute("role", "alert");
  const message = error instanceof Error ? error.message : "Unknown error";
  const heading = document.createElement("h2");
  heading.textContent = "Kitchen failed to start";
  const detail = document.createElement("p");
  detail.textContent = message;
  const hint = document.createElement("p");
  hint.className = "boot-error-hint";
  hint.innerHTML = `Run <code>npm run dev</code> in the project folder, then open <strong>https://localhost:5173</strong> (do not open the HTML file directly).`;
  panel.append(heading, detail, hint);
  document.body.appendChild(panel);
}

try {
  const mode = await bootstrapSharedData();
  if (mode === "compiled") {
    // progression_config sets PROGRESSION_CONFIG when using compiled modules
    await import("./progression_config");
  }

  if (!globalThis.STARTER_ELEMENTS?.length) {
    throw new Error("Ingredient data failed to load.");
  }
  if (typeof globalThis.CombinationEngine !== "function") {
    throw new Error("Combination engine failed to load.");
  }
  if (typeof globalThis.ProgressionEngine !== "function") {
    throw new Error("Progression engine failed to load.");
  }

  bootstrapProgression();
  import("./game").catch(showBootError);
} catch (error) {
  showBootError(error);
}
