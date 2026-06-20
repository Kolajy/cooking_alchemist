import { buildFinalizedRecipeItem } from "../recipes/_finalizedRecipe";
import { buildSeparationGroup, createPrimalSeparation } from "../recipes/_separationRecipe";
import {
  buildCombineItem,
  buildTechniqueItem,
  createCombineTransition,
  createTechniqueTransition
} from "../recipes/_techniqueRecipe";
import type { DiscoverableMap, IngredientItem } from "../../types";
import type {
  CombineStepSpec,
  CulturalPack,
  CulturalPackMeta,
  CulturalPrimitiveSpec,
  TechniqueStepSpec
} from "./types";

function buildPrimitive(spec: CulturalPrimitiveSpec): {
  primitive: IngredientItem;
  separations: DiscoverableMap;
} {
  const recipe = createPrimalSeparation(
    spec.id,
    spec.separations.map(item => item.id),
    spec.separationDescription,
    spec.separationTip
  );

  const separations = buildSeparationGroup(
    recipe,
    spec.separations.map(item => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      description: item.description,
      blurb: item.blurb
    }))
  );

  const primitive: IngredientItem = {
    id: spec.id,
    name: spec.name,
    emoji: spec.emoji,
    type: "ingredient",
    origin: "primitive",
    category: spec.category,
    description: spec.description,
    blurb: spec.blurb
  };

  return { primitive, separations };
}

function buildTechniques(steps: TechniqueStepSpec[]): DiscoverableMap {
  return steps.reduce<DiscoverableMap>((map, step) => {
    const recipe = createTechniqueTransition(
      step.input,
      step.tools,
      [step.id],
      {
        description: step.transitionDescription,
        tip: step.transitionTip,
        blurb: step.blurb
      }
    );

    return {
      ...map,
      ...buildTechniqueItem(
        {
          id: step.id,
          name: step.name,
          emoji: step.emoji,
          category: step.category,
          description: step.description,
          blurb: step.blurb
        },
        recipe
      )
    };
  }, {});
}

function buildCombines(steps: CombineStepSpec[]): DiscoverableMap {
  return steps.reduce<DiscoverableMap>((map, step) => {
    const item = {
      id: step.id,
      name: step.name,
      emoji: step.emoji,
      category: step.category,
      description: step.description,
      blurb: step.blurb
    };

    const recipe = createCombineTransition(step.inputs, {
      description: step.transitionDescription,
      tip: step.transitionTip,
      blurb: step.blurb
    });

    const built = step.finalized
      ? buildFinalizedRecipeItem(item, [recipe])
      : buildCombineItem({ ...item, type: "ingredient", origin: "processed" }, recipe);

    return { ...map, ...built };
  }, {});
}

export function buildCulturalPack(
  meta: CulturalPackMeta,
  primitive: CulturalPrimitiveSpec,
  techniques: TechniqueStepSpec[],
  combines: CombineStepSpec[]
): CulturalPack {
  const { primitive: primitiveItem, separations } = buildPrimitive(primitive);
  const techniqueItems = buildTechniques(techniques);
  const combineItems = buildCombines(combines);

  // Automatically tag all items in the pack with the pack ID
  const packId = meta.id;
  primitiveItem.pack = packId;
  Object.values(separations).forEach(item => { item.pack = packId; });
  Object.values(techniqueItems).forEach(item => { item.pack = packId; });
  Object.values(combineItems).forEach(item => { item.pack = packId; });

  return {
    meta,
    primitive,
    techniques,
    combines,
    primitives: [primitiveItem],
    discoverable: {
      ...separations,
      ...techniqueItems,
      ...combineItems
    }
  };
}

export function mergePackDiscoverable(packs: CulturalPack[]): DiscoverableMap {
  return packs.reduce<DiscoverableMap>((map, pack) => ({ ...map, ...pack.discoverable }), {});
}

export function mergePackPrimitives(packs: CulturalPack[]): IngredientItem[] {
  return packs.flatMap(pack => pack.primitives);
}
