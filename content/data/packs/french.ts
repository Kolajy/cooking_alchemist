import { buildCulturalPack } from "./helpers";

/** French — wheat, butter, wine grapes, and classical technique. */
export default buildCulturalPack(
  {
    id: "french",
    name: "French",
    emoji: "🇫🇷",
    region: "France",
    period: "Medieval through Haute Cuisine",
    synopsis:
      "French cuisine codified the Western kitchen: roux, stock, butter emulsions, and oven precision. "
      + "Peasant wheat and grapes met courtly refinement — baguettes, wine reductions, and herb bouquets still define technique schools worldwide.",
    unlockCriteria: { discoveredRecipes: 16 }
  },
  {
    id: "fra_market",
    name: "French Market Crate",
    emoji: "🧺",
    category: "Pantry",
    description: "Wheat berries, grapes, cultured butter, and a tied herb bouquet.",
    blurb:
      "Village markets supplied Paris by dawn; Escoffier later named what farmers already knew — fond, fondue, fines herbes.",
    separationDescription: "You unpacked wheat, grapes, butter culture, and tied herbs from the crate.",
    separationTip: "Sort a French market crate to separate grain, fruit, fat, and aromatics.",
    separations: [
      {
        id: "fra_wheat_berry",
        name: "Wheat Berry",
        emoji: "🌾",
        category: "Pantry",
        description: "Whole wheat kernels for milling and slow breads.",
        blurb: "French bakers fought for centuries over levain vs. yeast — wheat quality decided the crust."
      },
      {
        id: "fra_grape",
        name: "Wine Grape",
        emoji: "🍇",
        category: "Produce",
        description: "Small, tannic grapes for pressing and cooking wine.",
        blurb: "Roman Gaul planted vines; by the Middle Ages wine was food, medicine, and currency."
      },
      {
        id: "fra_butter_culture",
        name: "Cultured Butter",
        emoji: "🧈",
        category: "Pantry",
        description: "Churned, slightly tangy butter from cultured cream.",
        blurb: "Normandy and Brittany argued over whose butter was king — both won."
      },
      {
        id: "fra_herb_bouquet",
        name: "Bouquet Garni",
        emoji: "🌿",
        category: "Forage",
        description: "Parsley, thyme, and bay tied for simmering stocks.",
        blurb: "Escoffier insisted herbs leave the pot — flavor without flecks."
      }
    ]
  },
  [
    {
      id: "fra_bread_dough",
      name: "Bread Dough",
      emoji: "🍞",
      category: "Pantry",
      description: "Hydrated wheat dough after kneading.",
      blurb: "French dough wants autolyse — rest lets gluten form with less work.",
      input: "fra_wheat_berry",
      tools: ["grind", "knead"],
      transitionDescription: "Wheat ground and kneaded into elastic, springy dough.",
      transitionTip: "Grind wheat berries and knead into smooth bread dough."
    },
    {
      id: "fra_wine_reduction",
      name: "Wine Reduction",
      emoji: "🍷",
      category: "Liquids",
      description: "Grapes cooked down to syrupy, acidic concentrate.",
      blurb: "Reduction concentrates fruit and acid — the base of countless sauces.",
      input: "fra_grape",
      tools: ["simmer", "reduce"],
      transitionDescription: "Grapes simmered until the liquid turned glossy and intense.",
      transitionTip: "Reduce crushed grapes slowly for a sweet-sour wine base."
    },
    {
      id: "fra_brown_butter",
      name: "Beurre Noisette",
      emoji: "🟤",
      category: "Pantry",
      description: "Butter cooked until milk solids toast nut-brown.",
      blurb: "Brown butter — beurre noisette — smells like hazelnuts and finishes fish instantly.",
      input: "fra_butter_culture",
      tools: ["fry", "cook"],
      transitionDescription: "Butter foamed, then browned until it smelled like toasted nuts.",
      transitionTip: "Cook butter until solids caramelize for beurre noisette."
    },
    {
      id: "fra_stock_base",
      name: "Herb Stock",
      emoji: "🍲",
      category: "Liquids",
      description: "Light broth perfumed with bouquet garni.",
      blurb: "Fond blanc and fond brun anchor classical French sauces — herbs are the first layer.",
      input: "fra_herb_bouquet",
      tools: ["simmer", "boil"],
      transitionDescription: "Herbs steeped in simmering water into a clear, aromatic stock.",
      transitionTip: "Simmer bouquet garni in water for a quick herb stock."
    }
  ],
  [
    {
      id: "fra_roux_base",
      name: "Blond Roux",
      emoji: "🥄",
      category: "Pantry",
      description: "Butter and flour cooked to a pale thickener.",
      blurb: "Roux is France's gift to gravies — color determines sauce personality.",
      inputs: ["fra_brown_butter", "fra_wheat_berry"],
      transitionDescription: "Brown butter and flour cooked into a nutty blond roux.",
      transitionTip: "Cook butter with ground wheat into roux before adding liquid."
    },
    {
      id: "fra_pan_sauce",
      name: "Pan Sauce",
      emoji: "🍳",
      category: "Liquids",
      description: "Stock deglazed with wine reduction.",
      blurb: "Deglazing captures fond — the browned bits that hold the meal's memory.",
      inputs: ["fra_stock_base", "fra_wine_reduction"],
      transitionDescription: "Stock and wine reduction married into a glossy pan sauce.",
      transitionTip: "Deglaze herb stock with wine reduction for classic pan sauce."
    },
    {
      id: "fra_baguette",
      name: "Baguette",
      emoji: "🥖",
      category: "Pantry",
      description: "Crackling crust, open crumb — the daily bread of Paris.",
      blurb: "French law once fixed baguette ingredients; bakers still judge each other by the ear of the crust.",
      inputs: ["fra_bread_dough", "water"],
      transitionDescription: "Dough baked with steam into a shattering baguette.",
      transitionTip: "Bake kneaded dough with steam for a classic baguette crust.",
      finalized: true
    },
    {
      id: "fra_coq_style_stew",
      name: "Coq au Vin",
      emoji: "🍗",
      category: "Proteins",
      description: "Wine-braised dish — rustic poultry enriched with pan sauce.",
      blurb: "Burgundy villagers slow-cooked tough roosters in wine; the technique outlived the bird.",
      inputs: ["fra_pan_sauce", "fra_roux_base"],
      transitionDescription: "Pan sauce and roux simmered into a deep, wine-dark braise.",
      transitionTip: "Thicken pan sauce with roux for a coq au vin style braise.",
      finalized: true
    }
  ]
);
