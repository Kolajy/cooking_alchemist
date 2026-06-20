import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const cookingOil = {
  ...buildTechniqueItem(
    {
      id: "cooking_oil",
      name: "Cooking Oil",
      emoji: "🫙",
      category: "Pantry",
      description: "Neutral oil pressed from raw seeds or nuts.",
      blurb: "Neutral plant oils provide a high-heat cooking medium, essential for searing, frying, and dressing dishes."
    },
    createTechniqueTransition("seeds", "press", "cooking_oil", {
      description: "You pressed the dry seeds, extracting their pure golden oil.",
      tip: "Apply pressure to oilseeds or nuts to extract cooking oil."
    })
  )
};

// Also add a press transition from nuts
const cookingOilNuts = createTechniqueTransition("nuts", "press", "cooking_oil", {
  description: "You crushed and pressed the nuts, extracting a rich oil.",
  tip: "Apply pressure to oily nuts to extract cooking oil."
});
cookingOil.cooking_oil.recipes!.push(cookingOilNuts);

const hotOil = buildTechniqueItem(
  {
    id: "hot_oil",
    name: "Hot Oil",
    emoji: "🔥",
    category: "Pantry",
    description: "Neutral oil heated until shimmering and smoking.",
    blurb: "Heating oil to its smoke point makes it ready to flash-sear aromatics, instantly unlocking their volatile flavor compounds."
  },
  createTechniqueTransition("cooking_oil", ["char", "cook", "precision"], "hot_oil", {
    description: "The oil heated until it shimmered and sent up faint wisps of smoke.",
    tip: "Apply heat to cooking oil to prepare it for high-temperature searing."
  })
);

export default {
  ...cookingOil,
  ...hotOil
};
