import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

export default {
  ...buildTechniqueItem(
    {
      id: "soy_sauce",
      name: "Soy Sauce",
      emoji: "🍶",
      category: "Pantry",
      description: "Rich, fermented soy seasoning liquid.",
      blurb: "Rich in umami, soy sauce is produced by fermenting soybeans and wheat with mold cultures."
    },
    createTechniqueTransition("seeds", "ferment", "soy_sauce", {
      description: "You fermented the seeds, brewing a dark, savory liquid.",
      tip: "Ferment seeds to brew soy sauce."
    })
  )
};
