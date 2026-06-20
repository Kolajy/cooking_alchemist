import { buildCulturalPack } from "./helpers";

/** Greek — barley, olive, feta, phyllo, and Mediterranean sun. */
export default buildCulturalPack(
  {
    id: "greek",
    name: "Greek",
    emoji: "🇬🇷",
    region: "Greece",
    period: "Ancient through Byzantine",
    synopsis:
      "Greek cuisine bridges ancient and modern: barley before rice, olive oil before butter, wine and honey in temple feasts. "
      + "Village ovens baked bread; coastal cooks wrapped greens in grape leaves and layered eggplant with lamb and béchamel's ancestor.",
    unlockCriteria: { discoveredRecipes: 22 }
  },
  {
    id: "grc_market",
    name: "Greek Agora Basket",
    emoji: "🏛️",
    category: "Pantry",
    description: "Barley, fresh curd, olives, and grape leaves.",
    blurb:
      "Athenian agoras sold oil and grain; Byzantine monks preserved recipes that still fill Easter tables.",
    separationDescription: "You sorted barley, curd, olives, and grape leaves from the agora basket.",
    separationTip: "Greek markets separate grain, dairy, oil fruit, and wrapping leaves.",
    separations: [
      {
        id: "grc_barley",
        name: "Barley Grain",
        emoji: "🌾",
        category: "Pantry",
        description: "Ancient staple grain — nutty and filling.",
        blurb: "Hesiod's farmers ate barley bread; it fed hoplites before marches."
      },
      {
        id: "grc_feta_curd",
        name: "Feta Curd",
        emoji: "🧀",
        category: "Proteins",
        description: "Salty sheep's-milk curd for crumbling over salads and pies.",
        blurb: "Feta is EU-protected Greek heritage — brined, tangy, and indispensable."
      },
      {
        id: "grc_olive",
        name: "Kalamata Olive",
        emoji: "🫒",
        category: "Produce",
        description: "Dark, meaty olive for oil and eating.",
        blurb: "Athena's gift of the olive tree beat Poseidon's horse — myth encodes economics."
      },
      {
        id: "grc_grape_leaf",
        name: "Grape Leaf",
        emoji: "🍃",
        category: "Forage",
        description: "Tender leaves for stuffing and wrapping.",
        blurb: "Dolmades appear from Greece to the Levant — rice and herbs in a green parcel."
      }
    ]
  },
  [
    {
      id: "grc_barley_meal",
      name: "Barley Meal",
      emoji: "🌾",
      category: "Pantry",
      description: "Coarse ground barley for porridge and bread.",
      blurb: "Maza — barley meal mixed with water — was ancient fast food.",
      input: "grc_barley",
      tools: ["grind", "pound"],
      transitionDescription: "Barley ground into coarse, fragrant meal.",
      transitionTip: "Grind barley into meal for traditional breads."
    },
    {
      id: "grc_olive_oil",
      name: "Greek Olive Oil",
      emoji: "🫒",
      category: "Pantry",
      description: "Green, peppery oil from cold-pressed olives.",
      blurb: "Greek households measure health in liters of family oil per year.",
      input: "grc_olive",
      tools: ["press"],
      transitionDescription: "Olives pressed into sharp, green-gold oil.",
      transitionTip: "Cold-press olives for finishing and cooking oil."
    },
    {
      id: "grc_crumbled_feta",
      name: "Crumbled Feta",
      emoji: "🧀",
      category: "Proteins",
      description: "Feta broken into salty crumbles.",
      blurb: "Feta on hot food softens; on salad it stays sharp.",
      input: "grc_feta_curd",
      tools: ["crumble", "tear"],
      transitionDescription: "Feta torn into chunky, salty crumbles.",
      transitionTip: "Crumble feta over pies and salads."
    },
    {
      id: "grc_blanched_leaves",
      name: "Blanched Grape Leaves",
      emoji: "🍃",
      category: "Forage",
      description: "Leaves softened for rolling dolmades.",
      blurb: "Blanching tenderizes leaves without losing the green snap.",
      input: "grc_grape_leaf",
      tools: ["boil", "simmer"],
      transitionDescription: "Grape leaves blanched until pliable for stuffing.",
      transitionTip: "Blanch grape leaves briefly before filling."
    }
  ],
  [
    {
      id: "grc_spanakopita_filling",
      name: "Spanakopita Filling",
      emoji: "🥬",
      category: "Produce",
      description: "Greens and feta mixed for phyllo pies.",
      blurb: "Spinach pies feed crowds at Greek festivals — feta must dominate.",
      inputs: ["grc_crumbled_feta", "shoots"],
      transitionDescription: "Feta and tender shoots folded into pie filling.",
      transitionTip: "Mix crumbled feta with greens for spanakopita."
    },
    {
      id: "grc_dolma_filling",
      name: "Dolma Filling",
      emoji: "🍃",
      category: "Forage",
      description: "Herbed grain filling for wrapped grape leaves.",
      blurb: "Dolmadakia are bite-sized rolls — lemon juice is mandatory at the end.",
      inputs: ["grc_barley_meal", "grc_blanched_leaves"],
      transitionDescription: "Barley meal seasoned and ready to fill grape leaves.",
      transitionTip: "Season barley meal to stuff blanched grape leaves."
    },
    {
      id: "grc_spanakopita",
      name: "Spanakopita",
      emoji: "🥧",
      category: "Pantry",
      description: "Flaky pie of greens and feta — olive oil between every layer.",
      blurb: "Phyllo crackle defines spanakopita; home cooks buy sheets but still brush oil lovingly.",
      inputs: ["grc_spanakopita_filling", "grc_olive_oil"],
      transitionDescription: "Filling layered with oil into golden spanakopita.",
      transitionTip: "Brush olive oil between layers and bake filled spanakopita.",
      finalized: true
    },
    {
      id: "grc_dolmades",
      name: "Dolmades",
      emoji: "🍃",
      category: "Forage",
      description: "Grape leaves rolled around herbed barley — meze classic.",
      blurb: "Ottoman kitchens spread dolma; Greek tavernas serve them cold with yogurt.",
      inputs: ["grc_dolma_filling", "water"],
      transitionDescription: "Stuffed leaves simmered in water until tender.",
      transitionTip: "Simmer filled grape leaves gently until cooked through.",
      finalized: true
    }
  ]
);
