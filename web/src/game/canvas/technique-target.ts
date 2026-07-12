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

export function findMergeTarget(draggedEl) {
  const { state } = getCtx();
  if (state.activeAction !== "combine" || !draggedEl) return null;

  // Use fast position lookup instead of getBoundingClientRect
  // getCanvasPosition returns transform coordinates relative to workspace
  // Since elements are roughly same size (or at least we can use a fixed size proxy),
  // distance between their top-left corners works just as well.
  const pos1X = Number(draggedEl.dataset.x) || 0;
  const pos1Y = Number(draggedEl.dataset.y) || 0;

  let closestEl = null;
  let minDistance = 70;

  state.activeElements.forEach(otherEl => {
    if (otherEl === draggedEl) return;

    const pos2X = Number(otherEl.dataset.x) || 0;
    const pos2Y = Number(otherEl.dataset.y) || 0;
    const dx = pos1X - pos2X;
    const dy = pos1Y - pos2Y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDistance) {
      minDistance = dist;
      closestEl = otherEl;
    }
  });

  return closestEl;
}

export function canCombineIngredients(idA: string, idB: string): boolean {
  const index = getTransitionIndex();
  if (!index || !idA || !idB) return false;
  return index.combineTransitions.some(t => t.inputs.includes(idA) && t.inputs.includes(idB));
}
