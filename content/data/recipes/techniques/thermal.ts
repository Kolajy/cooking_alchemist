import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const recipe = createTechniqueTransition(
  "apple",
  ["char", "roast"],
  ["charred_apple"],
  {
    description: "The apple blistered and darkened over open heat.",
    tip: "Char fruit over flame to deepen sweetness before finishing a dish."
  }
);

export default buildTechniqueItem(
  {
    id: "charred_apple",
    name: "Charred Apple",
    emoji: "🍎",
    category: "Produce",
    description: "Smoke-kissed apple with caramelized edges and softened flesh.",
    blurb: "A quick sear over coals concentrates sugars — a hearth cook's shortcut to depth."
  },
  recipe
);
