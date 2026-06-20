import { buildCulturalPack } from "./helpers";

/** Mesoamerican — maize, cacao, squash, beans, and pre-Columbian feasts. */
export default buildCulturalPack(
  {
    id: "mesoamerican",
    name: "Mesoamerican",
    emoji: "🛕",
    region: "Mesoamerica",
    period: "Pre-Columbian",
    synopsis:
      "Olmec, Maya, and Aztec kitchens invented nixtamal, cacao drinks, and the milpa. Maize was sacred; "
      + "beans and squash completed nutrition; cacao was currency and ritual. Tamales and atol fed priests and farmers alike.",
    unlockCriteria: { discoveredRecipes: 24 }
  },
  {
    id: "meso_field",
    name: "Milpa Harvest",
    emoji: "🌽",
    category: "Pantry",
    description: "Heritage maize, cacao pod, squash, and bean triplet.",
    blurb:
      "The milpa rotation — maize, beans, squash — is agroecology millennia before the word existed.",
    separationDescription: "You gathered maize, cacao, squash, and beans from the milpa.",
    separationTip: "Harvest the milpa one crop at a time — each opens ancient techniques.",
    separations: [
      {
        id: "meso_maize_heritage",
        name: "Heritage Maize",
        emoji: "🌽",
        category: "Pantry",
        description: "Multicolored landrace corn — sacred and diverse.",
        blurb: "Mesoamericans bred dozens of maize types; color signaled ceremony and season."
      },
      {
        id: "meso_cacao_pod",
        name: "Cacao Pod",
        emoji: "🫘",
        category: "Produce",
        description: "Fermented cacao fruit surrounding bitter seeds.",
        blurb: "Aztec cacao beans bought slaves and paid tribute — chocolate began as bitter foam."
      },
      {
        id: "meso_squash",
        name: "Calabaza Squash",
        emoji: "🎃",
        category: "Produce",
        description: "Sweet squash flesh — milpa companion crop.",
        blurb: "Squash leaves shade bean roots; mature fruit stores through dry season."
      },
      {
        id: "meso_bean_triplet",
        name: "Heirloom Bean",
        emoji: "🫘",
        category: "Pantry",
        description: "Speckled bean climbing maize stalks.",
        blurb: "Beans fix nitrogen for maize — the milpa is mutual aid in plant form."
      }
    ]
  },
  [
    {
      id: "meso_nixtamal",
      name: "Nixtamal",
      emoji: "🫧",
      category: "Pantry",
      description: "Alkaline-soaked maize — foundation of Mesoamerican nutrition.",
      blurb: "Without nixtamal, maize pellagra haunted; with it, civilizations rose.",
      input: "meso_maize_heritage",
      tools: ["boil", "simmer"],
      transitionDescription: "Maize swelled in limewater, hulls slipping away.",
      transitionTip: "Nixtamalize heritage maize in alkaline water."
    },
    {
      id: "meso_cacao_paste",
      name: "Cacao Paste",
      emoji: "🍫",
      category: "Pantry",
      description: "Ground, bitter cacao — unsweetened sacred paste.",
      blurb: "Maya poured cacao between vessels to raise foam — status in a cup.",
      input: "meso_cacao_pod",
      tools: ["grind", "pound"],
      transitionDescription: "Fermented cacao seeds ground into dark, aromatic paste.",
      transitionTip: "Grind fermented cacao into paste for drinks and mole."
    },
    {
      id: "meso_roasted_squash",
      name: "Roasted Squash",
      emoji: "🔥",
      category: "Produce",
      description: "Fire-softened squash flesh — sweet and smoky.",
      blurb: "Ash-roasted squash fed field workers; skins char while interiors steam.",
      input: "meso_squash",
      tools: ["char", "roast"],
      transitionDescription: "Squash roasted in coals until flesh collapsed sweet.",
      transitionTip: "Roast squash in embers until tender."
    },
    {
      id: "meso_cooked_beans",
      name: "Simmered Beans",
      emoji: "🫘",
      category: "Pantry",
      description: "Beans softened in clay pot — milpa protein.",
      blurb: "Comal and olla are the two altars of Mesoamerican cooking.",
      input: "meso_bean_triplet",
      tools: ["simmer", "boil"],
      transitionDescription: "Beans simmered until creamy inside, intact outside.",
      transitionTip: "Slow-simmer heirloom beans in clay for milpa stews."
    }
  ],
  [
    {
      id: "meso_atol_base",
      name: "Atol Base",
      emoji: "🥣",
      category: "Pantry",
      description: "Warm maize drink thickened with nixtamal.",
      blurb: "Atol de elote and atolli sustained travelers — drinkable calories.",
      inputs: ["meso_nixtamal", "water"],
      transitionDescription: "Nixtamal whisked with water into warm, thick atol.",
      transitionTip: "Whisk nixtamal into water for atol base."
    },
    {
      id: "meso_tamale_masa",
      name: "Tamale Masa",
      emoji: "🫔",
      category: "Pantry",
      description: "Fat-enriched masa spread on husks.",
      blurb: "Tamales are holiday labor — families assemble hundreds for feast days.",
      inputs: ["meso_nixtamal", "meso_roasted_squash"],
      transitionDescription: "Nixtamal and squash enriched masa for tamale filling.",
      transitionTip: "Mix nixtamal with roasted squash for tamale masa."
    },
    {
      id: "meso_chocolate_atol",
      name: "Chocolate Atol",
      emoji: "🍫",
      category: "Pantry",
      description: "Bitter cacao whisked into warm atol — drink of nobles.",
      blurb: "Montezuma drank dozens of cacao cups daily; chili and flowers often joined.",
      inputs: ["meso_atol_base", "meso_cacao_paste"],
      transitionDescription: "Cacao paste frothed into atol — bitter, sacred, sustaining.",
      transitionTip: "Froth cacao paste into warm atol for ceremonial chocolate.",
      finalized: true
    },
    {
      id: "meso_tamales",
      name: "Tamales",
      emoji: "🫔",
      category: "Pantry",
      description: "Steamed masa parcels — feast food from pre-Columbian courts.",
      blurb: "Tamal comes from Nahuatl tamalli; every region wraps differently — husk, leaf, or bark.",
      inputs: ["meso_tamale_masa", "meso_cooked_beans"],
      transitionDescription: "Masa and beans wrapped and steamed into finished tamales.",
      transitionTip: "Fill tamale masa with beans, wrap, and steam.",
      finalized: true
    }
  ]
);
