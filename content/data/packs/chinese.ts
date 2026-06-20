import { buildCulturalPack } from "./helpers";

/** Chinese — wok hei, rice, noodles, fermentation, and regional breadth. */
export default buildCulturalPack(
  {
    id: "chinese",
    name: "Chinese",
    emoji: "🇨🇳",
    region: "China",
    period: "Han through Ming",
    synopsis:
      "Chinese cuisine is a continent of techniques: wok breath (hei), rice steaming, noodle pulling, and fermented sauces. "
      + "Imperial kitchens catalogued hundreds of methods; home cooks still balance salty, sweet, sour, and umami in one ladle.",
    unlockCriteria: { discoveredRecipes: 18 }
  },
  {
    id: "chn_pantry",
    name: "Chinese Pantry",
    emoji: "🏮",
    category: "Pantry",
    description: "Japonica rice, wheat noodles, bok choy, and fresh ginger.",
    blurb:
      "The phrase 'south rice, north wheat' maps China; ginger and greens cross every border.",
    separationDescription: "You sorted rice, noodles, greens, and ginger from the pantry.",
    separationTip: "A Chinese pantry separates grain, noodles, greens, and aromatics before wok work.",
    separations: [
      {
        id: "chn_japonica_rice",
        name: "Japonica Rice",
        emoji: "🍚",
        category: "Pantry",
        description: "Short, sticky rice for steaming and frying.",
        blurb: "Southern China steamed rice daily; northern mills ground wheat — both fed empires."
      },
      {
        id: "chn_wheat_noodle",
        name: "Wheat Noodle",
        emoji: "🍜",
        category: "Pantry",
        description: "Fresh alkaline noodles — chewy and springy.",
        blurb: "Hand-pulled lamian dazzles crowds; alkaline water gives noodles their yellow snap."
      },
      {
        id: "chn_bok_choy",
        name: "Bok Choy",
        emoji: "🥬",
        category: "Produce",
        description: "Mild cabbage-green with crisp stalks.",
        blurb: "Bok choy travels from Cantonese stir-fries to modern farm boxes worldwide."
      },
      {
        id: "chn_ginger_root",
        name: "Ginger Root",
        emoji: "🫚",
        category: "Forage",
        description: "Pungent rhizome for aromatics and medicine.",
        blurb: "Ginger appears in earliest Chinese herbals — heat without chile."
      }
    ]
  },
  [
    {
      id: "chn_steamed_rice",
      name: "Steamed Rice",
      emoji: "🍚",
      category: "Pantry",
      description: "Fluffy rice from a covered pot or steamer.",
      blurb: "A Chinese meal without rice is like a day without noon — incomplete.",
      input: "chn_japonica_rice",
      tools: ["cook", "simmer"],
      transitionDescription: "Rice steamed until each grain stood separate and tender.",
      transitionTip: "Steam japonica rice with measured water for daily service."
    },
    {
      id: "chn_minced_ginger",
      name: "Minced Ginger",
      emoji: "🫚",
      category: "Forage",
      description: "Fine ginger ready to hit hot oil.",
      blurb: "Ginger in hot oil is the first note of countless stir-fries.",
      input: "chn_ginger_root",
      tools: ["mince", "chop"],
      transitionDescription: "Ginger minced into fine, fragrant threads.",
      transitionTip: "Mince ginger before it meets the wok."
    },
    {
      id: "chn_wok_charred_greens",
      name: "Wok-Charred Bok Choy",
      emoji: "🔥",
      category: "Produce",
      description: "Greens blistered at high heat with ginger.",
      blurb: "Wok hei — breath of the wok — needs fierce heat and dry greens.",
      input: "chn_bok_choy",
      tools: ["char", "fry"],
      transitionDescription: "Bok choy charred at the edges while stalks stayed crisp.",
      transitionTip: "Stir-fry bok choy over high heat for wok hei."
    },
    {
      id: "chn_boiled_noodles",
      name: "Boiled Noodles",
      emoji: "🍜",
      category: "Pantry",
      description: "Springy noodles rinsed and ready for sauce.",
      blurb: "Rinsing noodles stops cooking and washes away excess starch for stir-fry.",
      input: "chn_wheat_noodle",
      tools: ["boil", "simmer"],
      transitionDescription: "Noodles boiled until chewy, then shocked in cold water.",
      transitionTip: "Boil wheat noodles until al dente before saucing."
    }
  ],
  [
    {
      id: "chn_fried_rice_base",
      name: "Fried Rice Base",
      emoji: "🍳",
      category: "Pantry",
      description: "Day-old rice tossed in a screaming-hot wok.",
      blurb: "Yangzhou fried rice demands separate grains — yesterday's rice is today's treasure.",
      inputs: ["chn_steamed_rice", "chn_minced_ginger"],
      transitionDescription: "Cold rice and ginger tossed until grains glistened separately.",
      transitionTip: "Fry steamed rice with minced ginger over highest heat."
    },
    {
      id: "chn_noodle_stir_fry",
      name: "Noodle Stir-Fry",
      emoji: "🥡",
      category: "Pantry",
      description: "Boiled noodles wok-tossed with charred greens.",
      blurb: "Chow mein is theater — noodles must sing on the iron.",
      inputs: ["chn_boiled_noodles", "chn_wok_charred_greens"],
      transitionDescription: "Noodles and greens united in a smoky wok toss.",
      transitionTip: "Stir-fry boiled noodles with charred bok choy."
    },
    {
      id: "chn_yangzhou_fried_rice",
      name: "Yangzhou Fried Rice",
      emoji: "🍚",
      category: "Pantry",
      description: "Classic fried rice with egg, aromatics, and separate grains.",
      blurb: "Qing Yangzhou traders popularized this rice; every region now claims its own version.",
      inputs: ["chn_fried_rice_base", "spring_water"],
      transitionDescription: "Fried rice finished with a splash of water for steam and gloss.",
      transitionTip: "Finish fried rice with spring water for the final wok toss.",
      finalized: true
    },
    {
      id: "chn_chow_mein",
      name: "Chow Mein",
      emoji: "🍜",
      category: "Pantry",
      description: "Crisp-edged noodles with vegetables — Chinatown's global ambassador.",
      blurb: "Chow mein crossed oceans with railroad workers and became a new cuisine abroad.",
      inputs: ["chn_noodle_stir_fry", "water"],
      transitionDescription: "Noodle stir-fry loosened with water into finished chow mein.",
      transitionTip: "Add water to noodle stir-fry for saucy chow mein.",
      finalized: true
    }
  ]
);
