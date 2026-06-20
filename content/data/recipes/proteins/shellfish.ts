import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "shellfish",
  ["shrimp", "oyster", "clam", "mussel"],
  "You pulled one shellfish from the tidepool catch.",
  "Mixed shore harvests need sorting — separate each creature carefully."
);

export default buildSeparationGroup(recipe, [
  {
    id: "shrimp",
    name: "Shrimp",
    emoji: "🦐",
    category: "Proteins",
    description: "Sweet, quick-cooking crustacean with firm snap.",
    blurb: "Shrimp fisheries span every temperate coast — they turn pink in seconds on heat, a telltale sign their pigments are released."
  },
  {
    id: "oyster",
    name: "Oyster",
    emoji: "🦪",
    category: "Proteins",
    description: "Briny bivalve eaten raw or gently cooked.",
    blurb: "Oysters filter gallons of water daily — reef restoration projects now plant them to clean polluted harbors."
  },
  {
    id: "clam",
    name: "Clam",
    emoji: "🐚",
    category: "Proteins",
    description: "Burrowing bivalve with sweet, tender meat.",
    blurb: "New England clam chowder and Italian vongole pasta both begin with digging mud flats at low tide."
  },
  {
    id: "mussel",
    name: "Mussel",
    emoji: "🦪",
    category: "Proteins",
    description: "Blue-black shellfish that clings in dense colonies.",
    blurb: "Mussels attach with golden threads called byssus — the same protein once woven into luxury fabric in ancient times."
  }
]);
