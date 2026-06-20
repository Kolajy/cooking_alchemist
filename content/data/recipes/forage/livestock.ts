import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";
import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";
import type { IngredientItem } from "../../../types";

const recipe = createPrimalSeparation(
  "livestock",
  ["cow", "pig", "chicken", "duck"],
  "You led one animal out of the herd.",
  "Herds gather together — separate them to milk, shear, or butcher each animal."
);

const herdGroup = buildSeparationGroup(recipe, [
  {
    id: "cow",
    name: "Cow",
    emoji: "🐄",
    category: "Forage",
    description: "A domestic dairy cow, yielding beef and fresh milk.",
    blurb: "Cows graze peacefully, converting grasses into fat-rich milk and beef."
  },
  {
    id: "pig",
    name: "Pig",
    emoji: "🐖",
    category: "Forage",
    description: "A sturdy domestic pig, yielding pork.",
    blurb: "Pigs forage for roots and nuts, producing sweet, fatty pork."
  },
  {
    id: "chicken",
    name: "Chicken",
    emoji: "🐓",
    category: "Forage",
    description: "A domestic chicken, laying eggs and providing tender meat.",
    blurb: "Chickens scratch the soil for seeds and shoots, laying fresh eggs daily."
  },
  {
    id: "duck",
    name: "Duck",
    emoji: "🦆",
    category: "Forage",
    description: "A domestic duck, providing rich meat and eggs.",
    blurb: "Ducks float on rivers, feeding on wild grasses and shoots."
  }
]);

const beef = buildTechniqueItem(
  {
    id: "beef",
    name: "Beef",
    emoji: "🥩",
    category: "Proteins",
    description: "Raw beef meat.",
    blurb: "Rich red meat from domestic cattle."
  },
  createTechniqueTransition("cow", "separate", ["beef", "milk"], {
    description: "You obtained fresh beef and a pail of milk from the cow.",
    tip: "Separate the cow to obtain both beef and milk."
  })
);

const milk: Record<string, IngredientItem> = {
  milk: {
    id: "milk",
    name: "Milk",
    emoji: "🥛",
    type: "ingredient",
    origin: "raw",
    category: "Liquids",
    description: "Fresh animal milk.",
    blurb: "Sweet, nutrient-rich dairy liquid.",
    recipes: [] // resolved via cow -> beef & milk transition
  }
};

const pork = buildTechniqueItem(
  {
    id: "pork",
    name: "Pork",
    emoji: "🥩",
    category: "Proteins",
    description: "Raw pork meat.",
    blurb: "Sweet, fatty meat from domestic swine."
  },
  createTechniqueTransition("pig", "separate", "pork", {
    description: "You obtained pork from the pig.",
    tip: "Separate the pig to obtain pork."
  })
);

const chickenMeat = buildTechniqueItem(
  {
    id: "chicken",
    name: "Chicken",
    emoji: "🍗",
    category: "Proteins",
    description: "Raw chicken meat.",
    blurb: "Tender, lean poultry meat."
  },
  createTechniqueTransition("chicken", "separate", ["chicken", "egg"], {
    description: "You obtained chicken meat and a fresh egg.",
    tip: "Separate the chicken to obtain meat and an egg."
  })
);

const egg: Record<string, IngredientItem> = {
  egg: {
    id: "egg",
    name: "Egg",
    emoji: "🥚",
    type: "ingredient",
    origin: "raw",
    category: "Proteins",
    description: "Fresh whole egg.",
    blurb: "Versatile binding and structure element in baking.",
    recipes: []
  }
};

const duckMeat = buildTechniqueItem(
  {
    id: "duck",
    name: "Duck",
    emoji: "🦆",
    category: "Proteins",
    description: "Raw duck meat.",
    blurb: "Rich, dark poultry meat."
  },
  createTechniqueTransition("duck", "separate", ["duck", "egg"], {
    description: "You obtained duck meat and a fresh egg.",
    tip: "Separate the duck to obtain meat and an egg."
  })
);

export default {
  ...herdGroup,
  ...beef,
  ...milk,
  ...pork,
  ...chickenMeat,
  ...egg,
  ...duckMeat
};
