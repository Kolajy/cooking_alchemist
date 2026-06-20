import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "nuts",
  ["almond", "walnut", "pecan", "hazelnut", "pistachio", "peanuts", "coconuts"],
  "You cracked out a single nut from the wild harvest.",
  "Mixed nuts rattle together — separate them one shell at a time."
);

export default buildSeparationGroup(recipe, [
  {
    id: "almond",
    name: "Almond",
    emoji: "🌰",
    category: "Forage",
    description: "Mild, milky kernel beneath a papery skin.",
    blurb: "Almond orchards need honeybee pollination — entire truckloads of hives travel California valleys each spring."
  },
  {
    id: "walnut",
    name: "Walnut",
    emoji: "🥜",
    category: "Forage",
    description: "Rich, tannic nut with a lobed brain-like shape.",
    blurb: "Walnut trees release juglone into the soil, discouraging rivals — gardeners still plant them downwind of vegetable beds."
  },
  {
    id: "pecan",
    name: "Pecan",
    emoji: "🌰",
    category: "Forage",
    description: "Buttery Southern nut with sweet maple notes.",
    blurb: "Pecan pie became an American icon, but the trees are native only to the Mississippi valley and northern Mexico."
  },
  {
    id: "hazelnut",
    name: "Hazelnut",
    emoji: "🌰",
    category: "Forage",
    description: "Toasty round nut prized in confections.",
    blurb: "Turkey grows most of the world's hazelnuts; Nutella alone consumes a significant share of the global crop."
  },
  {
    id: "pistachio",
    name: "Pistachio",
    emoji: "🟢",
    category: "Forage",
    description: "Green kernel with a split shell and savory richness.",
    blurb: "Pistachios open on the tree when ripe — harvesters shake the branches and catch nuts that have naturally \"smiled\" open."
  },
  {
    id: "peanuts",
    name: "Peanuts",
    emoji: "🥜",
    category: "Forage",
    description: "Earthy legumes dug from soil.",
    blurb: "Although called nuts, peanuts grow underground — they are legumes that bury their own seed pods after flowering."
  },
  {
    id: "coconuts",
    name: "Coconuts",
    emoji: "🥥",
    category: "Forage",
    description: "Hard tropical nut containing sweet water and flesh.",
    blurb: "Coconuts float across oceans to sprout on distant shores — a complete source of water, fat, and fiber."
  }
]);
