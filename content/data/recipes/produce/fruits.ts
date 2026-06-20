import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "fruits",
  [
    "apple",
    "banana",
    "orange",
    "grape",
    "pear",
    "watermelon",
    "mango",
    "pineapple",
    "lemon",
    "peach"
  ],
  "You sorted a single ripe fruit from the wild harvest.",
  "Mixed fruit baskets hide surprises — separate them one at a time to learn what you have."
);

export default buildSeparationGroup(recipe, [
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    category: "Produce",
    description: "Crisp, sweet-tart flesh beneath thin skin.",
    blurb: "Apples spread along Silk Road trade routes and became one of the world's most cultivated tree fruits — thousands of varieties exist, but only a handful dominate grocery shelves."
  },
  {
    id: "banana",
    name: "Banana",
    emoji: "🍌",
    category: "Produce",
    description: "Soft, starchy-sweet flesh in a peelable yellow jacket.",
    blurb: "Wild bananas are full of hard seeds; the smooth Cavendish banana we eat today is a sterile clone propagated by cuttings for nearly two centuries."
  },
  {
    id: "orange",
    name: "Orange",
    emoji: "🍊",
    category: "Produce",
    description: "Juicy citrus segments with bright, sunny acidity.",
    blurb: "Oranges reached Europe from Southeast Asia via Arab traders; Portuguese sailors later planted them along trade winds, giving us the name for the color orange itself."
  },
  {
    id: "grape",
    name: "Grape",
    emoji: "🍇",
    category: "Produce",
    description: "Plump clusters of sweet or tart juice-filled berries.",
    blurb: "Humans have cultivated grapes for wine, raisins, and fresh eating for at least 8,000 years — one of the oldest domesticated fruit crops."
  },
  {
    id: "pear",
    name: "Pear",
    emoji: "🍐",
    category: "Produce",
    description: "Buttery, fragrant flesh that softens as it ripens.",
    blurb: "Pears were prized in medieval orchards for keeping well through winter — a rare fresh sweetness when snow covered the ground."
  },
  {
    id: "watermelon",
    name: "Watermelon",
    emoji: "🍉",
    category: "Produce",
    description: "Refreshing, watery crimson flesh inside a thick rind.",
    blurb: "Ancient Egyptian tomb paintings depict watermelons, and seeds were found in King Tut's tomb — a prized desert refreshment long before ice existed."
  },
  {
    id: "mango",
    name: "Mango",
    emoji: "🥭",
    category: "Produce",
    description: "Velvety golden flesh with honeyed tropical sweetness.",
    blurb: "India celebrates mango season with festivals and poetry; the fruit is so beloved there that a basket of mangoes is still considered a generous gift."
  },
  {
    id: "pineapple",
    name: "Pineapple",
    emoji: "🍍",
    category: "Produce",
    description: "Fibrous, explosively sweet flesh beneath spiny armor.",
    blurb: "European colonists called pineapple the \"king of fruits\" and rented them as centerpiece displays at banquets — a symbol of wealth before refrigeration made them common."
  },
  {
    id: "lemon",
    name: "Lemon",
    emoji: "🍋",
    category: "Produce",
    description: "Sharp, aromatic juice and zest with clean acidity.",
    blurb: "British sailors earned the nickname \"limeys\" for citrus rations that prevented scurvy — lemons and limes quietly changed naval history."
  },
  {
    id: "peach",
    name: "Peach",
    emoji: "🍑",
    category: "Produce",
    description: "Fuzzy skin giving way to soft, fragrant, juicy flesh.",
    blurb: "Peaches originated in China, where they symbolized immortality and good fortune; silk traders carried them west along routes that shaped the ancient world."
  }
]);
