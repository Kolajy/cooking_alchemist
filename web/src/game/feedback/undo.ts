import { getCtx } from "../context";
import { resolvePlayableIngredient } from "../ingredients";
import {
  getCanvasPosition,
  removeCanvasElement,
  spawnElementOnCanvas
} from "../canvas/workspace";
import { playSound } from "../feedback/sounds";
import { setAchievementFlag } from "../progression/achievements";

export function pushUndoEntry(entry) {
  const { state } = getCtx();
  state.undoEntry = entry;
  refreshUndoButton();
}

export function clearUndoEntry() {
  const { state } = getCtx();
  state.undoEntry = null;
  refreshUndoButton();
}

function getUndoTitle(entry) {
  switch (entry.type) {
    case "spawn":
      return "Take it off the counter";
    case "remove":
      return "Put that ingredient back";
    case "combine":
      return "Undo last combine";
    case "technique":
      return "Undo last technique";
    default:
      return "Undo last action";
  }
}

export function refreshUndoButton() {
  const { state, dom } = getCtx();
  const btn = dom.btnUndoWorkspace;
  if (!btn) return;

  const entry = state.undoEntry;
  btn.disabled = !entry;

  if (!entry) {
    btn.title = "Nothing to undo";
    return;
  }

  btn.title = getUndoTitle(entry);
}

export function applyUndo() {
  const { state } = getCtx();
  const entry = state.undoEntry;
  if (!entry) return false;

  if (entry.type === "spawn") {
    let match = state.activeElements.find(el => {
      const pos = getCanvasPosition(el);
      return el.dataset.id === entry.itemId
        && pos.x === entry.x
        && pos.y === entry.y;
    });

    if (!match) {
      for (let i = state.activeElements.length - 1; i >= 0; i--) {
        const el = state.activeElements[i];
        if (el.dataset.id === entry.itemId) {
          match = el;
          break;
        }
      }
    }

    if (match) {
      removeCanvasElement(match);
    }
  } else if (entry.type === "remove") {
    const item = resolvePlayableIngredient(entry.itemId);
    if (item) {
      spawnElementOnCanvas(item, entry.x, entry.y);
    }
  } else if (entry.type === "combine") {
    entry.outputs?.forEach(output => {
      const match = state.activeElements.find(el => el.dataset.id === output.itemId);
      if (match) removeCanvasElement(match);
    });

    const item1 = resolvePlayableIngredient(entry.item1Id);
    const item2 = resolvePlayableIngredient(entry.item2Id);
    if (item1) spawnElementOnCanvas(item1, entry.x1, entry.y1);
    if (item2) spawnElementOnCanvas(item2, entry.x2, entry.y2);
  } else if (entry.type === "technique") {
    entry.outputs?.forEach(output => {
      const match = state.activeElements.find(el => {
        const pos = getCanvasPosition(el);
        return el.dataset.id === output.itemId
          && pos.x === output.x
          && pos.y === output.y;
      });
      if (match) removeCanvasElement(match);
    });

    if (entry.consumedInput) {
      const item = resolvePlayableIngredient(entry.inputId);
      if (item) spawnElementOnCanvas(item, entry.x, entry.y);
    }
  }

  clearUndoEntry();
  setAchievementFlag("undo_used");
  playSound("ui_undo");
  return true;
}
