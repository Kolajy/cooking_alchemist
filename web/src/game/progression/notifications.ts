import { getCtx } from "../context";
import { getCanvasPosition } from "../canvas/workspace";
import { isPlayerActionUnlocked } from "./skills";
import { playSound } from "../feedback/sounds";
import { emitGameplayEvent } from "../events";
import { escapeHtml } from "../security/html";
import { queueMechanicDiscovery } from "../ui/discovery";

let lastHintText = "";
let lastHintAt = 0;
const HINT_COOLDOWN_MS = 4500;

function shouldShowHint(text: string): boolean {
  const now = Date.now();
  if (text === lastHintText && now - lastHintAt < HINT_COOLDOWN_MS) return false;
  lastHintText = text;
  lastHintAt = now;
  return true;
}

function mountHintElement(text: string, className: string): HTMLDivElement {
  const { dom } = getCtx();
  const hint = document.createElement("div");
  hint.className = className;
  hint.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = "kitchen-hint__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "💡";

  const body = document.createElement("span");
  body.className = "kitchen-hint__text";
  body.textContent = text;

  hint.append(icon, body);
  dom.workspace?.appendChild(hint);
  return hint;
}

/** Contextual coaching hint anchored near a counter item. */
export function showHintNearElement(el: HTMLElement | null, text: string): void {
  if (!text || !el || !shouldShowHint(text)) return;
  playSound("hint");

  const { dom } = getCtx();
  if (!dom.workspace) return;

  const hint = mountHintElement(text, "kitchen-hint kitchen-hint--anchored animate-pop");

  const pos = getCanvasPosition(el);
  hint.style.position = "absolute";
  hint.style.left = `${Math.max(8, pos.x + (el.offsetWidth || 64) / 2 - 120)}px`;
  hint.style.top = `${Math.max(8, pos.y - 48)}px`;
  hint.style.maxWidth = "240px";

  window.setTimeout(() => {
    hint.style.transition = "opacity 0.45s ease";
    hint.style.opacity = "0";
    window.setTimeout(() => hint.remove(), 450);
  }, 3200);
}

/** Hint when no specific item anchor (toolbar failures, general nudges). */
export function showWorkspaceHint(text: string): void {
  if (!text || !shouldShowHint(text)) return;
  playSound("hint");

  const { dom } = getCtx();
  if (!dom.workspace) return;

  dom.workspace.querySelectorAll(".kitchen-hint--banner").forEach(node => node.remove());

  const hint = mountHintElement(text, "kitchen-hint kitchen-hint--banner animate-pop");
  hint.style.position = "absolute";
  hint.style.left = "50%";
  hint.style.bottom = "88px";
  hint.style.transform = "translateX(-50%)";
  hint.style.maxWidth = "min(92%, 360px)";

  window.setTimeout(() => {
    hint.style.transition = "opacity 0.45s ease";
    hint.style.opacity = "0";
    window.setTimeout(() => hint.remove(), 450);
  }, 3600);
}

export function showFloatingWarning(el, text) {
  const { dom } = getCtx();
  const warning = document.createElement("div");
  warning.className = "floating-warning animate-pop";
  warning.textContent = text;

  const pos = getCanvasPosition(el);
  warning.style.position = "absolute";
  warning.style.left = `${pos.x + ((el.offsetWidth || 64) / 2) - 100}px`;
  warning.style.top = `${pos.y - 35}px`;
  warning.style.color = "var(--color-fire)";
  warning.style.fontSize = "0.75rem";
  warning.style.fontWeight = "bold";
  warning.style.background = "rgba(0, 0, 0, 0.8)";
  warning.style.padding = "4px 10px";
  warning.style.borderRadius = "4px";
  warning.style.border = "1px solid var(--color-fire)";
  warning.style.width = "200px";
  warning.style.textAlign = "center";
  warning.style.zIndex = "2005";
  warning.style.pointerEvents = "none";

  dom.workspace.appendChild(warning);

  setTimeout(() => {
    warning.style.transition = "opacity 0.5s ease";
    warning.style.opacity = "0";
    setTimeout(() => warning.remove(), 500);
  }, 1800);
}

export function triggerLevelUpNotification(newSkill: { id?: string; emoji: string; name: string; desc?: string }) {
  queueMechanicDiscovery(
    newSkill.id || "",
    newSkill.name,
    newSkill.emoji,
    newSkill.desc || "",
    true // isSubaction
  );
}

export function checkPlayerActionUnlocks() {
  const { state, data } = getCtx();

  const checkUnlock = (
    key: "force" | "combine" | "change" | "time",
    flagName: "notifiedForceUnlock" | "notifiedCombineUnlock" | "notifiedChangeUnlock" | "notifiedTimeUnlock"
  ) => {
    if (state[flagName] || !isPlayerActionUnlocked(key)) return;

    state[flagName] = true;
    const action = data.PLAYER_ACTIONS[key];
    queueMechanicDiscovery(
      key,
      action.name,
      action.emoji,
      action.desc || "",
      false // isSubaction
    );
    emitGameplayEvent("achievementCheck", { silent: false });
  };

  checkUnlock("force", "notifiedForceUnlock");
  checkUnlock("combine", "notifiedCombineUnlock");
  checkUnlock("change", "notifiedChangeUnlock");
  checkUnlock("time", "notifiedTimeUnlock");
}

export function triggerIngredientUnlockNotification(milestone: { emoji: string; msg: string }) {
  const { dom } = getCtx();
  const notif = document.createElement("div");
  notif.className = "levelup-notification";
  notif.style.borderColor = "var(--color-success)";
  notif.style.boxShadow = "0 10px 40px rgba(74, 222, 128, 0.25), var(--shadow-lg)";

  const emoji = document.createElement("div");
  emoji.className = "levelup-emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = milestone.emoji;

  const text = document.createElement("div");
  text.className = "levelup-text";

  const title = document.createElement("h4");
  title.style.color = "var(--color-success)";
  title.textContent = "📦 Ingredients Shipment! 📦";

  const desc = document.createElement("p");
  desc.textContent = milestone.msg;

  text.append(title, desc);

  notif.append(emoji, text);
  dom.workspace?.appendChild(notif);
  playSound("milestone");
  setTimeout(() => notif.remove(), 4000);
}

export function triggerAchievementNotification(achievement: {
  emoji: string;
  name: string;
  description: string;
}): void {
  const { dom } = getCtx();
  if (!dom.workspace) return;

  const notif = document.createElement("div");
  notif.className = "achievement-notification animate-pop";
  notif.setAttribute("role", "status");

  const emoji = document.createElement("div");
  emoji.className = "achievement-notification__emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = achievement.emoji;

  const text = document.createElement("div");
  text.className = "achievement-notification__text";

  const title = document.createElement("h4");
  title.textContent = "Achievement Unlocked";

  const body = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = achievement.name;
  body.append(strong, document.createTextNode(` — ${achievement.description}`));

  text.append(title, body);
  notif.append(emoji, text);
  dom.workspace.appendChild(notif);

  playSound("unlock");
  setTimeout(() => notif.remove(), 4200);
}
