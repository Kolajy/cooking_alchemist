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
  canCombineIngredients,
  cacheMergeTargets,
  clearMergeTargets
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

export function clampCanvasPosition(el, x, y, cachedWsRect = null, cachedElSize = null) {
  const { dom } = getCtx();
  const ws = cachedWsRect || dom.workspace.getBoundingClientRect();
  const w = cachedElSize ? cachedElSize.w : el.offsetWidth;
  const h = cachedElSize ? cachedElSize.h : el.offsetHeight;
  return {
    x: Math.round(Math.max(0, Math.min(x, ws.width - w))),
    y: Math.round(Math.max(0, Math.min(y, ws.height - h)))
  };
}

export function removeCanvasElement(el) {
  const { state, dom } = getCtx();
  el.remove();

  const newActiveElements = [];
  for (let i = 0; i < state.activeElements.length; i++) {
    if (state.activeElements[i] !== el) {
      newActiveElements.push(state.activeElements[i]);
    }
  }
  state.activeElements = newActiveElements;

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

  const canvasElements = workspace.querySelectorAll(".canvas-element");
  for (let i = 0; i < canvasElements.length; i++) {
    canvasElements[i].remove();
  }

  const tempElements = workspace.querySelectorAll(".particle, .floating-warning, .levelup-notification, .achievement-notification, .kitchen-hint");
  for (let i = 0; i < tempElements.length; i++) {
    tempElements[i].remove();
  }

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
  const isBoil = type === "boil";
  const isSmoke = type === "smoke";
  const isSizzle = type === "sizzle";

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    if (isSteam) particle.className = "particle particle--steam";
    else if (isSmoke) particle.className = "particle particle--smoke";
    else if (isBoil) particle.className = "particle particle--boil";
    else if (isSizzle) particle.className = "particle particle--sizzle";
    else particle.className = "particle";

    let size = secureRandom() * 8 + 4;
    let color = "var(--color-fire)";

    if (type === "success") {
      color = i % 2 === 0 ? "var(--color-gold)" : "var(--color-success)";
    } else if (type === "fail") {
      color = `hsla(220, 12%, 55%, ${0.55 + secureRandom() * 0.25})`;
    } else if (isSteam || isSmoke) {
      const lightness = isSmoke ? 30 : 96;
      const alpha = isSmoke ? (0.2 + secureRandom() * 0.15) : (0.28 + secureRandom() * 0.22);
      color = `hsla(40, 30%, ${lightness}%, ${alpha})`;
      size = secureRandom() * 16 + 10;
    } else if (isBoil) {
      color = `hsla(200, 80%, 80%, ${0.6 + secureRandom() * 0.3})`;
      size = secureRandom() * 6 + 4;
    } else if (isSizzle) {
      color = i % 2 === 0 ? "var(--color-fire)" : "var(--color-gold)";
      size = secureRandom() * 4 + 2;
    }

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    if (isSteam || isSmoke) {
      const driftX = secureRandom() * 36 - 18;
      const rise = secureRandom() * 40 + 70;
      particle.style.setProperty("--dx", `${driftX}px`);
      particle.style.setProperty("--dy", `${-rise}px`);
      particle.style.setProperty("--dur", `${1.3 + secureRandom() * 0.6}s`);
    } else if (isBoil) {
      const driftX = secureRandom() * 10 - 5;
      const rise = secureRandom() * 20 + 20;
      particle.style.setProperty("--dx", `${driftX}px`);
      particle.style.setProperty("--dy", `${-rise}px`);
    } else if (isSizzle) {
      const angle = secureRandom() * Math.PI * 2;
      const speed = secureRandom() * 40 + 10;
      particle.style.setProperty("--dx", `${Math.cos(angle) * speed}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * speed - 10}px`);
    } else {
      const angle = secureRandom() * Math.PI * 2;
      const speed = secureRandom() * 70 + 20;
      particle.style.setProperty("--dx", `${Math.cos(angle) * speed}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * speed - 15}px`);
    }

    dom.workspace.appendChild(particle);
    setTimeout(() => particle.remove(), (isSteam || isSmoke) ? 1900 : (isBoil ? 600 : 800));
  }
}

let lastHighlightedDragEl = null;
let lastHighlightedAction = null;

export function updateCollisionHighlight(draggedEl, draggedPos?: { x: number; y: number }) {
  const { state } = getCtx();
  const previousTarget = state.mergeTarget;

  // Only recalculate valid targets if the dragged element or action changed
  if (draggedEl !== lastHighlightedDragEl || state.activeAction !== lastHighlightedAction) {
    // Clear old targets
    for (let i = 0; i < state.activeElements.length; i++) {
      state.activeElements[i].classList.remove("combine-valid-target");
    }

    lastHighlightedDragEl = draggedEl;
    lastHighlightedAction = state.activeAction;

    if (state.activeAction === "combine" && draggedEl) {
      const draggedId = draggedEl.dataset.id;
      if (draggedId) {
        for (let i = 0; i < state.activeElements.length; i++) {
          const otherEl = state.activeElements[i];
          if (otherEl === draggedEl) continue;
          const otherId = otherEl.dataset.id;
          if (otherId && canCombineIngredients(draggedId, otherId)) {
            otherEl.classList.add("combine-valid-target");
          }
        }
      }
    }
  }

  if (state.activeAction !== "combine" || !draggedEl) {
    if (previousTarget) {
      previousTarget.classList.remove("hover-merge");
    }
    state.mergeTarget = null;
    return;
  }

  const closestEl = findMergeTarget(draggedEl, draggedPos?.x, draggedPos?.y);
  state.mergeTarget = closestEl;

  if (closestEl !== previousTarget) {
    if (previousTarget) {
      previousTarget.classList.remove("hover-merge");
    }
    if (closestEl) {
      closestEl.classList.add("hover-merge");
      playSound("ui_hover");
    }
  }
}

function moveDraggedElement(el, clientX, clientY, grabOffset) {
  const { dom } = getCtx();
  const ws = cachedWorkspaceRect || dom.workspace.getBoundingClientRect();
  const pos = clampCanvasPosition(
    el,
    clientX - ws.left - grabOffset.x,
    clientY - ws.top - grabOffset.y,
    ws,
    cachedDragElSize
  );
  setCanvasPosition(el, pos.x, pos.y);
  updateCollisionHighlight(el, pos);
}

function onPointerDown(e) {
  const { state, dom } = getCtx();
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

  cachedWorkspaceRect = dom.workspace.getBoundingClientRect();
  cachedDragElSize = { w: el.offsetWidth, h: el.offsetHeight };
  cacheMergeTargets();

  el.setPointerCapture(e.pointerId);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
}

let moveRaf = null;
let movePendingX = 0;
let movePendingY = 0;
let cachedWorkspaceRect = null;
let cachedDragElSize = null;

function onPointerMove(e) {
  const { state } = getCtx();
  if (!state.draggedElement) return;

  const el = state.draggedElement;
  const dx = e.clientX - state.dragStart.x;
  const dy = e.clientY - state.dragStart.y;

  if (!state.dragMoved) {
    // Use squared distance instead of Math.hypot to avoid expensive math calculations per-frame in pointermove
    if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
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

  cachedWorkspaceRect = null;
  cachedDragElSize = null;
  clearMergeTargets();

  state.draggedElement = null;
  updateCollisionHighlight(null);

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
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", `${item.name}`);
  el.appendChild(buildIngredientMarkup(item, false));
  
  if (x === null || y === null) {
    const rect = dom.workspace.getBoundingClientRect();
    x = rect.width / 2 + (secureRandom() * 80 - 40);
    y = rect.height / 2 + (secureRandom() * 80 - 40);
  }



  setCanvasPosition(el, x, y);
  el.title = "Drag to move · click to apply technique or remove";
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Use the actual apply technique if we hit enter, as that is the standard action
      import("../actions/toolbar").then(toolbar => {
        const wasApplied = toolbar.applyActiveTechniqueToCounter();
        if (!wasApplied) {
           // If we didn't apply technique, toggle selection maybe? The game relies on dragging,
           // but `applyActiveTechniqueToCounter` acts on ALL elements.
           // To keep it simple, space/enter applies the technique just like the global shortcut.
        }
      });
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      import("../feedback/undo").then(undo => {
        const pos = getCanvasPosition(el);
        undo.pushUndoEntry({
          type: "remove",
          itemId: item.id,
          x: pos.x,
          y: pos.y
        });
        removeCanvasElement(el);
      });
    } else if (e.key === "ArrowRight") {
       e.preventDefault();
       focusNextCanvasElement(el, 1);
    } else if (e.key === "ArrowLeft") {
       e.preventDefault();
       focusNextCanvasElement(el, -1);
    }
  });
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

export function focusNextCanvasElement(currentEl, dir) {
  const { state } = getCtx();
  const els = state.activeElements;
  if (!els || els.length === 0) return;

  const idx = els.indexOf(currentEl);
  if (idx === -1) return;

  let nextIdx = idx + dir;
  if (nextIdx >= els.length) nextIdx = 0;
  if (nextIdx < 0) nextIdx = els.length - 1;

  els[nextIdx].focus();
}
