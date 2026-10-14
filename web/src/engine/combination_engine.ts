/**
 * Culinary Alchemy - Combination Engine (Pure Logic)
 * Decoupled from DOM, CSS, and UI interactions.
 */

import type {
  DiscoverableMap,
  IngredientItem,
  MatchRecipeResult,
  RecipeDefinition,
  TransitionIndex
} from "../types";
import type { ProgressionEngine } from "./progression_engine";

export class CombinationEngine {
  items: DiscoverableMap;
  transitionIndex: TransitionIndex;

  constructor(discoverableItems: DiscoverableMap, transitionIndex: TransitionIndex) {
    this.items = discoverableItems;
    this.transitionIndex = transitionIndex;
  }

  _getToolsForRecipe(recipe: RecipeDefinition): string[] {
    if ("tools" in recipe && Array.isArray(recipe.tools) && recipe.tools.length > 0) {
      return recipe.tools;
    }
    if ("tool" in recipe && recipe.tool) return [recipe.tool];
    return [];
  }

  _findTechniqueTransition(inputId: string, availableActions: string[]) {
    for (const actionId of availableActions) {
      const transition = this.transitionIndex.getTechniqueTransition(actionId, inputId);
      if (transition) return transition;
    }
    return null;
  }

  _findLockedTechniqueHint(
    inputId: string,
    skill: { category: string },
    progressionEngine: ProgressionEngine
  ) {
    const skillCategory = skill.category;
    for (const toolId of Object.keys(this.transitionIndex.byTechnique)) {
      const transition = this.transitionIndex.byTechnique[toolId]?.[inputId];
      if (!transition) continue;

      const tools = this._getToolsForRecipe(transition.recipe);
      const lockedTool = tools.find(tool => {
        return progressionEngine.getToolCategory(tool) === skillCategory
          && !progressionEngine.isUnlocked(tool);
      });

      if (lockedTool) {
        return {
          lockedSkillId: lockedTool,
          requiredSkillName: progressionEngine.tiers[lockedTool]?.name
        };
      }
    }

    return null;
  }

  matchToolRecipe(
    inputId: string,
    activeSkillId: string,
    progressionEngine: ProgressionEngine,
    options: { discoveredIds?: Set<string> } = {}
  ): MatchRecipeResult {
    const discoveredIds = options.discoveredIds || new Set<string>();

    let allowedTools: string[] = [];
    const isActionMode = progressionEngine.isActionMode(activeSkillId);

    if (isActionMode) {
      const actionCfg = progressionEngine.config.playerActions[activeSkillId];
      if (actionCfg) {
        if (actionCfg.mode) {
          allowedTools.push(actionCfg.mode);
        }
        if (Array.isArray(actionCfg.categories)) {
          actionCfg.categories.forEach(category => {
            const categoryCfg = progressionEngine.config.techniqueCategories[category];
            if (categoryCfg && categoryCfg.techniques) {
              allowedTools.push(...Object.keys(categoryCfg.techniques));
            }
          });
        }
      }
    } else {
      allowedTools = [activeSkillId];
    }

    if (allowedTools.length === 0) {
      return { success: false, lockedSkillId: null };
    }

    const buildToolRecipeResult = (
      itemId: string,
      item: IngredientItem,
      recipe: RecipeDefinition,
      toolId: string
    ): MatchRecipeResult | null => {
      if (!("input" in recipe)) return null;

      let outputIds = Array.isArray(recipe.outputs) && recipe.outputs.length > 0
        ? [...recipe.outputs]
        : [itemId];

      if (recipe.onePerAction && outputIds.length > 1) {
        const undiscovered = outputIds.filter(id => !discoveredIds.has(id));
        if (undiscovered.length === 0) return null;
        outputIds = [undiscovered[0]];
      }

      const results = outputIds
        .filter(id => this.items[id])
        .map(id => ({ id, ...this.items[id] }));

      if (results.length === 0) return null;

      const primary = results[0];

      return {
        success: true,
        recipe: {
          ...recipe,
          tool: toolId,
          result: primary,
          results,
          outputs: recipe.onePerAction ? results.map(result => result.id) : recipe.outputs,
          xpCategory: item.xpCategory,
          xpAwarded: item.xpAwarded,
          description: primary.description || recipe.description || item.description,
          tip: primary.tip || recipe.tip || item.tip,
          blurb: primary.blurb || recipe.blurb || item.blurb
        }
      };
    };

    const getDiscoveryCount = () => {
      let count = 0;
      discoveredIds.forEach(id => {
        if (this.items[id]?.type === "recipe") count++;
      });
      return count;
    };

    const isActionUnlocked = (actionId: string) => {
      const cfg = progressionEngine.config.playerActions[actionId];
      if (!cfg) {
        // Performance optimization: Avoid intermediate O(N) array allocation from Object.values
        // to reduce GC pressure since this runs frequently.
        let actionByKey: (typeof progressionEngine.config.playerActions)[string] | undefined;
        for (const key in progressionEngine.config.playerActions) {
          if (progressionEngine.config.playerActions[key].mode === actionId) {
            actionByKey = progressionEngine.config.playerActions[key];
            break;
          }
        }
        if (!actionByKey) return true;
        if (!actionByKey.unlockCriteria) return true;
        return getDiscoveryCount() >= actionByKey.unlockCriteria.discoveredRecipes;
      }
      if (!cfg.unlockCriteria) return true;
      return getDiscoveryCount() >= cfg.unlockCriteria.discoveredRecipes;
    };

    let bestTransition: any = null;
    let lockedTransition: any = null;

    for (const toolId of allowedTools) {
      const transition = this.transitionIndex.getTechniqueTransition(toolId, inputId);
      if (transition) {
        // Performance optimization: Avoid intermediate O(N) array allocation from Object.values
        // to reduce GC pressure since this runs frequently.
        let isAction = toolId in progressionEngine.config.playerActions;
        if (!isAction) {
          for (const key in progressionEngine.config.playerActions) {
            if (progressionEngine.config.playerActions[key].mode === toolId) {
              isAction = true;
              break;
            }
          }
        }
        const unlocked = isAction ? isActionUnlocked(toolId) : progressionEngine.isUnlocked(toolId);
        if (unlocked) {
          bestTransition = { transition, toolId };
          break;
        } else {
          if (!lockedTransition) {
            lockedTransition = { transition, toolId };
          }
        }
      }
    }

    if (bestTransition) {
      const item = this.items[bestTransition.transition.resultItemId];
      if (item) {
        const match = buildToolRecipeResult(
          bestTransition.transition.resultItemId,
          item,
          bestTransition.transition.recipe,
          bestTransition.toolId
        );
        if (match) return match;
      }
    }

    if (lockedTransition) {
      const skill = progressionEngine.tiers[lockedTransition.toolId];
      // Performance optimization: Perform O(1) dictionary lookup first.
      let action = progressionEngine.config.playerActions[lockedTransition.toolId];
      if (!action) {
        // Fallback: Avoid intermediate O(N) array allocation from Object.values
        // to reduce GC pressure since this runs frequently.
        for (const key in progressionEngine.config.playerActions) {
          if (progressionEngine.config.playerActions[key].mode === lockedTransition.toolId) {
            action = progressionEngine.config.playerActions[key];
            break;
          }
        }
      }
      return {
        success: false,
        lockedSkillId: lockedTransition.toolId,
        requiredSkillName: skill ? skill.name : (action ? action.name : lockedTransition.toolId)
      };
    }

    if (!isActionMode) {
      const skill = progressionEngine.tiers[activeSkillId];
      if (skill) {
        const lockedHint = this._findLockedTechniqueHint(inputId, skill, progressionEngine);
        if (lockedHint) {
          return { success: false, ...lockedHint };
        }
      }
    }

    return { success: false, lockedSkillId: null };
  }

  matchCombinationRecipe(inputIds: string[]): MatchRecipeResult {
    const transition = this.transitionIndex.getCombineTransition(inputIds);
    if (!transition) return { success: false };

    const item = this.items[transition.resultItemId];
    if (!item) return { success: false };

    const recipe = transition.recipe;
    return {
      success: true,
      recipe: {
        ...recipe,
        result: { id: transition.resultItemId, ...item },
        xpCategory: item.xpCategory,
        xpAwarded: item.xpAwarded,
        description: item.description,
        tip: item.tip
      }
    };
  }
}

globalThis.CombinationEngine = CombinationEngine;
