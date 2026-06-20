import { buildCulturalPack } from "./helpers";

/** Scandinavian — rye, fish, potato, lingonberry, and northern preservation. */
export default buildCulturalPack(
  {
    id: "scandinavian",
    name: "Scandinavian",
    emoji: "🇸🇪",
    region: "Nordic countries",
    period: "Viking through Modern",
    synopsis:
      "Nordic cooks mastered preservation: gravlax, rye bread, fermented dairy, and root cellars. "
      + "Short growing seasons demanded smoking, salting, and pickling; butter and rye sustained long winters beside herring and lingon.",
    unlockCriteria: { discoveredRecipes: 26 }
  },
  {
    id: "scn_pantry",
    name: "Nordic Larder",
    emoji: "❄️",
    category: "Pantry",
    description: "Rye berries, herring, potato, and lingonberries.",
    blurb:
      "Vikings dried fish; medieval monasteries brewed beer from rye; modern New Nordic cuisine reclaimed foraging.",
    separationDescription: "You sorted rye, herring, potato, and lingonberries from the larder.",
    separationTip: "Nordic pantries separate grain, preserved fish, roots, and tart berries.",
    separations: [
      {
        id: "scn_rye_berry",
        name: "Rye Berry",
        emoji: "🌾",
        category: "Pantry",
        description: "Hard rye kernels for dense, sour breads.",
        blurb: "Rye thrives where wheat struggles — Nordic loaves are dark and long-keeping."
      },
      {
        id: "scn_herring",
        name: "Atlantic Herring",
        emoji: "🐟",
        category: "Proteins",
        description: "Oily fish — salted, smoked, or cured raw.",
        blurb: "Herring shoals fed empires; Baltic trade wars were fought over fish."
      },
      {
        id: "scn_potato_var",
        name: "Nordic Potato",
        emoji: "🥔",
        category: "Forage",
        description: "Cold-climate potato — floury and storing well.",
        blurb: "Potatoes arrived late but became Nordic comfort — lefse and lapskaus depend on them."
      },
      {
        id: "scn_lingonberry",
        name: "Lingonberry",
        emoji: "🔴",
        category: "Produce",
        description: "Tart red berries from boreal forests.",
        blurb: "Lingon jam cuts rich meat — every Swedish meatball plate expects it."
      }
    ]
  },
  [
    {
      id: "scn_rye_flour",
      name: "Rye Flour",
      emoji: "🌾",
      category: "Pantry",
      description: "Stone-ground rye for sourdough.",
      blurb: "Rugbrød ferments for days — flavor from time, not yeast alone.",
      input: "scn_rye_berry",
      tools: ["grind", "press"],
      transitionDescription: "Rye berries milled into dark, aromatic flour.",
      transitionTip: "Grind rye berries into flour for Nordic bread."
    },
    {
      id: "scn_salted_herring",
      name: "Salted Herring",
      emoji: "🧂",
      category: "Proteins",
      description: "Herring packed in salt for long storage.",
      blurb: "Salt cod and herring built trade routes — protein that crossed oceans.",
      input: "scn_herring",
      tools: ["press", "pound"],
      transitionDescription: "Herring layered with salt until firm and preserved.",
      transitionTip: "Salt and press herring for traditional preservation."
    },
    {
      id: "scn_boiled_potato",
      name: "Boiled Potato",
      emoji: "🥔",
      category: "Forage",
      description: "Simple boiled potato — foundation of Nordic plates.",
      blurb: "Dill and butter transform boiled potatoes into ceremony.",
      input: "scn_potato_var",
      tools: ["boil", "simmer"],
      transitionDescription: "Potatoes boiled until fluffy and splitting at the skin.",
      transitionTip: "Boil Nordic potatoes until tender for smashing or salad."
    },
    {
      id: "scn_lingon_jam",
      name: "Lingon Jam",
      emoji: "🫙",
      category: "Produce",
      description: "Sweet-tart preserved lingonberries.",
      blurb: "Wild lingon picking is family ritual; sugar preservation captures autumn.",
      input: "scn_lingonberry",
      tools: ["simmer", "cook"],
      transitionDescription: "Lingonberries simmered with sugar into ruby jam.",
      transitionTip: "Simmer lingonberries into tart jam for meat and bread."
    }
  ],
  [
    {
      id: "scn_gravlax_cure",
      name: "Gravlax Cure",
      emoji: "🐟",
      category: "Proteins",
      description: "Salt-sugar-dill cure for salmon-style preservation.",
      blurb: "Gravlax means 'grave salmon' — Vikings buried fish in sand to ferment gently.",
      inputs: ["scn_salted_herring", "shoots"],
      transitionDescription: "Salted herring cured with dill shoots into gravlax.",
      transitionTip: "Cure salted fish with dill for Nordic gravlax."
    },
    {
      id: "scn_rye_dough",
      name: "Rye Dough",
      emoji: "🍞",
      category: "Pantry",
      description: "Sour rye dough — dense and malty.",
      blurb: "Scandinavian rye bread stays edible for weeks — ship bread and soldier bread.",
      inputs: ["scn_rye_flour", "water"],
      transitionDescription: "Rye flour and water fermented into tangy dough.",
      transitionTip: "Mix rye flour with water for sour rye dough."
    },
    {
      id: "scn_gravlax_plate",
      name: "Gravlax Plate",
      emoji: "🍽️",
      category: "Proteins",
      description: "Cured fish sliced with potato, jam, and rye — smörgåsbord star.",
      blurb: "Christmas tables across Scandinavia open with gravlax and aquavit.",
      inputs: ["scn_gravlax_cure", "scn_boiled_potato"],
      transitionDescription: "Gravlax served with boiled potato — classic Nordic plate.",
      transitionTip: "Plate gravlax with boiled potato and lingon on the side.",
      finalized: true
    },
    {
      id: "scn_rugbrod",
      name: "Rugbrød",
      emoji: "🍞",
      category: "Pantry",
      description: "Dense Danish rye bread — seeds, sour, and sustaining.",
      blurb: "Open-faced smørrebrød demands thin slices of rugbrød; one loaf feeds a week.",
      inputs: ["scn_rye_dough", "scn_lingon_jam"],
      transitionDescription: "Rye dough baked dark and served with lingon jam.",
      transitionTip: "Bake rye dough into rugbrød and serve with lingon jam.",
      finalized: true
    }
  ]
);
