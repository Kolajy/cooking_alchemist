import { secureRandom } from "../security/math";
import { getCtx } from "../context";
import { DRAG_THRESHOLD } from "../constants";
import { enrichItem, buildIngredientMarkup } from "../ingredients";
import { pushUndoEntry, clearUndoEntry } from "../feedback/undo";
import { playSound } from "../feedback/sounds";
import {
  canTechniqueAffectElement,
  findMergeTarget,
  updateTechniqueTargetHighlights,
  canCombineIngredients
} from "./technique-target";
import { bindHoverPanelEvents } from "../ui/hover-panel";

export function getCanvasPosition(el) {
  return {
    x: Number(el.dataset.x) || 0,
    y: Number(el.dataset.y) || 0
  };
}

export function setCanvasPosition(el, x, y) {
  const rx = Math.round(x);
  const ry = Math.round(y);
  el.dataset.x = String(rx);
  el.dataset.y = String(ry);
  el.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
}

export function clampCanvasPosition(el, x, y) {
  const { dom } = getCtx();
  const ws = dom.workspace.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  return {
    x: Math.round(Math.max(0, Math.min(x, ws.width - w))),
    y: Math.round(Math.max(0, Math.min(y, ws.height - h)))
  };
}

export function removeCanvasElement(el) {
  const { state, dom } = getCtx();
  el.remove();
  state.activeElements = state.activeElements.filter(item => item !== el);
  updateWorkspaceHintVisibility();
  updateTechniqueTargetHighlights();
}

function updateWorkspaceHintVisibility() {
  const { state, dom } = getCtx();
  const hint = dom.workspace?.querySelector(".workspace-hint") as HTMLElement | null;
  if (!hint) return;
  hint.style.display = state.activeElements.length === 0 ? "" : "none";
}

export function clearWorkspace() {
  const { state, dom } = getCtx();
  const { workspace } = dom;
  if (!workspace) return;

  if (state.activeElements.length > 0) {
    playSound("ui_clear");
  }

  workspace.querySelectorAll(".canvas-element").forEach(el => el.remove());
  workspace.querySelectorAll(".particle, .floating-warning, .levelup-notification, .achievement-notification, .kitchen-hint").forEach(el => el.remove());
  state.activeElements = [];
  state.mergeTarget = null;
  clearUndoEntry();
  updateWorkspaceHintVisibility();
  updateTechniqueTargetHighlights();
}

export function bounceElementsApart(el1, el2) {
  const p1 = getCanvasPosition(el1);
  const p2 = getCanvasPosition(el2);

  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const pushX = (dx / dist) * 25;
  const pushY = (dy / dist) * 25;

  setCanvasPosition(el1, p1.x + pushX, p1.y + pushY);
  setCanvasPosition(el2, p2.x - pushX, p2.y - pushY);
}

export function createParticles(x, y, count, type) {
  const { dom } = getCtx();
  const isSteam = type === "steam";
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = isSteam ? "particle particle--steam" : "particle";

    let size = secureRandom() * 8 + 4;
    let color = "var(--color-fire)";

    if (type === "success") {
      color = i % 2 === 0 ? "var(--color-gold)" : "var(--color-success)";
    } else if (type === "fail") {
      color = `hsla(220, 12%, 55%, ${0.55 + secureRandom() * 0.25})`;
    } else if (isSteam) {
      color = `hsla(40, 30%, 96%, ${0.28 + secureRandom() * 0.22})`;
      size = secureRandom() * 16 + 10;
    }

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    if (isSteam) {
      // Steam drifts gently upward with a slight horizontal waver, then blooms.
      const driftX = secureRandom() * 36 - 18;
      const rise = secureRandom() * 40 + 70;
      particle.style.setProperty("--dx", `${driftX}px`);
      particle.style.setProperty("--dy", `${-rise}px`);
      particle.style.setProperty("--dur", `${1.3 + secureRandom() * 0.6}s`);
    } else {
      const angle = secureRandom() * Math.PI * 2;
      const speed = secureRandom() * 70 + 20;
      particle.style.setProperty("--dx", `${Math.cos(angle) * speed}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * speed - 15}px`);
    }

    dom.workspace.appendChild(particle);
    setTimeout(() => particle.remove(), isSteam ? 1900 : 800);
  }
}

export function updateCollisionHighlight(draggedEl) {
  const { state } = getCtx();
  const previousTarget = state.mergeTarget;
  state.activeElements.forEach(otherEl => {
    otherEl.classList.remove("hover-merge");
    otherEl.classList.remove("combine-valid-target");
  });

  if (state.activeAction !== "combine" || !draggedEl) {
    state.mergeTarget = null;
    return;
  }

  const draggedId = draggedEl.dataset.id;
  if (draggedId) {
    state.activeElements.forEach(otherEl => {
      if (otherEl === draggedEl) return;
      const otherId = otherEl.dataset.id;
      if (otherId && canCombineIngredients(draggedId, otherId)) {
        otherEl.classList.add("combine-valid-target");
      }
    });
  }

  const closestEl = findMergeTarget(draggedEl);
  state.mergeTarget = closestEl;
  if (closestEl) {
    closestEl.classList.add("hover-merge");
    if (closestEl !== previousTarget) {
      playSound("ui_hover");
    }
  }
}

function moveDraggedElement(el, clientX, clientY, grabOffset) {
  const { dom } = getCtx();
  const ws = dom.workspace.getBoundingClientRect();
  const pos = clampCanvasPosition(
    el,
    clientX - ws.left - grabOffset.x,
    clientY - ws.top - grabOffset.y
  );
  setCanvasPosition(el, pos.x, pos.y);
  updateCollisionHighlight(el);
}

function onPointerDown(e) {
  const { state } = getCtx();
  e.preventDefault();
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  state.draggedElement = el;
  state.dragMoved = false;
  state.dragStart = { x: e.clientX, y: e.clientY };
  state.dragGrabOffset = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  el.setPointerCapture(e.pointerId);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
}

let moveRaf = null;
let movePendingX = 0;
let movePendingY = 0;

function onPointerMove(e) {
  const { state } = getCtx();
  if (!state.draggedElement) return;

  const el = state.draggedElement;
  const dx = e.clientX - state.dragStart.x;
  const dy = e.clientY - state.dragStart.y;

  if (!state.dragMoved) {
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    state.dragMoved = true;
    el.classList.add("dragging");
    el.style.zIndex = "1002";
    playSound("ui_pickup");
  }

  movePendingX = e.clientX;
  movePendingY = e.clientY;

  if (!moveRaf) {
    moveRaf = requestAnimationFrame(() => {
      moveRaf = null;
      if (state.draggedElement === el) {
        moveDraggedElement(el, movePendingX, movePendingY, state.dragGrabOffset);
      }
    });
  }
}

function onPointerUp(e) {
  const { state } = getCtx();
  if (!state.draggedElement) return;

  if (moveRaf) {
    cancelAnimationFrame(moveRaf);
    moveRaf = null;
    // ensure final position updates
    moveDraggedElement(state.draggedElement, movePendingX, movePendingY, state.dragGrabOffset);
  }

  const el = state.draggedElement;
  const wasClick = !state.dragMoved;
  const mergeTarget = state.mergeTarget;

  el.classList.remove("dragging");
  el.releasePointerCapture(e.pointerId);
  el.removeEventListener("pointermove", onPointerMove);
  el.removeEventListener("pointerup", onPointerUp);

  state.draggedElement = null;
  state.mergeTarget = null;
  state.activeElements.forEach(item => item.classList.remove("hover-merge"));

  if (!wasClick && state.activeAction === "combine" && mergeTarget) {
    getCtx().actions.combineElements?.(el, mergeTarget);
    return;
  }

  if (wasClick) {
    // Apply the currently active action if it can affect this element; otherwise remove it.
    if (canTechniqueAffectElement(el)) {
      getCtx().actions.applyToolToElement?.(el);
      return;
    }

    const itemId = el.dataset.id;
    const { x, y } = getCanvasPosition(el);
    pushUndoEntry({ type: "remove", itemId, x, y, origin: el.dataset.origin });
    removeCanvasElement(el);
    playSound("ui_remove");
  }
}

export function spawnElementOnCanvas(itemData, x = null, y = null, options = {}) {
  const { state, dom } = getCtx();
  const hint = dom.workspace?.querySelector(".workspace-hint") as HTMLElement | null;
  if (hint) hint.style.display = "none";

  const item = enrichItem(itemData);
  const el = document.createElement("div");
  el.className = "alchemy-element canvas-element";
  el.dataset.id = item.id;
  el.dataset.origin = item.origin;
  el.appendChild(buildIngredientMarkup(item, false));

  if (x === null || y === null) {
    const rect = dom.workspace.getBoundingClientRect();
    x = rect.width / 2 + (secureRandom() * 80 - 40);
    y = rect.height / 2 + (secureRandom() * 80 - 40);
  }

  setCanvasPosition(el, x, y);
  el.title = "Drag to move · click to apply technique or remove";
  el.addEventListener("pointerdown", onPointerDown);
  bindHoverPanelEvents(el, item.id);

  dom.workspace.appendChild(el);
  state.activeElements.push(el);

  if (options.animate) {
    el.classList.add("canvas-element--spawning");
    el.addEventListener(
      "animationend",
      () => el.classList.remove("canvas-element--spawning"),
      { once: true }
    );
  }

  updateTechniqueTargetHighlights();
  return el;
}

export { updateTechniqueTargetHighlights };
