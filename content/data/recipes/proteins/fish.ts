import { buildTechniqueItem, createTechniqueTransition, buildCombineItem, createCombineTransition } from "../_techniqueRecipe";
import { buildFinalizedRecipeItem } from "../_finalizedRecipe";

const cleanedFish = buildTechniqueItem(
  {
    id: "cleaned_fish",
    name: "Cleaned Fish",
    emoji: "🐟",
    category: "Proteins",
    description: "Scaled, gutted, and prepared fish ready for cooking.",
    blurb: "Cleaning a fish requires scaling, gutting, and scoring the flesh so that heat and seasonings penetrate evenly."
  },
  createTechniqueTransition("whole_fish", "fillet", "cleaned_fish", {
    description: "You cleanly scaled, gutted, and scored the fish.",
    tip: "Use the fillet skill to scale and clean whole fish."
  })
);

const preparedFish = buildCombineItem(
  {
    id: "prepared_fish",
    name: "Prepared Fish",
    emoji: "🐟",
    type: "ingredient",
    origin: "processed",
    category: "Proteins",
    description: "Cleaned fish arranged with julienned ginger and scallions.",
    blurb: "Placing fish on a bed of fresh aromatics keeps it from sticking to the steamer plate and infuses it with aromatic steam."
  },
  createCombineTransition(["cleaned_fish", "julienned_ginger", "julienned_scallions"], {
    description: "You arranged the cleaned fish on a platter with ginger and scallions.",
    tip: "Combine prepped fish with julienned aromatics before cooking."
  })
);

const cookedSteamedFish = buildTechniqueItem(
  {
    id: "cooked_steamed_fish",
    name: "Cooked Steamed Fish",
    emoji: "🐟",
    category: "Proteins",
    description: "Flaky fish steamed to perfection with aromatics.",
    blurb: "Steaming cooks the fish in its own juices, preserving its sweet, delicate flavor while softening the flesh."
  },
  createTechniqueTransition("prepared_fish", ["cook", "simmer", "boil"], "cooked_steamed_fish", {
    description: "Steam rose around the fish, cooking it until the flesh turned tender and flaky.",
    tip: "Steam prepared fish using a controlled stovetop boil/simmer."
  })
);

const cantoneseSteamedFish = buildFinalizedRecipeItem(
  {
    id: "cantonese_steamed_fish",
    name: "Cantonese Steamed Fish",
    emoji: "🐟",
    category: "Proteins",
    description: "Delicate steamed fish splash-seared with hot oil and dressed in soy sauce.",
    blurb: "A classic Cantonese dish. Searing the steamed aromatics with sizzling hot oil instantly locks in their fresh fragrance, while soy sauce provides the perfect savory finish."
  },
  [
    createCombineTransition(["cooked_steamed_fish", "soy_sauce", "hot_oil"], {
      description: "You splashed the shimmering hot oil over the fish, followed by soy sauce. The kitchen filled with a magnificent aroma.",
      tip: "Splash hot oil and soy sauce onto cooked steamed fish for a spectacular finish."
    })
  ]
);

export default {
  ...cleanedFish,
  ...preparedFish,
  ...cookedSteamedFish,
  ...cantoneseSteamedFish
};
