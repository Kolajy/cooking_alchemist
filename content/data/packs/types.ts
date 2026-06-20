import type { DiscoverableMap, IngredientItem, IngredientMilestone } from "../../types";

export interface CulturalPackMeta {
  id: string;
  name: string;
  emoji: string;
  region: string;
  period: string;
  synopsis: string;
  unlockCriteria?: IngredientMilestone["recipesCount"] extends number
    ? { discoveredRecipes: number }
    : { discoveredRecipes: number };
}

export interface SeparationSpec {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  blurb: string;
}

export interface CulturalPrimitiveSpec {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  blurb: string;
  separations: SeparationSpec[];
  separationDescription: string;
  separationTip: string;
}

export interface TechniqueStepSpec {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  blurb: string;
  input: string;
  tools: string[];
  transitionDescription: string;
  transitionTip: string;
}

export interface CombineStepSpec {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  blurb: string;
  inputs: string[];
  transitionDescription: string;
  transitionTip: string;
  finalized?: boolean;
}

export interface CulturalPack {
  meta: CulturalPackMeta;
  primitive: CulturalPrimitiveSpec;
  techniques: TechniqueStepSpec[];
  combines: CombineStepSpec[];
  primitives: IngredientItem[];
  discoverable: DiscoverableMap;
}
