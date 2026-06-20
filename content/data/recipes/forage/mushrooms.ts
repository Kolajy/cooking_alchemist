import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "mushrooms",
  ["button_mushroom", "shiitake", "oyster_mushroom", "portobello", "chanterelle"],
  "You picked out one fungus from the foraged cluster.",
  "Never rush a mushroom basket — separate and identify each find one at a time."
);

export default buildSeparationGroup(recipe, [
  {
    id: "button_mushroom",
    name: "Button Mushroom",
    emoji: "🍄",
    category: "Forage",
    description: "Pale, mild cultivated mushroom with firm cap.",
    blurb: "Agaricus bisporus appears as white buttons, brown cremini, and giant portobellos — all the same species at different ages."
  },
  {
    id: "shiitake",
    name: "Shiitake",
    emoji: "🍄‍🟫",
    category: "Forage",
    description: "Umami-rich cap with a smoky, savory aroma.",
    blurb: "Shiitake have been cultivated on oak logs in Japan for over a thousand years — \"shii\" refers to the pasania oak they prefer."
  },
  {
    id: "oyster_mushroom",
    name: "Oyster Mushroom",
    emoji: "🦪",
    category: "Forage",
    description: "Delicate fan-shaped mushroom with subtle seafood notes.",
    blurb: "Oyster mushrooms grow in shelf-like clusters on dead trees and are now farmed on straw — one of the easiest fungi to cultivate."
  },
  {
    id: "portobello",
    name: "Portobello",
    emoji: "🍄",
    category: "Forage",
    description: "Large mature cap with meaty texture for grilling.",
    blurb: "Marketing renamed overgrown brown cremini \"portobello\" in the 1980s — a rebranding trick that launched the stuffed mushroom craze."
  },
  {
    id: "chanterelle",
    name: "Chanterelle",
    emoji: "🌼",
    category: "Forage",
    description: "Golden trumpet mushroom with fruity, peppery perfume.",
    blurb: "Chanterelles resist domestication — foragers still hunt them in mossy forests, and chefs pay premium prices for wild baskets."
  }
]);
