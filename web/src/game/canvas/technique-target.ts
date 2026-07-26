import { getCtx } from "../context";
import { isTechniqueCategory } from "../actions/mode";
import { METHODS_WITH_OWN_ACTION } from "../constants";

function getTransitionIndex() {
  const { data } = getCtx();
  return data.transitionIndex || globalThis.TRANSITION_INDEX || null;
}

/** Tool/action ids the active toolbar selection can apply. */
export function getActiveTechniqueToolIds() {
  const { state, data } = getCtx();

  if (state.activeSkillId) {
    const skill = data.PROGRESSION_TIERS[state.activeSkillId];
    if (skill?.actions?.length) return skill.actions;
    return [state.activeSkillId];
  }

  if (METHODS_WITH_OWN_ACTION.has(state.activeAction)) {
    const methodId = state.activeAction;
    const cfg = data.PLAYER_ACTIONS[methodId];
    if (!cfg) return [];

    const toolIds: string[] = [];
    if (cfg.mode) {
      toolIds.push(cfg.mode);
    }

    (cfg.categories || []).forEach(category => {
      const skills = Object.keys(data.PROGRESSION_TIERS)
        .map(id => ({ id, ...data.PROGRESSION_TIERS[id] }))
        .filter(skill => skill.category === category);

      skills.forEach(skill => {
        if (data.Progression.isUnlocked(skill.id)) {
          if (skill.actions?.length) {
            toolIds.push(...skill.actions);
          } else {
            toolIds.push(skill.id);
          }
        }
      });
    });

    return toolIds;
  }

  return [];
}

export function canTechniqueAffectInput(inputId, toolIds = null) {
  const index = getTransitionIndex();
  if (!index || !inputId) return false;

  const tools = toolIds || getActiveTechniqueToolIds();
  return tools.some(toolId => Boolean(index.getTechniqueTransition(toolId, inputId)));
}

export function canTechniqueAffectElement(el, toolIds = null) {
  if (!el?.dataset?.id) return false;
  return canTechniqueAffectInput(el.dataset.id, toolIds);
}

export function isTechniqueApplicationMode() {
  const { state } = getCtx();
  if (state.activeAction === "move" || state.activeAction === "combine") return false;
  if (METHODS_WITH_OWN_ACTION.has(state.activeAction)) return true;
  if (isTechniqueCategory(state.activeAction) && state.activeSkillId) return true;
  return false;
}

export function updateTechniqueTargetHighlights() {
  const { state } = getCtx();
  const toolIds = getActiveTechniqueToolIds();
  const active = isTechniqueApplicationMode();

  state.activeElements.forEach(el => {
    const valid = active && canTechniqueAffectElement(el, toolIds);
    el.classList.toggle("technique-valid-target", valid);
  });
}

let cachedTargetPositions: { el: HTMLElement; x: number; y: number }[] | null = null;

export function cacheMergeTargets() {
  const { state } = getCtx();
  cachedTargetPositions = state.activeElements.map(el => ({
    el,
    x: Number(el.dataset.x) || 0,
    y: Number(el.dataset.y) || 0
  }));
}

export function clearMergeTargets() {
  cachedTargetPositions = null;
}

export function findMergeTarget(draggedEl, draggedX?: number, draggedY?: number) {
  const { state } = getCtx();
  if (state.activeAction !== "combine" || !draggedEl) return null;

  // Use fast position lookup instead of getBoundingClientRect
  // getCanvasPosition returns transform coordinates relative to workspace
  // Since elements are roughly same size (or at least we can use a fixed size proxy),
  // distance between their top-left corners works just as well.
  const pos1X = draggedX !== undefined ? draggedX : (Number(draggedEl.dataset.x) || 0);
  const pos1Y = draggedY !== undefined ? draggedY : (Number(draggedEl.dataset.y) || 0);

  let closestEl = null;
  let minDistanceSq = 70 * 70;

  const targets = cachedTargetPositions || state.activeElements.map(el => ({
    el,
    x: Number(el.dataset.x) || 0,
    y: Number(el.dataset.y) || 0
  }));

  targets.forEach(target => {
    if (target.el === draggedEl) return;

    const dx = pos1X - target.x;
    const dy = pos1Y - target.y;

    // Use squared distance instead of Math.sqrt to avoid expensive math calculations per-frame in pointermove
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestEl = target.el;
    }
  });

  return closestEl;
}

export function canCombineIngredients(idA: string, idB: string): boolean {
  const index = getTransitionIndex();
  if (!index || !idA || !idB) return false;
  // Use O(1) hash map lookup instead of O(N) array search
  return Boolean(index.getCombineTransition([idA, idB]));
}
