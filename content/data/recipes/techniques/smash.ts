import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const recipe = createTechniqueTransition(
  "potato",
  ["smash", "pound"],
  ["mashed_potato"],
  {
    description: "You crushed the potato into a rough, starchy mash.",
    tip: "Smash starchy tubers to break down fibers before mixing or cooking."
  }
);

export default buildTechniqueItem(
  {
    id: "mashed_potato",
    name: "Mashed Potato",
    emoji: "🥣",
    category: "Forage",
    description: "Broken-down potato flesh — soft, dense, and ready to blend.",
    blurb: "Mashing releases starch that thickens stews and binds simple hearth dishes together."
  },
  recipe
);
