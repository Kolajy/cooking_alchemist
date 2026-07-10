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

    if (cfg.categories) {
      for (let i = 0; i < cfg.categories.length; i++) {
        const category = cfg.categories[i];
        for (const id in data.PROGRESSION_TIERS) {
          const tier = data.PROGRESSION_TIERS[id];
          if (tier.category === category && data.Progression.isUnlocked(id)) {
            if (tier.actions?.length) {
              toolIds.push(...tier.actions);
            } else {
              toolIds.push(id);
            }
          }
        }
      }
    }

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

  for (let i = 0; i < state.activeElements.length; i++) {
    const el = state.activeElements[i];
    const valid = active && canTechniqueAffectElement(el, toolIds);
    el.classList.toggle("technique-valid-target", valid);
  }
}

export function findMergeTarget(draggedEl) {
  const { state } = getCtx();
  if (state.activeAction !== "combine" || !draggedEl) return null;

  const rect1 = draggedEl.getBoundingClientRect();
  const center1X = rect1.left + rect1.width / 2;
  const center1Y = rect1.top + rect1.height / 2;

  let closestEl = null;


  let minDistanceSq = 70 * 70;
  for (let i = 0; i < state.activeElements.length; i++) {
    const otherEl = state.activeElements[i];
    if (otherEl === draggedEl) continue;

    const rect2 = otherEl.getBoundingClientRect();
    const dx = center1X - (rect2.left + rect2.width / 2);
    const dy = center1Y - (rect2.top + rect2.height / 2);
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestEl = otherEl;
    }
  }

  return closestEl;
}

export function canCombineIngredients(idA: string, idB: string): boolean {
  const index = getTransitionIndex();
  if (!index || !idA || !idB) return false;
  return index.combineTransitions.some(t => t.inputs.includes(idA) && t.inputs.includes(idB));
}
