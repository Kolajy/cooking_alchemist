import { buildCombineItem, createCombineTransition } from "../_techniqueRecipe";
import { buildFinalizedRecipeItem } from "../_finalizedRecipe";

const sproutedSeeds = buildCombineItem(
  {
    id: "sprouted_seeds",
    name: "Sprouted Seeds",
    emoji: "🌱",
    type: "ingredient",
    origin: "processed",
    category: "Pantry",
    description: "Seeds soaked in water until tiny shoots emerge.",
    blurb: "Sprouting wakes dormant enzymes — a gentle first step toward porridge and tonics."
  },
  createCombineTransition(["seeds", "water"], {
    description: "The seeds swelled and split, sending out pale shoots.",
    tip: "Soak seeds in fresh water to coax them into sprouting."
  })
);

const berryBrew = buildFinalizedRecipeItem(
  {
    id: "berry_brew",
    name: "Berry Brew",
    emoji: "🍵",
    category: "Produce",
    description: "A warm infusion of crushed berries and spring water.",
    blurb: "Hearth cooks steeped wild fruit in hot water long before tea leaves crossed the mountains."
  },
  [createCombineTransition(["strawberry", "spring_water"], {
    description: "Berries and spring water mingled into a fragrant brew.",
    tip: "Combine ripe berries with clean spring water for a simple restorative drink."
  })]
);

const seedTonic = buildFinalizedRecipeItem(
  {
    id: "seed_tonic",
    name: "Seed Tonic",
    emoji: "🥛",
    category: "Pantry",
    description: "A milky, nourishing drink from sprouted seeds and water.",
    blurb: "Travelers carried soaked seed tonics when fresh bread was days away."
  },
  [createCombineTransition(["sprouted_seeds", "spring_water"], {
    description: "Sprouted seeds broke down into a mellow, drinkable tonic.",
    tip: "Blend sprouted seeds with spring water for a filling camp drink."
  })]
);

const hearthMash = buildFinalizedRecipeItem(
  {
    id: "hearth_mash",
    name: "Hearth Mash",
    emoji: "🔥",
    category: "Forage",
    description: "Charred fruit folded into creamy mashed potato.",
    blurb: "Sweet and smoke over starch — a rustic plate born at the edge of the fire."
  },
  [createCombineTransition(["mashed_potato", "charred_apple"], {
    description: "Mash and charred fruit came together into a smoky-sweet hearth dish.",
    tip: "Fold charred fruit into mash for a finished fireside plate."
  })]
);

const carrotBroth = buildFinalizedRecipeItem(
  {
    id: "carrot_broth",
    name: "Carrot Broth",
    emoji: "🥕",
    category: "Forage",
    description: "A golden broth steeped from carrot and spring water.",
    blurb: "Simple root broths sustained field workers before stock pots became kitchen fixtures."
  },
  [createCombineTransition(["carrot", "spring_water"], {
    description: "Carrot and water simmered into a clear, sweet broth.",
    tip: "Steep a root vegetable in spring water for a quick broth."
  })]
);

const tuberStew = buildFinalizedRecipeItem(
  {
    id: "tuber_stew",
    name: "Tuber Stew",
    emoji: "🍲",
    category: "Forage",
    description: "Hearty mash thinned with spring water into a warming stew.",
    blurb: "Stretching mash with water was the oldest trick for feeding one more mouth at the table."
  },
  [createCombineTransition(["mashed_potato", "spring_water"], {
    description: "Mash and water loosened into a simple, filling stew.",
    tip: "Thin mashed tubers with spring water for a quick stew."
  })]
);

export default {
  ...sproutedSeeds,
  ...berryBrew,
  ...seedTonic,
  ...hearthMash,
  ...carrotBroth,
  ...tuberStew
};
