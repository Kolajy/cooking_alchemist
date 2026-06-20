import { getCtx } from "../context";
import { DRAG_THRESHOLD } from "../constants";
import { enrichItem, buildIngredientMarkup, resolvePlayableIngredient } from "../ingredients";
import { spawnElementOnCanvas, getCanvasPosition } from "./workspace";
import { switchMainView } from "../ui/views";
import { pushUndoEntry } from "../feedback/undo";
import { playSound } from "../feedback/sounds";

function recordSpawnUndo(item, element) {
  const pos = getCanvasPosition(element);
  pushUndoEntry({
    type: "spawn",
    itemId: item.id,
    x: pos.x,
    y: pos.y
  });
}

function createCabinetDragGhost(item, sourceEl) {
  const ghost = document.createElement("div");
  ghost.className = "alchemy-element cabinet-drag-ghost";
  ghost.innerHTML = buildIngredientMarkup(enrichItem(item), false);
  ghost.style.position = "fixed";
  ghost.style.left = "0";
  ghost.style.top = "0";
  ghost.style.zIndex = "10000";
  ghost.style.pointerEvents = "none";

  if (sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    ghost.style.width = `${rect.width}px`;
    ghost.style.minWidth = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.boxSizing = "border-box";
    ghost.style.flexDirection = "column";
    ghost.style.alignItems = "center";
    ghost.style.justifyContent = "center";
    ghost.style.textAlign = "center";
  }

  document.body.appendChild(ghost);
  return ghost;
}

function positionCabinetDragGhost(ghost, clientX, clientY, grabOffset) {
  ghost.style.transform = `translate3d(${Math.round(clientX - grabOffset.x)}px, ${Math.round(clientY - grabOffset.y)}px, 0)`;
}

function isPointerOverWorkspace(clientX, clientY) {
  const { dom } = getCtx();
  const ws = dom.workspace.getBoundingClientRect();
  return clientX >= ws.left && clientX <= ws.right && clientY >= ws.top && clientY <= ws.bottom;
}

function scheduleCabinetGhostMove(drag, clientX, clientY) {
  const { dom } = getCtx();
  drag.pendingX = clientX;
  drag.pendingY = clientY;
  if (drag.raf) return;

  drag.raf = requestAnimationFrame(() => {
    drag.raf = null;
    if (!drag.ghost) return;

    positionCabinetDragGhost(drag.ghost, drag.pendingX, drag.pendingY, drag.grabOffset);

    const overWorkspace = isPointerOverWorkspace(drag.pendingX, drag.pendingY);
    if (overWorkspace !== drag.overWorkspace) {
      drag.overWorkspace = overWorkspace;
      dom.workspace.classList.toggle("workspace-drop-target", overWorkspace);
    }
  });
}

function removeCabinetDragGhost(drag) {
  const { dom } = getCtx();
  if (drag?.raf) {
    cancelAnimationFrame(drag.raf);
    drag.raf = null;
  }
  if (drag?.ghost) {
    drag.ghost.remove();
    drag.ghost = null;
  }
  document.body.classList.remove("is-cabinet-dragging");
  dom.workspace?.classList.remove("workspace-drop-target");
}

function detachCabinetDragListeners(drag) {
  if (drag?.sourceEl) {
    drag.sourceEl.removeEventListener("pointermove", onCabinetPointerMove);
    drag.sourceEl.removeEventListener("pointerup", onCabinetPointerUp);
    drag.sourceEl.removeEventListener("pointercancel", onCabinetPointerUp);
  }
  document.body.removeEventListener("pointermove", onCabinetDocumentPointerMove);
  document.body.removeEventListener("pointerup", onCabinetDocumentPointerUp);
  document.body.removeEventListener("pointercancel", onCabinetDocumentPointerUp);
}

function endCabinetDrag(pointerId) {
  const { state } = getCtx();
  const drag = state.cabinetDrag;
  if (!drag || drag.pointerId !== pointerId) return;

  try {
    document.body.releasePointerCapture(pointerId);
  } catch {
    /* pointer may already be released */
  }
  try {
    drag.sourceEl.releasePointerCapture(pointerId);
  } catch {
    /* pointer may already be released */
  }

  removeCabinetDragGhost(drag);
  detachCabinetDragListeners(drag);
  state.cabinetDrag = null;
}

function activateCabinetDrag(drag, pointerId) {
  if (drag.active) return;
  drag.active = true;
  drag.overWorkspace = false;

  document.body.classList.add("is-cabinet-dragging");
  document.body.setPointerCapture(pointerId);
  playSound("ui_pickup");

  drag.sourceEl.removeEventListener("pointermove", onCabinetPointerMove);
  drag.sourceEl.removeEventListener("pointerup", onCabinetPointerUp);
  drag.sourceEl.removeEventListener("pointercancel", onCabinetPointerUp);

  document.body.addEventListener("pointermove", onCabinetDocumentPointerMove);
  document.body.addEventListener("pointerup", onCabinetDocumentPointerUp);
  document.body.addEventListener("pointercancel", onCabinetDocumentPointerUp);
}

export function onCabinetPointerDown(e) {
  const { state } = getCtx();
  const item = resolvePlayableIngredient(e.currentTarget.dataset.id);
  if (!item) return;

  if (state.activeMainView === "map") switchMainView("cook");

  const sourceEl = e.currentTarget;
  const rect = sourceEl.getBoundingClientRect();
  const grabOffset = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  const ghost = createCabinetDragGhost(item, sourceEl);
  positionCabinetDragGhost(ghost, e.clientX, e.clientY, grabOffset);

  state.cabinetDrag = {
    item,
    sourceEl,
    grabOffset,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    active: false,
    ghost,
    overWorkspace: false,
    raf: null,
    pendingX: e.clientX,
    pendingY: e.clientY
  };

  sourceEl.setPointerCapture(e.pointerId);
  sourceEl.addEventListener("pointermove", onCabinetPointerMove);
  sourceEl.addEventListener("pointerup", onCabinetPointerUp);
  sourceEl.addEventListener("pointercancel", onCabinetPointerUp);
}

function onCabinetPointerMove(e) {
  const { state } = getCtx();
  const drag = state.cabinetDrag;
  if (!drag || e.pointerId !== drag.pointerId) return;

  scheduleCabinetGhostMove(drag, e.clientX, e.clientY);

  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  if (!drag.active && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
    activateCabinetDrag(drag, e.pointerId);
  }
}

function onCabinetDocumentPointerMove(e) {
  const { state } = getCtx();
  const drag = state.cabinetDrag;
  if (!drag || !drag.active || e.pointerId !== drag.pointerId || !drag.ghost) return;
  scheduleCabinetGhostMove(drag, e.clientX, e.clientY);
}

function onCabinetDocumentPointerUp(e) {
  const { state, dom } = getCtx();
  const drag = state.cabinetDrag;
  if (!drag || e.pointerId !== drag.pointerId) return;

  if (drag.active && drag.ghost) {
    if (drag.raf) {
      cancelAnimationFrame(drag.raf);
      drag.raf = null;
    }
    positionCabinetDragGhost(drag.ghost, e.clientX, e.clientY, drag.grabOffset);

    if (isPointerOverWorkspace(e.clientX, e.clientY)) {
      const ws = dom.workspace.getBoundingClientRect();
      const rect = drag.ghost.getBoundingClientRect();
      const element = spawnElementOnCanvas(drag.item, rect.left - ws.left, rect.top - ws.top);
      recordSpawnUndo(drag.item, element);
      playSound("ui_place");
    }
  }

  endCabinetDrag(e.pointerId);
}

function onCabinetPointerUp(e) {
  const { state } = getCtx();
  const drag = state.cabinetDrag;
  if (!drag || e.pointerId !== drag.pointerId) return;

  if (!drag.active) {
    const element = spawnElementOnCanvas(drag.item);
    recordSpawnUndo(drag.item, element);
    playSound("ui_place");
  }

  endCabinetDrag(e.pointerId);
}
