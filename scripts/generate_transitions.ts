import starters from "../content/data/ingredients/starters";
import discoverableRecipes from "../content/data/recipes/index";
import type { IngredientItem, TechniqueRecipe } from "../web/src/types";

const discoverable = discoverableRecipes as Record<string, IngredientItem>;
const allIngredients: IngredientItem[] = [
  ...starters,
  ...Object.values(discoverable).filter(item => !starters.some(s => s.id === item.id))
];

const PRIMAL_IDS = new Set(starters.map(s => s.id));
const GRAIN_IDS = new Set(["wheat", "barley", "oats", "rice", "rye", "grasses"]);
const BERRY_IDS = new Set(["strawberry", "raspberry", "blueberry", "blackberry", "berries"]);
const LIQUID_IDS = new Set(["water", "spring_water", "mineral_water", "rainwater", "seawater"]);

function isProtein(item: IngredientItem): boolean {
  return item.category === "Proteins";
}

function isLiquid(item: IngredientItem): boolean {
  return item.category === "Liquids" || LIQUID_IDS.has(item.id);
}

function isPlant(item: IngredientItem): boolean {
  return !isProtein(item) && !isLiquid(item);
}

function hasStructureToBreak(item: IngredientItem): boolean {
  if (isLiquid(item) || PRIMAL_IDS.has(item.id)) return false;
  const softShoots = new Set(["alfalfa_sprout", "pea_shoot", "watercress"]);
  if (softShoots.has(item.id)) return false;
  const softShellfish = new Set(["oyster", "clam", "mussel"]);
  if (softShellfish.has(item.id)) return false;
  if (BERRY_IDS.has(item.id)) return true;
  if (GRAIN_IDS.has(item.id)) return true;
  if (item.category === "Pantry") return true;
  if (["Forage", "Produce"].includes(item.category || "")) return true;
  if (isProtein(item)) return ["crab", "shrimp"].includes(item.id);
  return false;
}

function canPress(item: IngredientItem): boolean {
  if (!hasStructureToBreak(item)) return false;
  const softShellfish = new Set(["oyster", "clam", "mussel"]);
  return !softShellfish.has(item.id);
}

function canPeel(item: IngredientItem): boolean {
  if (!isPlant(item)) return false;
  if (BERRY_IDS.has(item.id)) return false;
  if (GRAIN_IDS.has(item.id)) return false;
  if (item.id === "seeds" || item.category === "Pantry") return false;
  if (item.id === "mushrooms") return false;
  const mushroomIds = ["button_mushroom", "shiitake", "oyster_mushroom", "portobello", "chanterelle"];
  if (mushroomIds.includes(item.id)) return false;
  const peelablePrimals = new Set(["fruits", "roots", "tubers", "shoots"]);
  if (PRIMAL_IDS.has(item.id)) return peelablePrimals.has(item.id);
  return ["Produce", "Forage"].includes(item.category || "");
}

function canCleanDebone(item: IngredientItem): boolean {
  return isProtein(item);
}

function canGrainProcess(item: IngredientItem): boolean {
  return GRAIN_IDS.has(item.id);
}

function canTearCut(item: IngredientItem): boolean {
  if (isLiquid(item)) return false;
  if (PRIMAL_IDS.has(item.id)) return false;
  return true;
}

function canHeatFamily(_item: IngredientItem): boolean {
  return true;
}

function canPreserve(item: IngredientItem): boolean {
  if (isLiquid(item) && item.id === "water") return false;
  if (["spring_water", "mineral_water", "rainwater"].includes(item.id)) return false;
  return true;
}

interface Family {
  tools: string[];
  outputPrefix: string;
  test: (item: IngredientItem) => boolean;
  description: (item: IngredientItem) => string;
  tip: string;
}

const FAMILIES: Family[] = [
  {
    tools: ["peel", "core", "seed", "zest"],
    outputPrefix: "peeled",
    test: canPeel,
    description: item => `You stripped and trimmed the ${item.name.toLowerCase()}.`,
    tip: "Peel tough skins and remove cores before cooking."
  },
  {
    tools: ["fillet", "debone"],
    outputPrefix: "cleaned",
    test: canCleanDebone,
    description: item => `You cleaned and prepared the ${item.name.toLowerCase()}.`,
    tip: "Clean shellfish and proteins before heat."
  },
  {
    tools: ["tear", "structured_tear", "shred", "chunk", "cut", "chop", "slice", "dice", "julienne"],
    outputPrefix: "chopped",
    test: canTearCut,
    description: item => `You cut the ${item.name.toLowerCase()} into workable pieces.`,
    tip: "Cut ingredients to even size for even cooking."
  },
  {
    tools: ["smash", "pound"],
    outputPrefix: "mashed",
    test: hasStructureToBreak,
    description: item => `You smashed the ${item.name.toLowerCase()} into a rough breakdown.`,
    tip: "Break down starchy or firm ingredients with force."
  },
  {
    tools: ["press"],
    outputPrefix: "pressed",
    test: canPress,
    description: item => `You pressed the ${item.name.toLowerCase()} to extract juices or oils.`,
    tip: "Press oily seeds, nuts, and juicy produce for extraction."
  },
  {
    tools: ["grind", "mince"],
    outputPrefix: "ground",
    test: hasStructureToBreak,
    description: item => `You ground the ${item.name.toLowerCase()} into a fine texture.`,
    tip: "Grind grains, seeds, and nuts into meal or paste."
  },
  {
    tools: ["thresh"],
    outputPrefix: "threshed",
    test: canGrainProcess,
    description: item => `You threshed the ${item.name.toLowerCase()} to loosen grain from stalk.`,
    tip: "Thresh cereal heads to free kernels from chaff."
  },
  {
    tools: ["winnow"],
    outputPrefix: "winnowed",
    test: canGrainProcess,
    description: item => `You winnowed the ${item.name.toLowerCase()}, letting chaff blow away.`,
    tip: "Winnow threshed grain in a breeze to separate chaff."
  },
  {
    tools: ["hull"],
    outputPrefix: "hulled",
    test: canGrainProcess,
    description: item => `You hulled the ${item.name.toLowerCase()}, removing the tough outer bran.`,
    tip: "Hull grains to reach the starchy endosperm inside."
  },
  {
    tools: ["char", "roast"],
    outputPrefix: "charred",
    test: canHeatFamily,
    description: item => `The ${item.name.toLowerCase()} blistered and darkened over open heat.`,
    tip: "Char over flame to deepen flavor before finishing."
  },
  {
    tools: ["cook", "fry", "boil", "simmer", "bake", "precision", "sous_vide", "reduce"],
    outputPrefix: "cooked",
    test: canHeatFamily,
    description: item => `You cooked the ${item.name.toLowerCase()} through with controlled heat.`,
    tip: "Apply steady heat until the ingredient transforms."
  },
  {
    tools: ["smoke"],
    outputPrefix: "smoked",
    test: canPreserve,
    description: item => `You smoked the ${item.name.toLowerCase()} over smoldering wood.`,
    tip: "Smoke preserves and perfumes proteins and firm produce."
  },
  {
    tools: ["dry"],
    outputPrefix: "dried",
    test: canPreserve,
    description: item => `You dried the ${item.name.toLowerCase()}, driving off moisture.`,
    tip: "Dry ingredients slowly to preserve them without heat damage."
  },
  {
    tools: ["ferment"],
    outputPrefix: "fermented",
    test: canPreserve,
    description: item => `You fermented the ${item.name.toLowerCase()}, letting cultures transform it.`,
    tip: "Ferment to develop tang and preserve harvests."
  }
];

const transitions: object[] = [];
const seenToolInput = new Set<string>();

Object.entries(discoverable).forEach(([resultItemId, item]) => {
  const recipes = item.recipes || [];
  recipes.forEach((recipe, recipeIndex) => {
    if (!("input" in recipe) || !recipe.input) return;
    let tools = recipe.tools || (recipe.tool ? [recipe.tool] : []);
    const inputItem = allIngredients.find(ing => ing.id === recipe.input);
    if (inputItem && isProtein(inputItem)) {
      tools = tools.filter(tool => tool !== "peel");
    }
    const outputs = recipe.outputs?.length ? [...recipe.outputs] : [resultItemId];
    const sanitizedRecipe = { ...recipe, tools };
    transitions.push({
      id: `${resultItemId}__technique__${recipeIndex}`,
      kind: "technique",
      tools,
      input: recipe.input,
      outputs,
      onePerAction: Boolean(recipe.onePerAction),
      resultItemId,
      recipe: sanitizedRecipe
    });
    tools.forEach(tool => seenToolInput.add(`${tool}::${recipe.input}`));
  });
});

const hostRecipes = new Map<string, TechniqueRecipe[]>();

for (const item of allIngredients) {
  for (const family of FAMILIES) {
    if (!family.test(item)) continue;
    if (family.tools.some(t => seenToolInput.has(`${t}::${item.id}`))) continue;

    const outputId = `${family.outputPrefix}_${item.id}`;
    if (discoverable[outputId]?.recipes?.some(r => "input" in r && r.input === item.id)) continue;

    const recipe: TechniqueRecipe = {
      input: item.id,
      tools: [...family.tools],
      outputs: [outputId],
      onePerAction: false,
      description: family.description(item),
      tip: family.tip
    };

    if (!hostRecipes.has(outputId)) hostRecipes.set(outputId, []);
    hostRecipes.get(outputId)!.push(recipe);
  }
}

hostRecipes.forEach((recipes, resultItemId) => {
  recipes.forEach((recipe, recipeIndex) => {
    const tools = recipe.tools || [];
    transitions.push({
      id: `${resultItemId}__technique__${recipeIndex}`,
      kind: "technique",
      tools,
      input: recipe.input!,
      outputs: recipe.outputs || [resultItemId],
      onePerAction: Boolean(recipe.onePerAction),
      resultItemId,
      recipe
    });
    tools.forEach(tool => seenToolInput.add(`${tool}::${recipe.input}`));
  });
});

transitions.sort((a: { input: string; tools: string[] }, b: { input: string; tools: string[] }) => {
  const ai = a.input.localeCompare(b.input);
  if (ai !== 0) return ai;
  return (a.tools[0] || "").localeCompare(b.tools[0] || "");
});

process.stdout.write(JSON.stringify(transitions));
