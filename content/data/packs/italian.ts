import { buildCulturalPack } from "./helpers";

/** Italian — durum, tomato, olive oil, and regional pasta culture. */
export default buildCulturalPack(
  {
    id: "italian",
    name: "Italian",
    emoji: "🇮🇹",
    region: "Italy",
    period: "Roman through Renaissance",
    synopsis:
      "Italian food is regional mosaic: durum in the south, butter in the north, tomatoes after the Columbian exchange. "
      + "Olive oil, garlic, and slow sauces turned peasant ingredients into pasta al pomodoro and risotto — simplicity as philosophy.",
    unlockCriteria: { discoveredRecipes: 20 }
  },
  {
    id: "ita_market",
    name: "Italian Market",
    emoji: "🛒",
    category: "Pantry",
    description: "Durum wheat, tomato, olive, and garlic.",
    blurb:
      "Roman legions ate puls; medieval city-states traded oil and grain; tomatoes arrived and changed everything.",
    separationDescription: "You separated durum, tomato, olive, and garlic from the market sack.",
    separationTip: "Sort durum, tomato, olive, and garlic — the four pillars of la cucina italiana.",
    separations: [
      {
        id: "ita_durum_wheat",
        name: "Durum Wheat",
        emoji: "🌾",
        category: "Pantry",
        description: "Hard wheat for pasta and semolina.",
        blurb: "Durum's protein makes pasta that holds al dente bite — Italy protected its varieties fiercely."
      },
      {
        id: "ita_tomato",
        name: "Tomato",
        emoji: "🍅",
        category: "Produce",
        description: "Ripe plum tomato — sweet acid for sauce.",
        blurb: "Tomatoes were ornamental until Neapolitans married them to pasta in the 18th century."
      },
      {
        id: "ita_olive",
        name: "Olive",
        emoji: "🫒",
        category: "Produce",
        description: "Oil-rich fruit for pressing and eating.",
        blurb: "Greek colonists planted olives in Magna Graecia; millstones still turn in Puglia."
      },
      {
        id: "ita_garlic_clove",
        name: "Garlic Clove",
        emoji: "🧄",
        category: "Forage",
        description: "Pungent clove for soffritto and aglio e olio.",
        blurb: "Garlic divides Italy — some cooks hide it, others worship it."
      }
    ]
  },
  [
    {
      id: "ita_semolina",
      name: "Semolina",
      emoji: "🌾",
      category: "Pantry",
      description: "Coarse durum grind for pasta and couscous.",
      blurb: "Semola rimacinata is the gold standard for extruded pasta.",
      input: "ita_durum_wheat",
      tools: ["grind", "press"],
      transitionDescription: "Durum milled into golden semolina flour.",
      transitionTip: "Grind durum wheat into semolina for pasta."
    },
    {
      id: "ita_olive_oil",
      name: "Olive Oil",
      emoji: "🫒",
      category: "Pantry",
      description: "First-press extra virgin oil — grassy and peppery.",
      blurb: "Cold-pressed oil is salad dressing; later presses cook soffritto.",
      input: "ita_olive",
      tools: ["press"],
      transitionDescription: "Olives crushed until green-gold oil flowed free.",
      transitionTip: "Press olives for cooking and finishing oil."
    },
    {
      id: "ita_soffritto",
      name: "Soffritto",
      emoji: "🍳",
      category: "Produce",
      description: "Garlic gently cooked in olive oil — the flavor base.",
      blurb: "Soffritto is patience; browning garlic is tragedy.",
      input: "ita_garlic_clove",
      tools: ["fry", "simmer"],
      transitionDescription: "Garlic sweated slowly in olive oil until fragrant.",
      transitionTip: "Gently fry garlic in olive oil for soffritto — do not burn."
    },
    {
      id: "ita_crushed_tomato",
      name: "Crushed Tomato",
      emoji: "🍅",
      category: "Produce",
      description: "Tomatoes broken for sauce — skins and seeds included.",
      blurb: "San Marzano tomatoes grew in volcanic soil; DOP fights protect the name.",
      input: "ita_tomato",
      tools: ["smash", "pound"],
      transitionDescription: "Tomatoes crushed into rustic, juicy pulp.",
      transitionTip: "Crush ripe tomatoes for quick marinara."
    }
  ],
  [
    {
      id: "ita_marinara",
      name: "Marinara Sauce",
      emoji: "🍝",
      category: "Produce",
      description: "Tomato sauce built on soffritto.",
      blurb: "Marinara once fed sailors — quick, acidic, and shelf-stable at sea.",
      inputs: ["ita_crushed_tomato", "ita_soffritto"],
      transitionDescription: "Crushed tomato simmered into soffritto until unified.",
      transitionTip: "Simmer crushed tomato with soffritto for marinara."
    },
    {
      id: "ita_pasta_dough",
      name: "Pasta Dough",
      emoji: "🍝",
      category: "Pantry",
      description: "Semolina and water kneaded into smooth dough.",
      blurb: "00 flour vs. semolina debates rage; both make beautiful pasta.",
      inputs: ["ita_semolina", "water"],
      transitionDescription: "Semolina and water kneaded into elastic pasta dough.",
      transitionTip: "Knead semolina with water into pasta dough."
    },
    {
      id: "ita_pasta_pomodoro",
      name: "Pasta al Pomodoro",
      emoji: "🍝",
      category: "Pantry",
      description: "Pasta tossed in bright tomato sauce — Italy's weeknight anthem.",
      blurb: "Pomodoro is proof that restraint is luxury; good oil and tomato need little else.",
      inputs: ["ita_pasta_dough", "ita_marinara"],
      transitionDescription: "Fresh pasta coated in marinara — simple and luminous.",
      transitionTip: "Toss cooked pasta with marinara for pomodoro.",
      finalized: true
    },
    {
      id: "ita_risotto_base",
      name: "Risotto",
      emoji: "🍚",
      category: "Pantry",
      description: "Creamy rice stirred with olive oil and stock — northern comfort.",
      blurb: "Arborio rice arrived from the Po Valley; constant stirring releases starch.",
      inputs: ["ita_olive_oil", "ita_semolina"],
      transitionDescription: "Olive oil and semolina stirred into creamy risotto.",
      transitionTip: "Stir semolina with olive oil and stock for risotto texture.",
      finalized: true
    }
  ]
);
