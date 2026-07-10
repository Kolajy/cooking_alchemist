import { getCtx } from "../context";
import { isTechniqueCategory } from "../actions/mode";
import { getProgressionEngine } from "../data";
import type { MatchRecipeResult } from "../../types";

function itemLabel(id: string): string {
  const { data } = getCtx();
  const item = data.DISCOVERABLE_ITEMS[id]
    || data.STARTER_ELEMENTS.find(starter => starter.id === id)
    || data.UNLOCKABLE_ELEMENTS.find(entry => entry.id === id);
  return item ? `${item.emoji} ${item.name}` : id;
}

function skillLabel(skillId: string): string {
  const { data } = getCtx();
  const tier = data.PROGRESSION_TIERS[skillId];
  if (tier) return `${tier.emoji} ${tier.name}`;

  for (const action of Object.values(data.PLAYER_ACTIONS)) {
    if (action.mode === skillId) return `${action.emoji} ${action.name}`;
  }

  return skillId;
}

function methodLabelForSkill(skillId: string): string | null {
  const { data } = getCtx();
  for (const [methodId, action] of Object.entries(data.PLAYER_ACTIONS)) {
    if (action.mode === skillId) return action.name;
    if (action.starterSkill === skillId) return action.name;
    if (action.categories?.some(category => {
      const tier = data.PROGRESSION_TIERS[skillId];
      return tier?.category === category;
    })) {
      return action.name;
    }
  }
  return data.PROGRESSION_TIERS[skillId]?.name ?? null;
}

function isPrimal(id: string): boolean {
  const { data } = getCtx();
  return data.PRIMITIVE_INGREDIENT_IDS.has(id)
    || data.getIngredientOrigin(id) === "primitive";
}

function isDiscovered(id: string): boolean {
  const { state } = getCtx();
  return state.discoveredIds.has(id);
}

function lockedSkillHint(skillId: string): string | null {
  const engine = getProgressionEngine(getCtx().data);
  if (!engine) return null;

  const tier = engine.tiers[skillId];
  if (!tier) return `Unlock ${skillLabel(skillId)} in the Skills tab first.`;

  const prereqs = tier.unlockCriteria?.prerequisites;
  if (prereqs) {
    for (const [parentId, needed] of Object.entries(prereqs)) {
      const current = engine.getXP(parentId);
      if (current < needed) {
        return `Practice ${skillLabel(parentId)} more (${current}/${needed} exp) to unlock ${skillLabel(skillId)}.`;
      }
    }
  }

  if (tier.dependsOn?.length) {
    const blocked = tier.dependsOn.find(parentId => !engine.isUnlocked(parentId));
    if (blocked) {
      return `Learn ${skillLabel(blocked)} before using ${skillLabel(skillId)}.`;
    }
  }

  return `Unlock ${skillLabel(skillId)} in the Skills tab first.`;
}

function findTechniqueToolsForInput(inputId: string): string[] {
  const { data } = getCtx();
  const index = data.transitionIndex;
  if (!index) return [];

  const tools: string[] = [];
  for (const [toolId, byInput] of Object.entries(index.byTechnique)) {
    if (byInput[inputId]) tools.push(toolId);
  }
  return tools;
}

function findUnlockedAlternateTool(inputId: string, activeSkillId: string): string | null {
  const engine = getProgressionEngine(getCtx().data);
  if (!engine) return null;

  return findTechniqueToolsForInput(inputId).find(toolId => {
    if (toolId === activeSkillId) return false;
    return engine.isUnlocked(toolId) || engine.isActionMode(toolId);
  }) ?? null;
}

function findCombinePartners(itemId: string, excludePartnerId?: string): Array<{ partnerId: string; resultId: string }> {
  const { data } = getCtx();
  const partners: Array<{ partnerId: string; resultId: string }> = [];

  for (const transition of data.transitionIndex?.combineTransitions ?? []) {
    if (!transition.inputs.includes(itemId)) continue;
    for (const partnerId of transition.inputs) {
      if (partnerId === itemId || partnerId === excludePartnerId) continue;
      partners.push({ partnerId, resultId: transition.resultItemId });
    }
  }

  return partners;
}

function pickCombinePartnerHint(itemId: string): string | null {
  const partners = findCombinePartners(itemId);
  if (partners.length === 0) return null;

  const discoveredPartner = partners.find(entry => isDiscovered(entry.partnerId));
  if (discoveredPartner) {
    return `Try Combine with ${itemLabel(discoveredPartner.partnerId)}.`;
  }

  const hiddenPartner = partners[0];
  return `You'll need ${itemLabel(hiddenPartner.partnerId)} — separate primals or check the Progress Map.`;
}

function separationExhaustedHint(inputId: string): string {
  if (isPrimal(inputId)) {
    return `You've found every variety from ${itemLabel(inputId)}. Try another primal or use Force/Combine.`;
  }
  return `${itemLabel(inputId)} has no more secrets with this technique. Try Combine or a different method.`;
}

export function getTechniqueFailureHint(
  inputId: string,
  activeSkillId: string,
  matchResult: MatchRecipeResult,
  options: { separationExhausted?: boolean } = {}
): string | null {
  if (options.separationExhausted) {
    return separationExhaustedHint(inputId);
  }

  if (matchResult.lockedSkillId) {
    return lockedSkillHint(matchResult.lockedSkillId);
  }

  if (isPrimal(inputId) && activeSkillId !== "separate") {
    const separateTools = findTechniqueToolsForInput(inputId).filter(tool => (
      tool === "separate" || tool === "peel" || tool === "tear"
    ));
    if (separateTools.length > 0) {
      return `Start with Separate — break ${itemLabel(inputId)} into raw ingredients.`;
    }
  }

  const alternateTool = findUnlockedAlternateTool(inputId, activeSkillId);
  if (alternateTool) {
    const method = methodLabelForSkill(alternateTool);
    if (method && method !== methodLabelForSkill(activeSkillId)) {
      return `Switch to ${method}, then try ${skillLabel(alternateTool)} on this.`;
    }
    return `Try ${skillLabel(alternateTool)} on ${itemLabel(inputId)} instead.`;
  }

  const combineHint = pickCombinePartnerHint(inputId);
  if (combineHint) return combineHint;

  if (isPrimal(inputId)) {
    return `Use Separate on ${itemLabel(inputId)} to reveal what's inside.`;
  }

  return `Nothing happens — open the Progress Map or Recipe Book for ideas.`;
}

export function getCombineFailureHint(id1: string, id2: string): string | null {
  const { data } = getCtx();
  const { state } = getCtx();

  if (state.activeAction !== "combine") {
    return "Select Combine on the action bar, then drag one ingredient onto another.";
  }

  const direct = data.combinationEngine?.matchCombinationRecipe([id1, id2]);
  if (direct?.success) return null;

  const partners1 = findCombinePartners(id1, id2);
  const partners2 = findCombinePartners(id2, id1);

  const suggested = partners1.find(entry => isDiscovered(entry.partnerId))
    ?? partners2.find(entry => isDiscovered(entry.partnerId));

  if (suggested) {
    return `${itemLabel(id1)} and ${itemLabel(id2)} don't mix. Try ${itemLabel(suggested.partnerId)} instead.`;
  }

  if (partners1[0]) {
    return `Try pairing ${itemLabel(id1)} with ${itemLabel(partners1[0].partnerId)}.`;
  }

  if (partners2[0]) {
    return `Try pairing ${itemLabel(id2)} with ${itemLabel(partners2[0].partnerId)}.`;
  }

  return "Those ingredients don't combine — prepare them with Separate or Force first.";
}

export function getToolbarFailureHint(): string | null {
  const { state, data } = getCtx();
  const engine = getProgressionEngine(data);
  if (!engine || state.activeElements.length === 0) return null;

  if (state.activeAction === "combine") {
    const ids: string[] = [];
    for (const el of state.activeElements) {
      const id = el.dataset.id;
      if (id) ids.push(id);
    }
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const match = data.combinationEngine?.matchCombinationRecipe([ids[i], ids[j]]);
        if (match?.success) {
          return `Drag ${itemLabel(ids[i])} onto ${itemLabel(ids[j])} to combine them.`;
        }
      }
    }
    return getCombineFailureHint(ids[0], ids[1] ?? ids[0])
      ?? "Pick two ingredients that share a recipe — check the Progress Map.";
  }

  if (state.activeAction === "separate") {
    const primal = state.activeElements.find(el => isPrimal(el.dataset.id!));
    if (primal) {
      return `Click Separate on ${itemLabel(primal.dataset.id!)} to pull out a raw ingredient.`;
    }
    return "Separate works on primal pantry items like Berries or Tubers.";
  }

  if (isTechniqueCategory(state.activeAction) && state.activeSkillId) {
    const skillId = state.activeSkillId;
    for (const el of state.activeElements) {
      const inputId = el.dataset.id!;
      const match = data.combinationEngine?.matchToolRecipe(
        inputId,
        skillId,
        engine,
        { discoveredIds: state.discoveredIds }
      );
      if (match?.success) {
        return `Click ${skillLabel(skillId)} on the highlighted ingredient.`;
      }
    }

    for (const el of state.activeElements) {
      const hint = getTechniqueFailureHint(el.dataset.id!, skillId, { success: false });
      if (hint) return hint;
    }
  }

  return "Try a different action or ingredient from the pantry.";
}
