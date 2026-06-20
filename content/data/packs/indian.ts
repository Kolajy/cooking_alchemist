import { buildCulturalPack } from "./helpers";

/** Indian — lentils, rice, spice tempering, and subcontinental breadth. */
export default buildCulturalPack(
  {
    id: "indian",
    name: "Indian",
    emoji: "🇮🇳",
    region: "Indian subcontinent",
    period: "Harappan through Mughal",
    synopsis:
      "India's cuisines span deserts, coasts, and mountains united by spice, dal, and rice. "
      + "Tadka — hot oil blooming cumin and chile — transforms simple legumes; biryani layered courtly refinement onto farmer's grain.",
    unlockCriteria: { discoveredRecipes: 14 }
  },
  {
    id: "ind_spice_market",
    name: "Indian Spice Market",
    emoji: "🛒",
    category: "Pantry",
    description: "Basmati, lentils, cumin, and dried red chile.",
    blurb:
      "Spice routes made Indian markets legendary; Ayurveda classified foods by heat and cooling long before modern nutrition.",
    separationDescription: "You separated basmati, dal, cumin seeds, and dried chiles from the market bundle.",
    separationTip: "Indian pantries begin with rice, legumes, whole spices, and heat — sort each to branch the kitchen.",
    separations: [
      {
        id: "ind_basmati",
        name: "Basmati Rice",
        emoji: "🍚",
        category: "Pantry",
        description: "Long, fragrant rice aged for aroma.",
        blurb: "Basmati means 'fragrant' in Sanskrit; Mughal kitchens prized its length and perfume."
      },
      {
        id: "ind_lentil",
        name: "Split Lentil",
        emoji: "🫘",
        category: "Pantry",
        description: "Quick-cooking dal — protein staple across the subcontinent.",
        blurb: "Dal is daily bread for millions; varieties number in the dozens by region and split."
      },
      {
        id: "ind_cumin_seed",
        name: "Cumin Seed",
        emoji: "🌰",
        category: "Pantry",
        description: "Earthy whole seeds for tempering oil.",
        blurb: "Jeera popped in hot ghee is the soundtrack of Indian home cooking."
      },
      {
        id: "ind_dried_chile",
        name: "Dried Red Chile",
        emoji: "🌶️",
        category: "Produce",
        description: "Sun-dried chiles for heat and color.",
        blurb: "Kashmiri chiles color tandoori; bird's eye chiles sting coastal fish curries."
      }
    ]
  },
  [
    {
      id: "ind_tadka_oil",
      name: "Tempered Spice Oil",
      emoji: "🫕",
      category: "Pantry",
      description: "Hot oil crackling with cumin and chile — tadka.",
      blurb: "Tadka at the end perfumes dal; tadka at the start builds curry foundations.",
      input: "ind_cumin_seed",
      tools: ["fry", "cook"],
      transitionDescription: "Cumin seeds sizzled and popped in shimmering hot oil.",
      transitionTip: "Fry cumin seeds in hot oil until fragrant to make tadka."
    },
    {
      id: "ind_cooked_dal",
      name: "Cooked Dal",
      emoji: "🥣",
      category: "Pantry",
      description: "Soft, broken lentils ready for tempering.",
      blurb: "A pressure cooker changed Indian kitchens, but slow-simmered dal still tastes sweetest.",
      input: "ind_lentil",
      tools: ["boil", "simmer"],
      transitionDescription: "Lentils collapsed into a creamy, golden porridge.",
      transitionTip: "Simmer split lentils until they break down into smooth dal."
    },
    {
      id: "ind_parboiled_rice",
      name: "Parboiled Basmati",
      emoji: "♨️",
      category: "Pantry",
      description: "Partially cooked rice grains for biryani layering.",
      blurb: "Biryani demands rice cooked to 70% — finish steaming between spiced meat or veg.",
      input: "ind_basmati",
      tools: ["boil", "simmer"],
      transitionDescription: "Basmati parboiled until just tender at the core.",
      transitionTip: "Parboil basmati until nearly done before layering biryani."
    },
    {
      id: "ind_chile_paste",
      name: "Chile Paste",
      emoji: "🌶️",
      category: "Produce",
      description: "Rehydrated dried chiles ground into fiery paste.",
      blurb: "Soaking dried chiles wakes depth that fresh pods cannot match alone.",
      input: "ind_dried_chile",
      tools: ["grind", "pound"],
      transitionDescription: "Dried chiles soaked and ground into vivid red paste.",
      transitionTip: "Grind soaked dried chiles into paste for curries and marinades."
    }
  ],
  [
    {
      id: "ind_tempered_dal",
      name: "Tempered Dal",
      emoji: "🍛",
      category: "Pantry",
      description: "Dal finished with sizzling tadka poured over the top.",
      blurb: "The hiss when tadka hits dal is a cook's applause line.",
      inputs: ["ind_cooked_dal", "ind_tadka_oil"],
      transitionDescription: "Hot tadka oil poured over dal — aroma rose in a sharp crackle.",
      transitionTip: "Pour tempered spice oil over cooked dal at the last moment."
    },
    {
      id: "ind_biryani_spice_mix",
      name: "Biryani Spice Mix",
      emoji: "🧂",
      category: "Pantry",
      description: "Layering spices and chile paste for rice perfume.",
      blurb: "Hyderabadi biryani uses marigold and saffron; Lucknow favors subtle kewra.",
      inputs: ["ind_chile_paste", "ind_parboiled_rice"],
      transitionDescription: "Chile paste coated parboiled rice for aromatic layering.",
      transitionTip: "Toss parboiled rice with chile paste before dum steaming."
    },
    {
      id: "ind_masoor_dal",
      name: "Masoor Dal",
      emoji: "🍲",
      category: "Pantry",
      description: "Everyday red lentil dal with cumin tempering — India's comfort bowl.",
      blurb: "Dal-chawal is home; temple langars serve it by the thousand.",
      inputs: ["ind_tempered_dal", "spring_water"],
      transitionDescription: "Tempered dal thinned to a silky, everyday consistency.",
      transitionTip: "Adjust tempered dal with spring water for a pourable home-style dal.",
      finalized: true
    },
    {
      id: "ind_vegetable_biryani",
      name: "Vegetable Biryani",
      emoji: "🍚",
      category: "Pantry",
      description: "Fragrant layered rice with spices — celebration food from palace to potluck.",
      blurb: "Biryani arrived with Persian courts and became utterly Indian — dum sealed with dough.",
      inputs: ["ind_biryani_spice_mix", "roots"],
      transitionDescription: "Spiced rice and roots steamed together into finished biryani.",
      transitionTip: "Layer spiced rice with vegetables and steam dum-style for biryani.",
      finalized: true
    }
  ]
);
