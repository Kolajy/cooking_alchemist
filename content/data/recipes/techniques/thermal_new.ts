import { buildTechniqueItem, createTechniqueTransition, buildCombineItem, createCombineTransition } from "../_techniqueRecipe";

const pitRoastedSweetPotato = buildTechniqueItem(
  {
    id: "pit_roasted_sweet_potato",
    name: "Pit-Roasted Sweet Potato",
    emoji: "🍠",
    category: "Forage",
    description: "Deeply caramelized sweet potato, slow-cooked in an earth oven.",
    blurb: "Slow underground roasting in a dirt pit traps moisture and caramelizes sugars, turning the tough starch into rich custard."
  },
  createTechniqueTransition("sweet_potato", ["pit_cook", "bake"], "pit_roasted_sweet_potato", {
    description: "Steam and radiant ground heat slow-caramelized the sweet potato inside the earth pit.",
    tip: "Pit-cook sweet potatoes in an Earth & Dirt Oven for ultimate tenderness."
  })
);

const smokedFish = buildTechniqueItem(
  {
    id: "smoked_fish",
    name: "Smoked Fish",
    emoji: "🐟",
    category: "Proteins",
    description: "Firm, wood-smoked fish with a deep golden color and savory profile.",
    blurb: "Smoking preserves fish while introducing phenol compounds from wood fire, creating a classic campfire delicacy."
  },
  createTechniqueTransition("cleaned_fish", "smoke", "smoked_fish", {
    description: "Aromatic hardwood smoke cured and deeply flavored the fish.",
    tip: "Cure and smoke cleaned fish using the Smoke & Cure technique."
  })
);

const earthBakedShellfish = buildTechniqueItem(
  {
    id: "earth_baked_shellfish",
    name: "Earth-Baked Shellfish",
    emoji: "🦪",
    category: "Proteins",
    description: "Sweet, ocean-fresh shellfish steamed under hot stones and damp greenery.",
    blurb: "A primitive beach pit clambake: layering shellfish with seaweed and hot rocks seals in ocean juices and steam."
  },
  createTechniqueTransition("shellfish", ["pit_cook", "bake"], "earth_baked_shellfish", {
    description: "The shellfish opened up, tenderly steamed by wet earth and stone heat.",
    tip: "Bake shellfish in a dirt fire pit to steam them naturally in their shells."
  })
);

const flour = buildTechniqueItem(
  {
    id: "flour",
    name: "Flour",
    emoji: "🌾",
    category: "Pantry",
    description: "Powdered grain, ready to be hydrated and structured.",
    blurb: "Shattering dry seeds and grains with stone tools yields flour — the starting point of civilization's baking."
  },
  createTechniqueTransition("wheat", ["grind", "pound", "smash"], "flour", {
    description: "You crushed and ground the wheat berries into fine, powdery flour.",
    tip: "Grind or pound wheat to make raw flour."
  })
);

const dough = buildCombineItem(
  {
    id: "dough",
    name: "Dough",
    emoji: "🍞",
    type: "ingredient",
    origin: "processed",
    category: "Pantry",
    description: "Pliable hydrated flour, ready for shaping and rising.",
    blurb: "Mixing flour and water initiates gluten development, forming a resilient matrix that captures steam and gases."
  },
  createCombineTransition(["flour", "water"], {
    description: "You mixed flour and water, kneading them into a smooth, elastic dough ball.",
    tip: "Combine flour and water to form dough, then knead it to strengthen structure."
  })
);

const hearthFlatbread = buildTechniqueItem(
  {
    id: "hearth_flatbread",
    name: "Hearth Flatbread",
    emoji: "🫓",
    category: "Pantry",
    description: "Char-spotted, warm flatbread baked on hot hearth stone.",
    blurb: "Slapped directly onto the floor of a hot stone or clay hearth, flatbread puffs and bakes in seconds."
  },
  createTechniqueTransition("dough", ["hearth_bake", "bake"], "hearth_flatbread", {
    description: "The flatbread blistered and puffed rapidly on the scorching stone hearth floor.",
    tip: "Bake raw dough directly on the floor of a Hearth & Clay Oven."
  })
);

const ashCake = buildTechniqueItem(
  {
    id: "ash_cake",
    name: "Ash Cake",
    emoji: "🫓",
    category: "Pantry",
    description: "Rustic flatbread baked directly in charcoal ashes.",
    blurb: "The simplest bread: laying flat dough directly onto wood ashes bakes it quickly. The ash is brushed off, leaving a smoky, slightly charred crust."
  },
  createTechniqueTransition("dough", ["char", "roast"], "ash_cake", {
    description: "You laid the dough directly onto the glowing wood coals. It puffed up, covered in clean grey ash.",
    tip: "Bake dough directly in hot ashes to make a primitive ash cake."
  })
);

const almondPaste = buildTechniqueItem(
  {
    id: "almond_paste",
    name: "Almond Paste",
    emoji: "🥣",
    category: "Forage",
    description: "Rich, creamy ground almond butter.",
    blurb: "Grinding sweet almonds releases their oils, creating a paste used to thicken early stews or enrich flatbreads."
  },
  createTechniqueTransition("almond", ["grind", "pound"], "almond_paste", {
    description: "You crushed and ground the almonds until they released their oils, forming a thick paste.",
    tip: "Grind or pound almonds to release fats and form almond paste."
  })
);

const roastedSunflowerSeeds = buildTechniqueItem(
  {
    id: "roasted_sunflower_seeds",
    name: "Roasted Sunflower Seeds",
    emoji: "🌻",
    category: "Pantry",
    description: "Warm, nutty toasted sunflower seeds.",
    blurb: "Roasting sunflower seeds over embers makes the shells brittle and brings out their nutty fat flavor."
  },
  createTechniqueTransition("sunflower_seed", ["char", "roast"], "roasted_sunflower_seeds", {
    description: "The seeds popped and smelled beautifully of roasted oils.",
    tip: "Toast sunflower seeds over open flame or coals."
  })
);

const pitCookedShrimp = buildTechniqueItem(
  {
    id: "pit_cooked_shrimp",
    name: "Pit-Cooked Shrimp",
    emoji: "🦐",
    category: "Proteins",
    description: "Smoky, ocean-sweet tender shrimp.",
    blurb: "Tossed into a seaweed-lined earth pit oven, shrimp cook in seconds, picking up deep steam and mineral flavors."
  },
  createTechniqueTransition("shrimp", ["pit_cook", "bake"], "pit_cooked_shrimp", {
    description: "The shrimp turned a brilliant pink, steamed perfectly by hot rocks in the earth oven.",
    tip: "Bake shrimp under hot rocks in an earth pit oven."
  })
);

const rawStewPot = buildCombineItem(
  {
    id: "raw_stew_pot",
    name: "Raw Stew Pot",
    emoji: "🍲",
    type: "ingredient",
    origin: "processed",
    category: "Pantry",
    description: "Water, fresh carrot, and wild mushrooms gathered in a pot.",
    blurb: "Combining water, roots, and mushrooms is the first step toward a comforting hot meal."
  },
  createCombineTransition(["water", "carrot", "button_mushroom"], {
    description: "You placed the roots, wild mushrooms, and water together in a cooking vessel.",
    tip: "Combine water, carrots, and mushrooms to prepare a raw stew pot."
  })
);

const stoneBoiledStew = buildTechniqueItem(
  {
    id: "stone_boiled_stew",
    name: "Stone-Boiled Stew",
    emoji: "🍲",
    category: "Pantry",
    description: "Hot, nourishing stew boiled using hot stones.",
    blurb: "A classic Paleolithic boiling method: dropping fire-heated stones directly into water to simmer mushrooms and sweet roots."
  },
  createTechniqueTransition("raw_stew_pot", ["cook", "simmer", "boil"], "stone_boiled_stew", {
    description: "Sizzling hot stones dropped into the water, bringing the soup to a bubbling boil until the vegetables turned sweet and soft.",
    tip: "Boil the raw stew pot with hot stones or stovetop heat."
  })
);

export default {
  ...pitRoastedSweetPotato,
  ...smokedFish,
  ...earthBakedShellfish,
  ...flour,
  ...dough,
  ...hearthFlatbread,
  ...ashCake,
  ...almondPaste,
  ...roastedSunflowerSeeds,
  ...pitCookedShrimp,
  ...rawStewPot,
  ...stoneBoiledStew
};
