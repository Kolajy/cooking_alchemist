import { getCtx } from "../context";

import {
  createParticles,
  removeCanvasElement,
  bounceElementsApart,
  spawnElementOnCanvas,
  getCanvasPosition,
  setCanvasPosition,
  clampCanvasPosition,
  updateTechniqueTargetHighlights
} from "../canvas/workspace";
import { canTechniqueAffectElement, getActiveTechniqueToolIds } from "../canvas/technique-target";
import { pushUndoEntry, clearUndoEntry } from "../feedback/undo";
import { refreshAfterGameplay } from "../ui/refresh";
import { isTechniqueCategory } from "./mode";
import { METHODS_WITH_OWN_ACTION } from "../constants";
import {
  showHintNearElement
} from "../progression/notifications";
import {
  getCombineFailureHint,
  getTechniqueFailureHint
} from "../feedback/hints";
import { setAchievementFlag } from "../progression/achievements";
import { flashWorkspace, shakeWorkspace } from "../feedback/workspace-effects";
import { playSound, playTechniqueSound } from "../feedback/sounds";
import { emitGameplayEvent } from "../events";
import { getProgressionEngine } from "../data";
import type { DiscoveryActionContext, IngredientItem, MatchRecipeResult, MatchedRecipe } from "../../types";

/** Tidy offsets (from a center point) for laying out N results in a centered grid. */
function centeredGridOffsets(count: number): Array<{ x: number; y: number }> {
  if (count <= 1) return [{ x: 0, y: 0 }];

  const colSpacing = 135;
  const rowSpacing = 64;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const totalHeight = (rows - 1) * rowSpacing;

  const offsets: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const row = Math.floor(i / cols);
    const colInRow = i % cols;
    const itemsInRow = Math.min(cols, count - row * cols);
    const rowWidth = (itemsInRow - 1) * colSpacing;
    offsets.push({
      x: colInRow * colSpacing - rowWidth / 2,
      y: row * rowSpacing - totalHeight / 2
    });
  }
  return offsets;
}

function awardTrackExp(trackId: string, amount = 1): void {
  const { data } = getCtx();
  const xpResult = data.Progression.addXP(trackId, amount);
  emitGameplayEvent("xp", {
    trackId,
    amount,
    leveledUp: xpResult.leveledUp,
    newlyUnlockedSkills: xpResult.newlyUnlockedSkills
  });
}

function resolveToolOutputResults(foundRecipe: MatchedRecipe | null | undefined, discoveredIds: Set<string>) {
  const { data } = getCtx();
  if (!foundRecipe) return [];

  const rawResults = (foundRecipe.results?.length
    ? foundRecipe.results
    : [foundRecipe.result]).filter(result => result?.id);

  if (!foundRecipe.onePerAction) return rawResults;

  const outputIds = Array.isArray(foundRecipe.outputs) && foundRecipe.outputs.length > 0
    ? foundRecipe.outputs
    : rawResults.map(result => result.id);

  const nextId = outputIds.find(id => !discoveredIds.has(id));
  if (!nextId) return [];

  const matched = rawResults.find(result => result.id === nextId);
  if (matched) return [matched];

  const item = data.DISCOVERABLE_ITEMS[nextId];
  return item ? [{ id: nextId, ...item }] : [];
}

function finalizeNewDiscovery(
  recipe: MatchedRecipe,
  discoveredResults: IngredientItem[] = [],
  actionContext: DiscoveryActionContext | null = null
): void {
  const discoveredIds = discoveredResults.map(result => result.id).filter(Boolean);
  emitGameplayEvent("discovery", {
    recipe,
    discoveredResults,
    actionContext,
    discoveredIds
  });
}

function applyToolToElements(toolIds: string[], skillId: string | null): boolean {
  const { state } = getCtx();
  const elements = state.activeElements.filter(el => canTechniqueAffectElement(el, toolIds));
  let applied = false;
  elements.forEach(el => {
    if (applyToolToElement(el, skillId)) applied = true;
  });
  return applied;
}

export function applyActionToCanvas(): boolean | null {
  const { state } = getCtx();
  if (state.activeElements.length === 0) return null;

  if (state.activeAction === "combine") return applyCombineToCanvas();
  
  if (METHODS_WITH_OWN_ACTION.has(state.activeAction) || isTechniqueCategory(state.activeAction)) {
    const toolIds = getActiveTechniqueToolIds();
    const skillId = state.activeSkillId || state.activeAction;
    return applyToolToElements(toolIds, skillId);
  }

  return false;
}

export function applyCombineToCanvas(): boolean {
  const { state, data } = getCtx();
  let applied = false;
  let combined = true;

  while (combined) {
    combined = false;
    const elements = [...state.activeElements];
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const el1 = elements[i];
        const el2 = elements[j];
        if (!state.activeElements.includes(el1) || !state.activeElements.includes(el2)) continue;

        const match = data.combinationEngine!.matchCombinationRecipe([
          el1.dataset.id!,
          el2.dataset.id!
        ]);
        if (match.success && combineElements(el1, el2, match)) {
          applied = true;
          combined = true;
          break;
        }
      }
      if (combined) break;
    }
  }
  return applied;
}

export function combineElements(
  el1: HTMLElement,
  el2: HTMLElement,
  matchResult?: MatchRecipeResult
): boolean {
  const { state, dom, data } = getCtx();
  const id1 = el1.dataset.id!;
  const id2 = el2.dataset.id!;

  const match = matchResult?.success
    ? matchResult
    : data.combinationEngine!.matchCombinationRecipe([id1, id2]);
  const foundRecipe = match.success ? match.recipe : null;
  const foundResultId = foundRecipe?.result.id;

  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  const workspaceRect = dom.workspace!.getBoundingClientRect();

  const mergeX = ((rect1.left + rect2.left) / 2) - workspaceRect.left + (rect1.width / 2);
  const mergeY = ((rect1.top + rect2.top) / 2) - workspaceRect.top + (rect1.height / 2);

  if (foundRecipe && foundResultId) {
    const isNew = !state.discoveredIds.has(foundResultId);
    const pos1 = getCanvasPosition(el1);
    const pos2 = getCanvasPosition(el2);

    if (!isNew) {
      pushUndoEntry({
        type: "combine",
        item1Id: id1,
        x1: pos1.x,
        y1: pos1.y,
        item2Id: id2,
        x2: pos2.x,
        y2: pos2.y,
        outputs: [{ itemId: foundResultId, x: mergeX - 50, y: mergeY - 15 }]
      });
      removeCanvasElement(el1);
      removeCanvasElement(el2);
    }

    createParticles(mergeX, mergeY, 15, "success");
    createParticles(mergeX, mergeY, 8, "steam");
    awardTrackExp("combine", foundRecipe.xpAwarded || 1);

    if (isNew) {
      // A new discovery goes to the cabinet + popup, not the counter — consume the inputs.
      removeCanvasElement(el1);
      removeCanvasElement(el2);
      clearUndoEntry();
      awardTrackExp("separate", 1);
      state.discoveredIds.add(foundResultId);
      finalizeNewDiscovery(foundRecipe, [foundRecipe.result], {
        trackId: "combine",
        expAwarded: foundRecipe.xpAwarded || 1
      });
    } else {
      spawnElementOnCanvas(foundRecipe.result, mergeX - 50, mergeY - 15, { animate: true });
      refreshAfterGameplay();
    }

    flashWorkspace(dom.workspace!, true);
    setAchievementFlag("combine_success");
    playSound("combine");
    if (!isNew) playSound("success");
    return true;
  }

  createParticles(mergeX, mergeY, 6, "fail");
  bounceElementsApart(el1, el2);
  shakeWorkspace(dom.workspace!);
  flashWorkspace(dom.workspace!, false);
  playSound("fail");
  const hint = getCombineFailureHint(id1, id2);
  if (hint) {
    showHintNearElement(el1, hint);
  }
  return false;
}

export function applyToolToElement(el: HTMLElement, skillIdOverride: string | null = null): boolean {
  const { state, dom, data } = getCtx();
  const skillId = skillIdOverride || state.activeSkillId || state.activeAction;
  const inputId = el.dataset.id!;
  const progressionEngine = getProgressionEngine(data);
  const matchResult = progressionEngine
    ? data.combinationEngine!.matchToolRecipe(inputId, skillId!, progressionEngine, {
      discoveredIds: state.discoveredIds
    })
    : { success: false, lockedSkillId: null };
  const foundRecipe = matchResult.success ? matchResult.recipe : null;
  const outputResults = resolveToolOutputResults(foundRecipe, state.discoveredIds);
  const newResults = outputResults.filter(result => !state.discoveredIds.has(result.id));

  const rect = el.getBoundingClientRect();
  const workspaceRect = dom.workspace!.getBoundingClientRect();
  const spawnX = rect.left - workspaceRect.left;
  const spawnY = rect.top - workspaceRect.top;
  const midX = spawnX + rect.width / 2;
  const midY = spawnY + rect.height / 2;

  if (foundRecipe && outputResults.length === 0) {
    const hint = getTechniqueFailureHint(inputId, skillId!, matchResult, { separationExhausted: true });
    if (matchResult.lockedSkillId) {
      showHintNearElement(el, hint ?? `Requires Unlocking: ${matchResult.requiredSkillName}!`);
    } else if (hint) {
      showHintNearElement(el, hint);
    } else {
      el.classList.add("wobble-anim");
      createParticles(midX, midY, 5, "fail");
      setTimeout(() => el.classList.remove("wobble-anim"), 500);
    }
    flashWorkspace(dom.workspace!, false);
    playSound(matchResult.lockedSkillId ? "ui_locked" : "fail_soft");
    return false;
  }

  if (foundRecipe) {
    const particleType = ["tear", "peel", "smash", "separate"].includes(state.activeAction)
      ? "steam"
      : "success";
    createParticles(midX, midY, 15, particleType);

    // Lay results out in a tidy grid centered on where the action happened,
    // clamped to the counter so nothing lands in an unreadable spot.
    const spawnOutputs = (): Array<{ itemId: string; x: number; y: number }> => {
      const offsets = centeredGridOffsets(outputResults.length);
      return outputResults.map((result, index) => {
        const offset = offsets[index] || { x: 0, y: 0 };
        const el = spawnElementOnCanvas(result, midX, midY, { animate: true });
        const desiredX = midX + offset.x - el.offsetWidth / 2;
        const desiredY = midY + offset.y - el.offsetHeight / 2;
        const pos = clampCanvasPosition(el, desiredX, desiredY);
        setCanvasPosition(el, pos.x, pos.y);
        return { itemId: result.id, x: pos.x, y: pos.y };
      });
    };

    if (newResults.length > 0) {
      // 1 exp per new discovery for the skill used (e.g. each new berry separated).
      const gained = newResults.length;
      const skillTrack = foundRecipe.tool || skillId || state.activeAction;
      newResults.forEach(result => {
        awardTrackExp(skillTrack, 1);
        // Credit the base "separate" prep track too — unless the skill already is "separate".
        if (skillTrack !== "separate") awardTrackExp("separate", 1);
        state.discoveredIds.add(result.id);
      });
      // A new discovery goes to the cabinet + popup, not the counter. Repeatable sources
      // (e.g. separating a category) keep their input; one-shot techniques consume it.
      if (!foundRecipe.onePerAction) {
        removeCanvasElement(el);
        clearUndoEntry();
      }
      finalizeNewDiscovery({
        ...foundRecipe,
        result: outputResults[0],
        results: outputResults
      }, newResults, {
        trackId: skillTrack,
        expAwarded: gained
      });
    } else {
      const origin = el.dataset.origin;
      removeCanvasElement(el);
      if (foundRecipe.tool) awardTrackExp(foundRecipe.tool, 1);
      const outputPositions = spawnOutputs();

      pushUndoEntry({
        type: "technique",
        inputId,
        x: spawnX,
        y: spawnY,
        origin,
        consumedInput: true,
        outputs: outputPositions
      });

      refreshAfterGameplay();
    }

    flashWorkspace(dom.workspace!, true);
    updateTechniqueTargetHighlights();
    playTechniqueSound(skillId, state.activeAction);
    if (newResults.length === 0) playSound("success");
    return true;
  }

  if (matchResult.lockedSkillId) {
    const hint = getTechniqueFailureHint(inputId, skillId!, matchResult);
    showHintNearElement(el, hint ?? `Requires Unlocking: ${matchResult.requiredSkillName}!`);
    playSound("ui_locked");
  } else {
    const hint = getTechniqueFailureHint(inputId, skillId!, matchResult);
    if (hint) showHintNearElement(el, hint);
  }

  el.classList.add("wobble-anim");
  createParticles(midX, midY, 5, "fail");
  setTimeout(() => el.classList.remove("wobble-anim"), 500);
  shakeWorkspace(dom.workspace!);
  flashWorkspace(dom.workspace!, false);
  playSound("fail");
  return false;
}
