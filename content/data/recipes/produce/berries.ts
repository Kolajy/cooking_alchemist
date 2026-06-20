import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "berries",
  ["strawberry", "raspberry", "blueberry", "blackberry", "smashed_berries", "fruits"],
  "You plucked a single berry or wild fruit from the cluster.",
  "Mixed berry patches ripen unevenly — separate them one at a time to sort each fruit."
);

export default buildSeparationGroup(recipe, [
  {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    category: "Produce",
    description: "Sweet, fragrant red berries with soft flesh.",
    blurb: "Medieval Europeans believed strawberries could lift melancholy, and the name may come from the practice of mulching plants with straw."
  },
  {
    id: "raspberry",
    name: "Raspberry",
    emoji: "🍒",
    category: "Produce",
    description: "Tart, delicate red drupelets that pull away easily from the core.",
    blurb: "Raspberries have been gathered across Europe since prehistoric times; the hollow core is left on the plant when you pick one."
  },
  {
    id: "blueberry",
    name: "Blueberry",
    emoji: "🫐",
    category: "Produce",
    description: "Small round blue berries with a light bloom and balanced sweetness.",
    blurb: "Blueberries are one of the few truly blue foods in nature — the waxy \"bloom\" on the skin helps the fruit shed rainwater."
  },
  {
    id: "blackberry",
    name: "Blackberry",
    emoji: "🍇",
    category: "Produce",
    description: "Plump dark aggregate berries with a deep, jammy flavor.",
    blurb: "Romans noted blackberries growing along roadsides, and English hedgerows were often planted with brambles to mark field boundaries."
  },
  {
    id: "smashed_berries",
    name: "Smashed Berries",
    emoji: "🥣",
    category: "Produce",
    description: "Accidentally crushed berries, oozing rich juice.",
    blurb: "A careless squeeze or drop turns delicate berries into a sweet, messy pulp."
  }
]);
