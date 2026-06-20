import { buildCulturalPack } from "./helpers";

/** Mexican — maize nixtamalization, beans, chiles, and market salsa traditions. */
export default buildCulturalPack(
  {
    id: "mexican",
    name: "Mexican",
    emoji: "🇲🇽",
    region: "Mexico",
    period: "Pre-Columbian through Colonial",
    synopsis:
      "Mesoamerican farmers domesticated maize and beans together — the milpa. Nixtamalization unlocked niacin from corn; "
      + "chiles, tomatillos, and lime turned market baskets into tortillas, pozole, and salsas that spread across the continent.",
    unlockCriteria: { discoveredRecipes: 10 }
  },
  {
    id: "mex_market",
    name: "Mexican Market Basket",
    emoji: "🧺",
    category: "Pantry",
    description: "A mercado bundle: maize, beans, chiles, and tomatillos.",
    blurb:
      "Aztec tianguis markets fed Tenochtitlan; colonial cooks folded Old World herbs into indigenous fire and lime.",
    separationDescription: "You unpacked the market basket into maize, beans, chiles, and tart tomatillos.",
    separationTip: "Sort a Mexican market haul one ingredient at a time to learn each branch of the cuisine.",
    separations: [
      {
        id: "mex_maize",
        name: "Dried Maize",
        emoji: "🌽",
        category: "Pantry",
        description: "Hard field corn kernels awaiting nixtamalization.",
        blurb: "Maize was selectively bred for thousands of years; without lime treatment it cannot become true masa."
      },
      {
        id: "mex_pinto_bean",
        name: "Pinto Bean",
        emoji: "🫘",
        category: "Pantry",
        description: "Speckled beans that cream when simmered.",
        blurb: "The milpa triad — maize, beans, squash — sustained civilizations across the Valley of Mexico."
      },
      {
        id: "mex_jalapeno",
        name: "Jalapeño",
        emoji: "🌶️",
        category: "Produce",
        description: "Medium-heat green chile with bright, grassy flavor.",
        blurb: "Jalapeños are named for Xalapa, Veracruz; smoke-drying them creates chipotles."
      },
      {
        id: "mex_tomatillo",
        name: "Tomatillo",
        emoji: "🫛",
        category: "Produce",
        description: "Tart green fruit in a papery husk — salsa verde's backbone.",
        blurb: "Tomatillos are older in the Americas than red tomatoes; their acidity defines green salsa."
      }
    ]
  },
  [
    {
      id: "mex_nixtamal",
      name: "Nixtamal",
      emoji: "🫧",
      category: "Pantry",
      description: "Maize soaked and cooked in alkaline lime water.",
      blurb: "Nixtamalization — soaking corn in cal — frees niacin and gives tortillas their aroma.",
      input: "mex_maize",
      tools: ["boil", "simmer"],
      transitionDescription: "Maize swelled in limewater until the hulls slipped free.",
      transitionTip: "Boil dried maize with alkaline lime to nixtamalize before grinding."
    },
    {
      id: "mex_masa",
      name: "Masa",
      emoji: "🫓",
      category: "Pantry",
      description: "Fresh corn dough ground from nixtamal.",
      blurb: "Hand-ground masa on a metate is still prized; the dough should feel like cool clay.",
      input: "mex_nixtamal",
      tools: ["grind", "pound"],
      transitionDescription: "Nixtamal crushed into pliable, fragrant corn dough.",
      transitionTip: "Grind nixtamal into masa for tortillas and tamales."
    },
    {
      id: "mex_charred_chile",
      name: "Charred Jalapeño",
      emoji: "🔥",
      category: "Produce",
      description: "Blistered chile with smoky, mellowed heat.",
      blurb: "Roasting chiles on a comal tames raw bite and deepens salsa.",
      input: "mex_jalapeno",
      tools: ["char", "roast"],
      transitionDescription: "The jalapeño blackened and softened over open heat.",
      transitionTip: "Char chiles on a dry griddle before blending into salsa."
    },
    {
      id: "mex_refried_beans",
      name: "Refried Beans",
      emoji: "🫘",
      category: "Pantry",
      description: "Mashed, pan-fried beans rich with fat and spice.",
      blurb: "Frijoles refritos are fried twice in tradition — simmered soft, then crisped in lard or oil.",
      input: "mex_pinto_bean",
      tools: ["cook", "fry"],
      transitionDescription: "Beans simmered until soft, then mashed and fried until creamy.",
      transitionTip: "Cook pinto beans until tender, then fry and mash for refritos."
    }
  ],
  [
    {
      id: "mex_salsa_verde",
      name: "Salsa Verde",
      emoji: "🥗",
      category: "Produce",
      description: "Bright green sauce of tomatillo and charred chile.",
      blurb: "Salsa verde predates colonial kitchens; its tartness cuts rich meats and tacos.",
      inputs: ["mex_tomatillo", "mex_charred_chile"],
      transitionDescription: "Tomatillos and charred chile blended into a sharp green salsa.",
      transitionTip: "Combine tomatillos with roasted chiles for classic salsa verde."
    },
    {
      id: "mex_tortilla",
      name: "Corn Tortilla",
      emoji: "🫓",
      category: "Pantry",
      description: "Thin griddled disk of fresh masa.",
      blurb: "Tortillas are called 'the bread of Mexico'; a skilled tortillera shapes hundreds per hour.",
      inputs: ["mex_masa", "water"],
      transitionDescription: "Masa pressed and griddled into warm, flexible tortillas.",
      transitionTip: "Press masa with water into thin rounds and cook on a hot comal."
    },
    {
      id: "mex_tacos_frijoles",
      name: "Tacos de Frijoles",
      emoji: "🌮",
      category: "Pantry",
      description: "Warm tortillas folded around creamy refried beans and salsa verde.",
      blurb: "Bean tacos fed workers before beef was common — humble, filling, and perfectly balanced.",
      inputs: ["mex_tortilla", "mex_refried_beans"],
      transitionDescription: "Tortillas filled with beans and finished with salsa verde.",
      transitionTip: "Fill warm tortillas with refried beans for a classic street taco.",
      finalized: true
    },
    {
      id: "mex_pozole_verde",
      name: "Pozole Verde",
      emoji: "🍲",
      category: "Pantry",
      description: "Hominy-style stew brightened with green salsa and herbs.",
      blurb: "Pozole was ritual food in Aztec feasts; green versions shine in Guerrero and Jalisco.",
      inputs: ["mex_salsa_verde", "mex_nixtamal"],
      transitionDescription: "Nixtamal and salsa verde simmered into a celebratory green pozole.",
      transitionTip: "Simmer nixtamal in salsa verde for a festive pozole verde.",
      finalized: true
    }
  ]
);
