/**
 * Generates Part II regional cuisine entries for RECIPES_REFERENCE.md
 */

interface Dish {
  name: string;
  culture: string;
  region: string;
  era: "Stone Age" | "Ancient" | "Medieval" | "Industrial" | "Modern";
  difficulty: 1 | 2 | 3 | 4 | 5;
  primal: string;
  stages: Array<{ input: string; techniques: string; output: string }>;
  history: string;
  significance: string;
  category: string;
}

function renderDish(d: Dish): string {
  const rows = d.stages
    .map((s, i) => `| ${i + 1} | ${s.input} | ${s.techniques} | ${s.output} |`)
    .join("\n");
  return `#### ${d.name}
- **Origin:** ${d.culture} · ${d.region}
- **Era:** ${d.era}
- **Difficulty:** ${d.difficulty}
- **Category:** ${d.category}
- **Primal source:** ${d.primal}

**Process**

| Stage | Input | Techniques | Output |
|-------|-------|------------|--------|
${rows}

**Historical context:** ${d.history}

**Cultural significance:** ${d.significance}

---
`;
}

const dishes: Dish[] = [
  // CHINA
  {
    name: "Congee (Zhou)",
    culture: "Chinese",
    region: "North China",
    era: "Ancient",
    difficulty: 1,
    primal: "grasses (rice)",
    category: "Grain",
    stages: [
      { input: "rice, water", techniques: "hull, boil, mix", output: "congee" }
    ],
    history: "Rice porridge appears in Zhou dynasty texts as famine food and medicine.",
    significance: "Congee remains China's gentle staple for infants, elders, and convalescence."
  },
  {
    name: "Jiaozi (Dumplings)",
    culture: "Chinese",
    region: "Northern China",
    era: "Medieval",
    difficulty: 3,
    primal: "grasses (wheat), roots (pork filling proxy: roots/meat)",
    category: "Combined",
    stages: [
      { input: "wheat flour, water", techniques: "mill, mix, bind", output: "dough" },
      { input: "pork, cabbage, ginger", techniques: "clean, chop, mix, fill", output: "filling" },
      { input: "dough, filling", techniques: "wrap, boil, steam", output: "jiaozi" }
    ],
    history: "Dumplings spread during Han dynasty trade and became Lunar New Year symbols.",
    significance: "Jiaozi mean reunion — shape resembles ancient gold ingots for prosperity."
  },
  {
    name: "Peking Duck",
    culture: "Chinese",
    region: "Beijing",
    era: "Modern",
    difficulty: 5,
    primal: "poultry (not in game primitives)",
    category: "Meat",
    stages: [
      { input: "duck", techniques: "clean, coat (malt syrup), dry", output: "prepared duck" },
      { input: "duck", techniques: "heat (oven, hang-roast)", output: "roasted duck" },
      { input: "pancakes, scallion, hoisin", techniques: "steam, wrap", output: "Peking duck service" }
    ],
    history: "Imperial kitchens perfected air-dried duck roasting by the Yuan and Ming courts.",
    significance: "Peking duck is state banquet diplomacy — lacquered skin, ritual carving."
  },
  {
    name: "Mapo Tofu",
    culture: "Chinese",
    region: "Sichuan",
    era: "Modern",
    difficulty: 2,
    primal: "seeds (soybean), roots (ginger)",
    category: "Combined",
    stages: [
      { input: "soybeans", techniques: "soak, grind, boil, press", output: "tofu" },
      { input: "tofu, chili, doubanjiang, pork", techniques: "cube, heat, mix, coat", output: "mapo tofu" }
    ],
    history: "Chen Mapo popularized the dish in Chengdu during the Qing dynasty.",
    significance: "Mapo tofu defines ma-la — numbing peppercorn and chili as Sichuan identity."
  },
  {
    name: "Fried Rice (Chǎofàn)",
    culture: "Chinese",
    region: "Southern China",
    era: "Modern",
    difficulty: 2,
    primal: "grasses (rice), shoots (scallion), eggs",
    category: "Combined",
    stages: [
      { input: "cooked rice", techniques: "dry (day-old)", output: "separated rice" },
      { input: "rice, egg, oil, scallion", techniques: "heat, mix, coat", output: "fried rice" }
    ],
    history: "Leftover rice stir-frying minimized waste in busy port cities and teahouses.",
    significance: "Fried rice is wok hei in a bowl — resourceful comfort across the diaspora."
  },
  {
    name: "Hot Pot (Huǒguō)",
    culture: "Chinese",
    region: "Sichuan / Mongolia",
    era: "Medieval",
    difficulty: 3,
    primal: "mixed (meat, shoots, mushrooms, tubers)",
    category: "Combined",
    stages: [
      { input: "bones, spices, chili", techniques: "boil, simmer", output: "broth" },
      { input: "sliced meat, vegetables", techniques: "clean, strip, layer", output: "raw platters" },
      { input: "broth, ingredients", techniques: "boil, dip, mix (sauce)", output: "hot pot meal" }
    ],
    history: "Mongolian boiling vessels merged with Sichuan spice along trade routes.",
    significance: "Hot pot is communal winter theater — everyone cooks at the table."
  },
  {
    name: "Mooncake",
    culture: "Chinese",
    region: "China",
    era: "Medieval",
    difficulty: 4,
    primal: "grasses (wheat), seeds (lotus paste)",
    category: "Fruit/Grain",
    stages: [
      { input: "flour, syrup, oil", techniques: "mix, bind", output: "pastry" },
      { input: "lotus seeds", techniques: "boil, grind, mix, fill", output: "filled cakes" },
      { input: "cakes", techniques: "heat (bake), coat (egg wash)", output: "mooncakes" }
    ],
    history: "Mid-Autumn Festival cakes commemorated rebellion messages in Yuan legend.",
    significance: "Mooncakes are reunion under full moon — dense sweetness shared in slices."
  },
  {
    name: "Wonton Soup",
    culture: "Chinese",
    region: "Cantonese",
    era: "Modern",
    difficulty: 3,
    primal: "grasses (wheat), shellfish (shrimp)",
    category: "Combined",
    stages: [
      { input: "flour, water", techniques: "mix, roll, wrap", output: "wonton skins" },
      { input: "shrimp, pork", techniques: "clean, grind, mix, fill", output: "wontons" },
      { input: "wontons, broth", techniques: "boil, steam", output: "wonton soup" }
    ],
    history: "Cantonese teahouses served wontons with noodles as dim sum breakfast.",
    significance: "Wonton soup is Hong Kong soul food — silk skins in clear broth."
  },
  {
    name: "Dan Dan Noodles",
    culture: "Chinese",
    region: "Sichuan",
    era: "Modern",
    difficulty: 3,
    primal: "grasses (wheat), seeds (sesame)",
    category: "Grain",
    stages: [
      { input: "wheat flour", techniques: "mill, mix, pound", output: "noodles" },
      { input: "noodles", techniques: "boil", output: "cooked noodles" },
      { input: "noodles, chili oil, sesame, pork", techniques: "mix, coat", output: "dan dan noodles" }
    ],
    history: "Street vendors carried dan dan poles selling noodles in Chengdu markets.",
    significance: "Dan dan noodles are spicy street energy — nutty, fiery, impossible to share politely."
  },
  {
    name: "Char Siu (BBQ Pork)",
    culture: "Chinese",
    region: "Cantonese",
    era: "Modern",
    difficulty: 3,
    primal: "poultry/meat",
    category: "Meat",
    stages: [
      { input: "pork shoulder", techniques: "strip, coat (marinade)", output: "marinated pork" },
      { input: "pork", techniques: "heat (roast), smoke (optional)", output: "char siu" }
    ],
    history: "Southern Chinese roasting forks adapted to sweet fermented red glaze.",
    significance: "Char siu hangs in every Cantonese window — caramel edge, roast aroma."
  },
  // JAPAN
  {
    name: "Ramen",
    culture: "Japanese",
    region: "Yokohama / nationwide",
    era: "Modern",
    difficulty: 4,
    primal: "grasses (wheat), shellfish/pork bones",
    category: "Combined",
    stages: [
      { input: "wheat flour", techniques: "mill, mix, pound", output: "noodles" },
      { input: "bones, soy", techniques: "boil, simmer, ferment", output: "broth" },
      { input: "noodles, broth, toppings", techniques: "boil, layer, fill", output: "ramen bowl" }
    ],
    history: "Chinese wheat noodles met Japanese dashi after Meiji opening to trade.",
    significance: "Ramen is regional pride — tonkotsu, shoyu, miso as edible geography."
  },
  {
    name: "Tempura",
    culture: "Japanese",
    region: "Nagasaki / Edo",
    era: "Medieval",
    difficulty: 3,
    primal: "shellfish (shrimp), shoots (vegetables)",
    category: "Seafood",
    stages: [
      { input: "shrimp, vegetables", techniques: "clean, peel", output: "prepared items" },
      { input: "flour, water, egg", techniques: "mix, coat", output: "battered items" },
      { input: "battered items", techniques: "heat (deep fry)", output: "tempura" }
    ],
    history: "Portuguese fritters influenced Japanese oil-frying during Edo isolation trade windows.",
    significance: "Tempura is crisp minimalism — batter lighter than the ingredient inside."
  },
  {
    name: "Miso Soup",
    culture: "Japanese",
    region: "Japan",
    era: "Ancient",
    difficulty: 1,
    primal: "seeds (soybean), water",
    category: "Fermented",
    stages: [
      { input: "soybeans, koji", techniques: "ferment, grind", output: "miso paste" },
      { input: "miso, dashi", techniques: "mix, boil", output: "miso soup" }
    ],
    history: "Buddhist monks brought fermented soybean paste from China, adapted to Japanese dashi.",
    significance: "Miso soup opens nearly every Japanese meal — daily umami ritual."
  },
  {
    name: "Onigiri",
    culture: "Japanese",
    region: "Japan",
    era: "Medieval",
    difficulty: 1,
    primal: "grasses (rice)",
    category: "Grain",
    stages: [
      { input: "rice", techniques: "steam", output: "steamed rice" },
      { input: "rice, salt, filling", techniques: "mix, wrap, bind", output: "onigiri" }
    ],
    history: "Travelers carried salted rice balls before bento culture formalized.",
    significance: "Onigiri is portable comfort — triangle of rice, seaweed, memory."
  },
  {
    name: "Okonomiyaki",
    culture: "Japanese",
    region: "Osaka / Hiroshima",
    era: "Modern",
    difficulty: 3,
    primal: "grasses (wheat), shoots (cabbage)",
    category: "Combined",
    stages: [
      { input: "flour, eggs, cabbage", techniques: "mix, layer", output: "batter" },
      { input: "batter", techniques: "heat (griddle), flip", output: "cooked pancake" },
      { input: "pancake", techniques: "coat (sauce, mayo, bonito)", output: "okonomiyaki" }
    ],
    history: "Post-war flour surplus fueled savory pancake stalls in Osaka streets.",
    significance: "Okonomiyaki means 'as you like it' — diner chooses toppings at the griddle."
  },
  {
    name: "Tonkatsu",
    culture: "Japanese",
    region: "Tokyo",
    era: "Modern",
    difficulty: 3,
    primal: "pork/meat",
    category: "Meat",
    stages: [
      { input: "pork cutlet", techniques: "pound, coat (flour, egg, panko)", output: "breaded cutlet" },
      { input: "cutlet", techniques: "heat (fry)", output: "tonkatsu" }
    ],
    history: "Western cutlets arrived in Meiji era and were breaded with Japanese panko.",
    significance: "Tonkatsu with shredded cabbage is yōshoku comfort — Western form, Japanese soul."
  },
  {
    name: "Yakitori",
    culture: "Japanese",
    region: "Japan",
    era: "Modern",
    difficulty: 2,
    primal: "poultry",
    category: "Meat",
    stages: [
      { input: "chicken", techniques: "clean, strip, cube", output: "chicken pieces" },
      { input: "pieces", techniques: "skewer, coat (tare), heat (grill)", output: "yakitori" }
    ],
    history: "Edo street stalls grilled skewered chicken over charcoal after meat bans eased.",
    significance: "Yakitori izakaya culture turns every chicken part into smoky delicacy."
  },
  {
    name: "Matcha Wagashi",
    culture: "Japanese",
    region: "Kyoto",
    era: "Modern",
    difficulty: 4,
    primal: "seeds (beans), grasses (rice flour)",
    category: "Fruit/Fermented",
    stages: [
      { input: "azuki beans", techniques: "boil, grind, mix", output: "bean paste" },
      { input: "rice flour, sugar, matcha", techniques: "mix, steam, wrap", output: "wagashi" }
    ],
    history: "Tea ceremony aesthetics demanded seasonal sweets paired with bitter matcha.",
    significance: "Wagashi are edible art — moon, maple, and season in one bite."
  },
  // KOREA
  {
    name: "Bibimbap",
    culture: "Korean",
    region: "Jeonju",
    era: "Modern",
    difficulty: 2,
    primal: "grasses (rice), shoots, roots, eggs",
    category: "Combined",
    stages: [
      { input: "rice", techniques: "steam", output: "rice" },
      { input: "vegetables, beef, egg", techniques: "clean, heat, layer", output: "toppings" },
      { input: "rice, toppings, gochujang", techniques: "mix, coat", output: "bibimbap" }
    ],
    history: "Royal court banchan merged with peasant stone bowls in Jeonju tradition.",
    significance: "Bibimbap is harmony in a bowl — color, texture, and heat before mixing."
  },
  {
    name: "Kimchi Jjigae",
    culture: "Korean",
    region: "Korea",
    era: "Modern",
    difficulty: 2,
    primal: "roots (cabbage/radish), fermented",
    category: "Fermented",
    stages: [
      { input: "aged kimchi, pork, tofu", techniques: "chop, boil, simmer", output: "kimchi jjigae" }
    ],
    history: "Sour kimchi too fermented for fresh eating becomes stew base in every household.",
    significance: "Kimchi jjigae is home after work — spicy, sour, deeply familiar steam."
  },
  {
    name: "Galbi (Marinated Ribs)",
    culture: "Korean",
    region: "Korea",
    era: "Modern",
    difficulty: 3,
    primal: "meat",
    category: "Meat",
    stages: [
      { input: "beef short ribs", techniques: "clean, score, coat (marinade)", output: "marinated ribs" },
      { input: "ribs", techniques: "heat (grill)", output: "galbi" }
    ],
    history: "Pear-tenderized soy marinades define Korean barbecue alongside tabletop grills.",
    significance: "Galbi at Korean BBQ is celebration — scissors, lettuce wraps, shared fire."
  },
  {
    name: "Japchae",
    culture: "Korean",
    region: "Korea",
    era: "Modern",
    difficulty: 3,
    primal: "tubers (sweet potato starch noodles)",
    category: "Combined",
    stages: [
      { input: "sweet potato starch", techniques: "mix, press, dry, boil", output: "glass noodles" },
      { input: "noodles, vegetables, beef", techniques: "heat, mix, coat (sesame)", output: "japchae" }
    ],
    history: "Joseon court feast dish using Chinese glass noodle technique with Korean vegetables.",
    significance: "Japchae marks holidays — slippery noodles, sesame shine, festive color."
  },
  {
    name: "Tteokbokki",
    culture: "Korean",
    region: "Seoul",
    era: "Modern",
    difficulty: 2,
    primal: "grasses (rice)",
    category: "Grain",
    stages: [
      { input: "rice flour", techniques: "pound, steam, shape", output: "rice cakes (tteok)" },
      { input: "tteok, gochujang", techniques: "boil, coat", output: "tteokbokki" }
    ],
    history: "Street vendors in 1950s Seoul popularized spicy sauce on chewy rice cylinders.",
    significance: "Tteokbokki is after-school nostalgia — sweet heat at pojangmacha stalls."
  },
  {
    name: "Sundubu Jjigae",
    culture: "Korean",
    region: "Korea",
    era: "Modern",
    difficulty: 2,
    primal: "seeds (soybean)",
    category: "Combined",
    stages: [
      { input: "soft tofu, seafood, kimchi", techniques: "boil, simmer, fill (egg)", output: "sundubu jjigae" }
    ],
    history: "Soft silken tofu stews gained popularity with Korean seafood and chili paste.",
    significance: "Sundubu arrives bubbling in stone — comfort that scorches the tongue."
  }
];

// Continue with more cultures in batches - I'll add TH, VN, IN, etc.

const byCulture = new Map<string, Dish[]>();
for (const d of dishes) {
  if (!byCulture.has(d.culture)) byCulture.set(d.culture, []);
  byCulture.get(d.culture)!.push(d);
}

let out = "\n## Part II: Regional Cuisine Compendium\n\n";
out += "Expanded coverage organized by culture. Each entry uses the canonical technique set and maps to game primals where possible.\n\n";

for (const [culture, list] of [...byCulture.entries()].sort()) {
  out += `### ${culture}\n\n`;
  for (const d of list) {
    out += renderDish(d);
  }
}

process.stdout.write(out);
