import { getCtx } from "../context";
import { playSound } from "../feedback/sounds";
import { isFinalizedRecipe } from "../ingredients";
import { isReducedMotionEnabled } from "../settings";
import { getTrackExpSummary } from "../progression/skills";
import type { DiscoveryActionContext, IngredientItem, MatchedRecipe } from "../../types";

interface IngredientQueueEntry {
  type: "ingredient";
  recipe: MatchedRecipe;
  result: IngredientItem;
  actionContext: DiscoveryActionContext | null;
}

interface MechanicQueueEntry {
  type: "mechanic";
  id: string;
  name: string;
  emoji: string;
  desc: string;
  isSubaction: boolean;
}

type DiscoveryQueueEntry = IngredientQueueEntry | MechanicQueueEntry;

const discoveryQueue: DiscoveryQueueEntry[] = [];
let isDiscoveryOpen = false;

export function closeDiscoveryDialog(): void {
  const { dom } = getCtx();
  
  const closeDlg = (dialog: HTMLDialogElement | null) => {
    if (!dialog) return;
    const isOpen = dialog.open || dialog.hasAttribute("open");
    if (!isOpen) return;
    if (typeof dialog.close === "function") {
      try {
        dialog.close();
      } catch {
        // Fall through to attribute cleanup.
      }
    }
    dialog.removeAttribute("open");
  };

  closeDlg(dom.discoveryDialog);
  closeDlg(dom.mechanicDiscoveryDialog);
}

function advanceDiscoveryQueue(): void {
  closeDiscoveryDialog();
  isDiscoveryOpen = false;
  pumpDiscoveryQueue();
}

export function setupDiscoveryDialog(): void {
  const { dom } = getCtx();
  
  // Set up Ingredient Discovery Dialog
  const dialog = dom.discoveryDialog;
  if (dialog && dialog.dataset.discoveryBound !== "true") {
    dialog.dataset.discoveryBound = "true";
    const dismiss = (event?: Event) => {
      event?.preventDefault?.();
      advanceDiscoveryQueue();
    };
    dialog.addEventListener("cancel", dismiss);
    dom.btnDiscoveryOk?.addEventListener("click", dismiss);
    dialog.querySelector(".discovery-dismiss-form")?.addEventListener("submit", dismiss);
  }

  // Set up Mechanic Discovery Dialog
  const mDialog = dom.mechanicDiscoveryDialog;
  if (mDialog && mDialog.dataset.discoveryBound !== "true") {
    mDialog.dataset.discoveryBound = "true";
    const dismiss = (event?: Event) => {
      event?.preventDefault?.();
      advanceDiscoveryQueue();
    };
    mDialog.addEventListener("cancel", dismiss);
    dom.btnMechanicOk?.addEventListener("click", dismiss);
    mDialog.querySelector(".discovery-dismiss-form")?.addEventListener("submit", dismiss);
  }
}

function getDiscoveryBlurb(recipe: MatchedRecipe, result: IngredientItem): string {
  return result.blurb
    || result.tip
    || result.description
    || recipe.blurb
    || recipe.tip
    || "Every ingredient has a story — keep experimenting to uncover more of the kitchen's secrets.";
}

function spawnDiscoverySparkles(container: HTMLElement | null): void {
  if (!container || isReducedMotionEnabled()) return;

  container.replaceChildren();
  const sparkMarks = ["✨", "⭐", "✦", "🌟", "·", "✧"];

  for (let i = 0; i < 14; i += 1) {
    const spark = document.createElement("span");
    spark.className = "discovery-spark";
    spark.textContent = sparkMarks[i % sparkMarks.length];
    spark.style.setProperty("--angle", `${(360 / 14) * i}deg`);
    spark.style.setProperty("--delay", `${0.12 + i * 0.035}s`);
    spark.style.setProperty("--distance", `${48 + (i % 5) * 14}px`);
    container.appendChild(spark);
  }
}

function replayDiscoveryAnimations(): void {
  if (isReducedMotionEnabled()) return;

  const { dom } = getCtx();
  const { discoveryItemContainer, discoveryDialog } = dom;
  if (!discoveryItemContainer) return;

  discoveryItemContainer.classList.remove("discovery-replay");
  void discoveryItemContainer.offsetWidth;
  discoveryItemContainer.classList.add("discovery-replay");

  discoveryDialog?.querySelectorAll(".discovery-reveal").forEach(node => {
    const el = node as HTMLElement;
    el.classList.remove("discovery-replay");
    void el.offsetWidth;
    el.classList.add("discovery-replay");
  });
}

function updateDiscoveryExp(actionContext: DiscoveryActionContext | null): void {
  const expBlock = document.getElementById("discovery-exp");
  const labelEl = document.getElementById("discovery-exp-label");
  const gainEl = document.getElementById("discovery-exp-gain");
  const fillEl = document.getElementById("discovery-exp-fill");
  const textEl = document.getElementById("discovery-exp-text");

  if (!expBlock || !actionContext?.trackId) {
    expBlock?.setAttribute("hidden", "");
    return;
  }

  const { data } = getCtx();
  const trackId = actionContext.trackId;
  const sameTrackRemaining = discoveryQueue.filter(
    entry => entry.type === "ingredient" && entry.actionContext?.trackId === trackId
  ).length;
  const currentActualExp = data.Progression.getXP(trackId);
  const visualExp = Math.max(0, currentActualExp - sameTrackRemaining);

  const summary = getTrackExpSummary(trackId, visualExp);
  if (!summary) {
    expBlock.setAttribute("hidden", "");
    return;
  }

  expBlock.removeAttribute("hidden");
  if (labelEl) labelEl.textContent = summary.label;
  if (gainEl) {
    const gained = actionContext.expAwarded ?? 1;
    gainEl.textContent = `+${gained} exp`;
  }
  if (fillEl) fillEl.style.width = `${summary.percent}%`;
  if (textEl) textEl.textContent = summary.detailText;
}

function presentIngredientDiscovery(entry: IngredientQueueEntry): void {
  const { dom } = getCtx();
  const { recipe, result, actionContext } = entry;
  const remaining = discoveryQueue.filter(e => e.type === "ingredient").length;
  const emojiEl = dom.discoveryItemContainer?.querySelector(".discovered-emoji");
  const nameEl = dom.discoveryItemContainer?.querySelector(".discovered-name");

  if (dom.discoveryKicker) {
    dom.discoveryKicker.textContent = remaining > 0 ? "Another discovery!" : "Congratulations!";
  }

  if (dom.discoveryTitle) {
    dom.discoveryTitle.textContent = remaining > 0
      ? `New Ingredient Discovered (${remaining} more)`
      : "New Ingredient Discovered";
  }

  if (emojiEl) emojiEl.textContent = result.emoji;
  if (nameEl) nameEl.textContent = result.name;

  const descEl = document.getElementById("discovery-description");
  if (descEl) {
    descEl.textContent = result.description
      || recipe.description
      || "You've unlocked something new for your pantry.";
  }

  const blurbEl = document.getElementById("discovery-blurb");
  if (blurbEl) {
    blurbEl.textContent = getDiscoveryBlurb(recipe, result);
  }

  updateDiscoveryExp(actionContext);
  spawnDiscoverySparkles(dom.discoverySparkles);
  replayDiscoveryAnimations();
  playSound(isFinalizedRecipe(result) ? "recipe_complete" : "discovery");

  if (!dom.discoveryDialog) return;

  try {
    dom.discoveryDialog.showModal();
  } catch {
    dom.discoveryDialog.setAttribute("open", "");
  }

  requestAnimationFrame(() => {
    dom.btnDiscoveryOk?.focus({ preventScroll: true });
  });
}

function presentMechanicDiscovery(entry: MechanicQueueEntry): void {
  const { dom } = getCtx();
  const { name, emoji, desc, isSubaction } = entry;

  if (dom.mechanicKicker) {
    dom.mechanicKicker.textContent = isSubaction ? "New Cooking Technique!" : "New Core Mechanic!";
  }

  if (dom.mechanicTitle) {
    dom.mechanicTitle.textContent = isSubaction ? "Technique Unlocked" : "Action Unlocked";
  }

  if (dom.mechanicEmoji) dom.mechanicEmoji.textContent = emoji;
  if (dom.mechanicName) dom.mechanicName.textContent = name;
  if (dom.mechanicDescription) dom.mechanicDescription.textContent = desc;

  spawnDiscoverySparkles(dom.mechanicSparkles);
  playSound("unlock");

  if (!dom.mechanicDiscoveryDialog) return;

  try {
    dom.mechanicDiscoveryDialog.showModal();
  } catch {
    dom.mechanicDiscoveryDialog.setAttribute("open", "");
  }

  requestAnimationFrame(() => {
    dom.btnMechanicOk?.focus({ preventScroll: true });
  });
}

function presentDiscoveryEntry(entry: DiscoveryQueueEntry): void {
  isDiscoveryOpen = true;

  if (entry.type === "ingredient") {
    presentIngredientDiscovery(entry);
  } else {
    presentMechanicDiscovery(entry);
  }
}

function pumpDiscoveryQueue(): void {
  if (isDiscoveryOpen || discoveryQueue.length === 0) return;
  const entry = discoveryQueue.shift();
  if (entry) presentDiscoveryEntry(entry);
}

/** Queue one popup per discovered item; shows sequentially on dismiss. */
export function queueDiscovery(
  recipe: MatchedRecipe,
  results: IngredientItem[] | null = null,
  actionContext: DiscoveryActionContext | null = null
): void {
  const items = (results?.length ? results : [recipe.result]).filter(result => result?.id);
  if (items.length === 0) return;

  items.forEach(result => {
    const context = actionContext ? { ...actionContext, expAwarded: 1 } : null;
    discoveryQueue.push({ type: "ingredient", recipe, result, actionContext: context });
  });

  pumpDiscoveryQueue();
}

/** Queue one popup for a discovered core action or technique subaction. */
export function queueMechanicDiscovery(
  id: string,
  name: string,
  emoji: string,
  desc: string,
  isSubaction: boolean
): void {
  discoveryQueue.push({
    type: "mechanic",
    id,
    name,
    emoji,
    desc,
    isSubaction
  });

  pumpDiscoveryQueue();
}
