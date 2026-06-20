/**
 * Transition index — unified lookup for technique → input → output chains.
 */

import type {
  CombineRecipe,
  CombineTransition,
  DiscoverableMap,
  GraphEdge,
  IngredientItem,
  RecipeDefinition,
  TechniqueRecipe,
  TechniqueTransition,
  TransitionIndex
} from "../../types";

function recipeTools(recipe: TechniqueRecipe): string[] {
  if (Array.isArray(recipe.tools) && recipe.tools.length > 0) return recipe.tools;
  if (recipe.tool) return [recipe.tool];
  return [];
}

function combineKey(inputIds: string[]): string {
  return [...inputIds].sort().join(",");
}

/** Build flat transitions + lookup indexes from discoverable items. */
export function buildTransitionIndex(discoverableItems: DiscoverableMap): TransitionIndex {
  const techniqueTransitions: TechniqueTransition[] = [];
  const combineTransitions: CombineTransition[] = [];
  const byTechnique: Record<string, Record<string, TechniqueTransition>> = {};
  const byCombine: Record<string, CombineTransition> = {};
  const affectableByTechnique: Record<string, string[]> = {};

  function registerTechnique(
    tool: string,
    inputId: string,
    transition: TechniqueTransition
  ): void {
    if (!byTechnique[tool]) byTechnique[tool] = {};
    if (!affectableByTechnique[tool]) affectableByTechnique[tool] = [];
    byTechnique[tool][inputId] = transition;
    if (!affectableByTechnique[tool].includes(inputId)) {
      affectableByTechnique[tool].push(inputId);
      affectableByTechnique[tool].sort();
    }
  }

  Object.entries(discoverableItems || {}).forEach(([resultItemId, item]) => {
    const recipes = Array.isArray(item?.recipes) ? item.recipes : [];

    recipes.forEach((recipe: RecipeDefinition, recipeIndex: number) => {
      if ("input" in recipe && recipe.input) {
        const tools = recipeTools(recipe);
        const outputs = Array.isArray(recipe.outputs) && recipe.outputs.length > 0
          ? [...recipe.outputs]
          : [resultItemId];

        const transition: TechniqueTransition = {
          id: `${resultItemId}__technique__${recipeIndex}`,
          kind: "technique",
          tools,
          input: recipe.input,
          outputs,
          onePerAction: Boolean(recipe.onePerAction),
          resultItemId,
          recipe
        };

        techniqueTransitions.push(transition);
        tools.forEach(tool => registerTechnique(tool, recipe.input, transition));
      }

      if ("inputs" in recipe && Array.isArray(recipe.inputs) && recipe.inputs.length > 0) {
        const transition: CombineTransition = {
          id: `${resultItemId}__combine__${recipeIndex}`,
          kind: "combine",
          inputs: [...recipe.inputs],
          outputs: [resultItemId],
          resultItemId,
          recipe: recipe as CombineRecipe
        };

        combineTransitions.push(transition);
        byCombine[combineKey(recipe.inputs)] = transition;
      }
    });
  });

  const all = [...techniqueTransitions, ...combineTransitions];

  const graphEdges: GraphEdge[] = [];
  techniqueTransitions.forEach(transition => {
    const tool = transition.tools[0] || null;
    transition.outputs.forEach((outputId, outputIndex) => {
      graphEdges.push({
        id: `${transition.id}__${outputIndex}`,
        kind: "technique",
        inputs: [transition.input],
        output: outputId,
        tool
      });
    });
  });
  combineTransitions.forEach(transition => {
    graphEdges.push({
      id: transition.id,
      kind: "combine",
      inputs: [...transition.inputs],
      output: transition.outputs[0],
      tool: null
    });
  });

  return {
    techniqueTransitions,
    combineTransitions,
    byTechnique,
    byCombine,
    affectableByTechnique,
    all,
    graphEdges,

    getTechniqueTransition(toolId: string, inputId: string) {
      return byTechnique[toolId]?.[inputId] || null;
    },

    getCombineTransition(inputIds: string[]) {
      return byCombine[combineKey(inputIds)] || null;
    },

    getAffectableInputs(toolId: string) {
      return affectableByTechnique[toolId] ? [...affectableByTechnique[toolId]] : [];
    },

    listTechniqueTransitions(toolId: string) {
      const byInput = byTechnique[toolId];
      if (!byInput) return [];
      const seen = new Set<string>();
      return Object.values(byInput).filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
    },

    getTechniqueItemMap() {
      return { ...affectableByTechnique };
    },

    toGraphEdges(): GraphEdge[] {
      return graphEdges;
    }
  };
}
