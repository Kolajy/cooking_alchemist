import { buildCulturalPack } from "./helpers";

/** West African — millet, palm, okra, yam, and the jollof continuum. */
export default buildCulturalPack(
  {
    id: "west_african",
    name: "West African",
    emoji: "🌍",
    region: "West Africa",
    period: "Sahel through Atlantic trade",
    synopsis:
      "West African kitchens built empires on millet, yams, and palm oil. Okra thickened stews across the Sahel; "
      + "tomatoes arrived by trade and sparked the jollof debates. Egusi seeds and smoked fish still anchor celebration pots.",
    unlockCriteria: { discoveredRecipes: 12 }
  },
  {
    id: "waf_market",
    name: "West African Market Stall",
    emoji: "🏪",
    category: "Pantry",
    description: "A bustling stall: millet, palm fruit, okra, and yam.",
    blurb:
      "Timbuktu and coastal kingdoms traded grain, oil, and dried fish — market day still sets the week's menu.",
    separationDescription: "You sorted the stall into grains, oil fruit, pods, and tubers.",
    separationTip: "West African markets reward patient sorting — each item opens stews, porridges, or fried plates.",
    separations: [
      {
        id: "waf_millet",
        name: "Millet Grain",
        emoji: "🌾",
        category: "Pantry",
        description: "Tiny golden grains — drought-hardy staple of the Sahel.",
        blurb: "Millet porridge fed caravan traders long before rice dominated coastal cities."
      },
      {
        id: "waf_palm_fruit",
        name: "Palm Fruit",
        emoji: "🌴",
        category: "Produce",
        description: "Oil-rich fruit clusters from the African oil palm.",
        blurb: "Red palm oil colors and flavors everything from Ghana to Nigeria — sacred to many cooks."
      },
      {
        id: "waf_okra",
        name: "Okra Pod",
        emoji: "🥒",
        category: "Produce",
        description: "Ridged green pods that release silky mucilage when cut.",
        blurb: "Okra crossed the Atlantic in the slave trade and became gumbo's thickening soul."
      },
      {
        id: "waf_yam",
        name: "African Yam",
        emoji: "🍠",
        category: "Forage",
        description: "Large starchy tuber — ceremonial crop across Yoruba and Igbo lands.",
        blurb: "Yam festivals mark harvest; pounded yam is etiquette on honored plates."
      }
    ]
  },
  [
    {
      id: "waf_palm_oil",
      name: "Palm Oil",
      emoji: "🟠",
      category: "Pantry",
      description: "Vivid red oil pressed from palm fruit.",
      blurb: "Unrefined palm oil smokes at high heat and carries the taste of the forest edge.",
      input: "waf_palm_fruit",
      tools: ["press", "pound"],
      transitionDescription: "Palm fruit crushed until ruby oil pooled at the surface.",
      transitionTip: "Press boiled palm fruit to extract aromatic red oil."
    },
    {
      id: "waf_toasted_millet",
      name: "Toasted Millet",
      emoji: "🔥",
      category: "Pantry",
      description: "Nutty, golden millet toasted before boiling.",
      blurb: "Toasting millet before porridge deepens flavor — a Sahel cook's quiet secret.",
      input: "waf_millet",
      tools: ["char", "roast"],
      transitionDescription: "Millet grains popped and browned in a dry pot.",
      transitionTip: "Dry-roast millet until fragrant before simmering into porridge."
    },
    {
      id: "waf_pounded_yam",
      name: "Pounded Yam",
      emoji: "🥣",
      category: "Forage",
      description: "Elastic, smooth yam dough from rhythmic pounding.",
      blurb: "Pounding yam in a mortar is communal work — the stretch proves skill and respect.",
      input: "waf_yam",
      tools: ["pound", "smash"],
      transitionDescription: "Yam flesh turned silky and stretchy under the pestle.",
      transitionTip: "Boil yam, then pound until smooth and elastic for fufu-style service."
    },
    {
      id: "waf_okra_base",
      name: "Sliced Okra",
      emoji: "🔪",
      category: "Produce",
      description: "Cross-cut okra ready to melt into stew.",
      blurb: "Cutting okra releases slime that thickens soups — embrace it, don't fight it.",
      input: "waf_okra",
      tools: ["slice", "cut"],
      transitionDescription: "Okra sliced into rounds that will thicken the pot.",
      transitionTip: "Slice okra to release its natural thickener into stews."
    }
  ],
  [
    {
      id: "waf_jollof_base",
      name: "Jollof Rice Base",
      emoji: "🍚",
      category: "Pantry",
      description: "Tomato-red rice simmered in palm oil and spice.",
      blurb: "Every nation claims the best jollof — Senegal, Ghana, Nigeria — and every pot starts with red oil.",
      inputs: ["waf_toasted_millet", "waf_palm_oil"],
      transitionDescription: "Toasted millet fried in palm oil, ready for tomato and stock.",
      transitionTip: "Fry toasted grain in palm oil before adding tomato for jollof depth."
    },
    {
      id: "waf_egusi_paste",
      name: "Egusi Paste",
      emoji: "🥜",
      category: "Pantry",
      description: "Ground melon-seed paste — rich, nutty thickener for stew.",
      blurb: "Egusi soup is feast food; seeds are ground with okra and leaf for a luxurious pot.",
      inputs: ["nuts", "waf_okra_base"],
      transitionDescription: "Ground nuts and okra formed a thick, nutty paste.",
      transitionTip: "Grind nuts with sliced okra for classic egusi body."
    },
    {
      id: "waf_jollof_rice",
      name: "Jollof Rice",
      emoji: "🍛",
      category: "Pantry",
      description: "Celebration rice — smoky bottom crust optional but prized.",
      blurb: "Party jollof is judged by its 'bottom pot' char; cooks guard their spice ratios like state secrets.",
      inputs: ["waf_jollof_base", "spring_water"],
      transitionDescription: "Rice base simmered with water into fragrant, red jollof.",
      transitionTip: "Simmer jollof base with spring water until grains absorb the sauce.",
      finalized: true
    },
    {
      id: "waf_egusi_stew",
      name: "Egusi Stew",
      emoji: "🍲",
      category: "Pantry",
      description: "Thick melon-seed stew served with pounded yam.",
      blurb: "Egusi stew at weddings feeds dozens — the paste seizes the broth into velvet.",
      inputs: ["waf_egusi_paste", "waf_pounded_yam"],
      transitionDescription: "Egusi paste and pounded yam joined into a finished feast stew.",
      transitionTip: "Finish egusi paste with pounded yam on the side for a traditional plate.",
      finalized: true
    }
  ]
);
