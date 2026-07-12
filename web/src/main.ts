/**
 * Single app entry — loads styles, shared data bundle, engines, and boots the game.
 */
import "./index.css";
import { bootstrapSharedData } from "./core";
import "./engine/progression_engine";
import "./engine/combination_engine";
import { bootstrapProgression } from "./progression";

// Initialize PWA service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

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

  hint.appendChild(document.createTextNode("Run "));

  const codeEl = document.createElement("code");
  codeEl.textContent = "npm run dev";
  hint.appendChild(codeEl);

  hint.appendChild(document.createTextNode(" in the project folder, then open "));

  const strongEl = document.createElement("strong");
  strongEl.textContent = "https://localhost:5173";
  hint.appendChild(strongEl);

  hint.appendChild(document.createTextNode(" (do not open the HTML file directly)."));

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset Game Data (Graceful Recovery)";
  resetBtn.className = "btn-danger";
  resetBtn.style.marginTop = "20px";
  resetBtn.onclick = () => {
    if (confirm("Are you sure you want to reset all data to recover from crash?")) {
      localStorage.clear();
      location.reload();
    }
  };

  panel.append(heading, detail, hint, resetBtn);
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
