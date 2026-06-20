import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "seeds",
  ["sunflower_seed", "pumpkin_seed", "sesame", "flax", "chia", "melon_seed", "beans", "lentils", "chickpeas", "cocoa"],
  "You sorted a single seed type from the dried harvest.",
  "Seed sacks hold mixtures — separate them to learn what will sprout or roast."
);

export default buildSeparationGroup(recipe, [
  {
    id: "sunflower_seed",
    name: "Sunflower Seed",
    emoji: "🌻",
    category: "Pantry",
    description: "Nutty kernel rich in oil — snack or press.",
    blurb: "Indigenous North Americans bred sunflowers for oil and food long before European contact — seeds still follow the sun in the field."
  },
  {
    id: "pumpkin_seed",
    name: "Pumpkin Seed",
    emoji: "🎃",
    category: "Pantry",
    description: "Flat green pepita with toasty flavor.",
    blurb: "Mexican pepitas flavor moles and snacks; carving pumpkins at Halloween leaves tons of seeds worth roasting with salt."
  },
  {
    id: "sesame",
    name: "Sesame",
    emoji: "⚪",
    category: "Pantry",
    description: "Tiny oilseed that becomes tahini and crunch.",
    blurb: "\"Open sesame\" reflects the seed pods that burst when ripe — sesame may be the oldest oilseed crop humans ever cultivated."
  },
  {
    id: "flax",
    name: "Flax",
    emoji: "🌿",
    category: "Pantry",
    description: "Glossy brown seed yielding oil and fiber.",
    blurb: "Linen fabric comes from flax stalks while the seeds give linseed oil — the same plant dressed ancient Egypt and fed livestock."
  },
  {
    id: "chia",
    name: "Chia",
    emoji: "🫘",
    category: "Pantry",
    description: "Microseed that swells into a gel when soaked.",
    blurb: "Aztec runners carried chia for endurance; today the same mucilaginous gel thickens puddings and health drinks."
  },
  {
    id: "melon_seed",
    name: "Melon Seed",
    emoji: "🍉",
    category: "Pantry",
    description: "Dried melon seeds.",
    blurb: "Melon seeds are roasted and cracked as snacks, and ground into thick soups like West African Egusi."
  },
  {
    id: "beans",
    name: "Beans",
    emoji: "🫘",
    category: "Pantry",
    description: "Dry beans, rich in starch and protein.",
    blurb: "Beans were one of the first domesticated crops — paired with grains, they form a complete protein staple worldwide."
  },
  {
    id: "lentils",
    name: "Lentils",
    emoji: "🫘",
    category: "Pantry",
    description: "Dry lentils.",
    blurb: "Lentils originate from the Near East and are prized for their quick cooking and high protein content."
  },
  {
    id: "chickpeas",
    name: "Chickpeas",
    emoji: "🫘",
    category: "Pantry",
    description: "Dry chickpeas.",
    blurb: "Also known as garbanzo beans, chickpeas are the ancient base for hummus and falafel."
  },
  {
    id: "cocoa",
    name: "Cocoa",
    emoji: "🍫",
    category: "Pantry",
    description: "Bitter raw cocoa bean.",
    blurb: "Cocoa beans were used as currency by the Aztecs before becoming the base for chocolate."
  }
]);
