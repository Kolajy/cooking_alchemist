import { buildCulturalPack } from "./helpers";

/** Japanese — rice culture, dashi, fermentation, and coastal pantry goods. */
export default buildCulturalPack(
  {
    id: "japanese",
    name: "Japanese",
    emoji: "🇯🇵",
    region: "Japan",
    period: "Jōmon through Edo",
    synopsis:
      "Japan's archipelago cuisine grew from Jōmon fishers and foragers into a refined rice-and-seafood tradition. "
      + "Fermented soy, kelp stocks, and careful knife work turned humble pantry goods into miso, dashi, and portable rice balls.",
    unlockCriteria: { discoveredRecipes: 8 }
  },
  {
    id: "jpn_pantry",
    name: "Japanese Pantry",
    emoji: "🍱",
    category: "Pantry",
    description: "A coastal pantry bundle: rice, soy, kelp, and dried bonito.",
    blurb:
      "Island cooks stored rice as sacred grain while kombu and katsuobushi supplied umami long before chemistry named it.",
    separationDescription: "You sorted the pantry into staple grains, legumes, and sea-seasoning goods.",
    separationTip: "Japanese larders separate rice, soy, kelp, and dried fish — each unlocks a different branch of the kitchen.",
    separations: [
      {
        id: "jpn_rice",
        name: "Short-Grain Rice",
        emoji: "🍚",
        category: "Pantry",
        description: "Polished Japonica rice — sticky, fragrant, and central to every meal.",
        blurb:
          "Rice cultivation reached Japan by the Yayoi period; short grains suit chopsticks and onigiri shaping."
      },
      {
        id: "jpn_soybean",
        name: "Soybean",
        emoji: "🫘",
        category: "Pantry",
        description: "Small golden legumes destined for miso, tofu, and soy sauce.",
        blurb:
          "Buddhist temple kitchens spread soybean processing across Japan — miso became the country's savory backbone."
      },
      {
        id: "jpn_kombu",
        name: "Kombu Kelp",
        emoji: "🌿",
        category: "Forage",
        description: "Dried kelp fronds rich in glutamates for stock.",
        blurb:
          "Hokkaido kombu was traded south for centuries; steeping it in water is the oldest shortcut to depth."
      },
      {
        id: "jpn_bonito",
        name: "Bonito Flakes",
        emoji: "🐟",
        category: "Proteins",
        description: "Paper-thin shavings of smoked skipjack tuna.",
        blurb:
          "Katsuobushi is shaved from blocks fermented and smoked for months — a flavor bomb invented to preserve fish."
      }
    ]
  },
  [
    {
      id: "jpn_washed_rice",
      name: "Washed Rice",
      emoji: "💧",
      category: "Pantry",
      description: "Rinsed grains with surface starch removed.",
      blurb: "Washing rice until the water runs clear prevents gluey pots and keeps each grain distinct.",
      input: "jpn_rice",
      tools: ["separate", "hand_mix"],
      transitionDescription: "You rinsed the rice until the water turned milky, then clear.",
      transitionTip: "Agitate rice in fresh water to wash away excess starch before cooking."
    },
    {
      id: "jpn_cooked_rice",
      name: "Steamed Rice",
      emoji: "🍚",
      category: "Pantry",
      description: "Fluffy steamed short-grain rice — warm, sticky, and ready to shape.",
      blurb: "Steaming in a donabe or pot preserves aroma; Edo cooks prized glossy, separate grains.",
      input: "jpn_washed_rice",
      tools: ["cook", "simmer"],
      transitionDescription: "Steam rose as the rice swelled into tender, glossy grains.",
      transitionTip: "Simmer washed rice with measured water until tender and steam-finished."
    },
    {
      id: "jpn_dashi",
      name: "Dashi Stock",
      emoji: "🍲",
      category: "Liquids",
      description: "Clear kelp-and-bonito stock — the soul of Japanese soup.",
      blurb: "Dashi is not boiled hard; gentle steeping extracts umami without bitterness.",
      input: "jpn_kombu",
      tools: ["simmer", "cook"],
      transitionDescription: "Kombu steeped, then bonito bloomed into a golden, savory stock.",
      transitionTip: "Steep kombu, then add bonito off the boil for classic ichiban dashi."
    },
    {
      id: "jpn_miso_paste",
      name: "Miso Paste",
      emoji: "🫙",
      category: "Pantry",
      description: "Fermented soybean paste — salty, earthy, and alive with culture.",
      blurb: "Miso varies by region: sweet white in Kyoto, robust red in Sendai — all begin with koji mold.",
      input: "jpn_soybean",
      tools: ["pound", "knead"],
      transitionDescription: "Soybeans broke down into a thick, fragrant fermented paste.",
      transitionTip: "Crush cooked soybeans and salt-cure them to begin miso fermentation."
    }
  ],
  [
    {
      id: "jpn_rice_ball_base",
      name: "Rice Ball Base",
      emoji: "🍙",
      category: "Pantry",
      description: "Seasoned rice pressed into a portable mound.",
      blurb: "Onigiri fed travelers and soldiers — salt on the hands kept the shape firm.",
      inputs: ["jpn_cooked_rice", "jpn_bonito"],
      transitionDescription: "Warm rice and bonito folded together into a savory mound.",
      transitionTip: "Mix steamed rice with bonito flakes while still warm to shape onigiri."
    },
    {
      id: "jpn_miso_broth",
      name: "Miso Broth",
      emoji: "🥣",
      category: "Liquids",
      description: "Dashi whispered with dissolved miso — never boiled after paste is added.",
      blurb: "Temple cooks taught that boiling miso kills its aroma; whisk it in off the heat.",
      inputs: ["jpn_dashi", "jpn_miso_paste"],
      transitionDescription: "Miso melted into dashi, turning the stock cloudy and fragrant.",
      transitionTip: "Dissolve miso paste into warm dashi without a rolling boil."
    },
    {
      id: "jpn_onigiri",
      name: "Onigiri",
      emoji: "🍙",
      category: "Pantry",
      description: "Salted rice triangle wrapped around savory filling — Japan's original fast food.",
      blurb: "Heian nobles ate rice balls; modern commuters still grab them from convenience stores.",
      inputs: ["jpn_rice_ball_base", "water"],
      transitionDescription: "You shaped and salted the rice into a finished onigiri.",
      transitionTip: "Wet your hands with salted water to mold rice around a savory center.",
      finalized: true
    },
    {
      id: "jpn_miso_soup",
      name: "Miso Soup",
      emoji: "🍵",
      category: "Pantry",
      description: "Morning miso broth with tofu and scallion — the rhythm of the Japanese table.",
      blurb: "Ichiju-sansai meals begin with miso shiru; the bowl resets the palate between dishes.",
      inputs: ["jpn_miso_broth", "spring_water"],
      transitionDescription: "Broth and spring water balanced into a gentle, everyday miso soup.",
      transitionTip: "Finish miso broth with a splash of spring water for a light breakfast soup.",
      finalized: true
    }
  ]
);
