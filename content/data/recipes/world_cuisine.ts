import { buildTechniqueItem, createTechniqueTransition, buildCombineItem, createCombineTransition } from "./_techniqueRecipe";
import { buildFinalizedRecipeItem } from "./_finalizedRecipe";

// Helper/Base ingredients that can be crafted
const extraBasics = {
  ...buildCombineItem(
    {
      id: "tofu",
      name: "Tofu",
      emoji: "⬜",
      category: "Pantry",
      description: "Pressed soybean curd.",
      blurb: "Pressing hot soy milk curds creates blocks of neutral, protein-rich tofu."
    },
    createCombineTransition(["seeds", "water", "salt"])
  ),
  ...buildCombineItem(
    {
      id: "gochujang",
      name: "Gochujang",
      emoji: "🍶",
      category: "Pantry",
      description: "Korean fermented red chili paste.",
      blurb: "Chili powder, rice flour, and fermented soy powder cured under the sun."
    },
    createCombineTransition(["chili", "rice_flour", "yeast"])
  ),
  ...buildCombineItem(
    {
      id: "soy_paste",
      name: "Miso / Soybean Paste",
      emoji: "🍶",
      category: "Pantry",
      description: "Rich, fermented soybean paste.",
      blurb: "Soybeans fermented with salt and grain cultures."
    },
    createCombineTransition(["seeds", "yeast"])
  ),
  ...buildTechniqueItem(
    {
      id: "tahini",
      name: "Tahini",
      emoji: "🥣",
      category: "Pantry",
      description: "Toasted sesame paste.",
      blurb: "Sesame seeds ground into a smooth, savory paste."
    },
    createTechniqueTransition("sesame", ["grind", "pound"], "tahini")
  ),
  ...buildTechniqueItem(
    {
      id: "rice_flour",
      name: "Rice Flour",
      emoji: "🌾",
      category: "Pantry",
      description: "Powdered rice grains.",
      blurb: "Shattered rice grains ground into fine flour."
    },
    createTechniqueTransition("rice", ["grind", "pound"], "rice_flour")
  ),
  ...buildCombineItem(
    {
      id: "shrimp_paste",
      name: "Shrimp Paste",
      emoji: "🫙",
      category: "Pantry",
      description: "Pungent fermented shrimp seasoning paste.",
      blurb: "Crushed shrimp salted and fermented under the sun."
    },
    createCombineTransition(["shrimp", "yeast"])
  ),
  // Processed ingredients derived from raw ingredients
  ...buildTechniqueItem(
    {
      id: "cream",
      name: "Cream",
      emoji: "🥛",
      category: "Pantry",
      description: "Rich skimmed dairy cream.",
      blurb: "Cream naturally separates and rises to the top of fresh milk."
    },
    createTechniqueTransition("milk", "separate", "cream")
  ),
  ...buildCombineItem(
    {
      id: "butter",
      name: "Butter",
      emoji: "🧈",
      category: "Pantry",
      description: "Salted churned butter.",
      blurb: "Churning heavy cream separates butterfat from buttermilk."
    },
    createCombineTransition(["cream", "salt"])
  ),
  ...buildTechniqueItem(
    {
      id: "yogurt",
      name: "Yogurt",
      emoji: "🥛",
      category: "Pantry",
      description: "Fermented creamy yogurt.",
      blurb: "Milk fermented with active bacterial cultures."
    },
    createTechniqueTransition("milk", "ferment", "yogurt")
  ),
  ...buildCombineItem(
    {
      id: "cheese",
      name: "Cheese",
      emoji: "🧀",
      category: "Pantry",
      description: "Fresh coagulated milk cheese.",
      blurb: "Coagulating milk using acidic juices separates curds from whey."
    },
    createCombineTransition(["milk", "citrus"])
  ),
  ...buildTechniqueItem(
    {
      id: "yeast",
      name: "Yeast",
      emoji: "🦠",
      category: "Pantry",
      description: "Wild cultivated yeast starter.",
      blurb: "Cultivating wild yeasts by fermenting fruit skins in water."
    },
    createTechniqueTransition("fruits", "ferment", "yeast")
  ),
  ...buildTechniqueItem(
    {
      id: "salt",
      name: "Salt",
      emoji: "🧂",
      category: "Pantry",
      description: "Pure mineral sea salt.",
      blurb: "Evaporating water over low heat yields crystalline salt."
    },
    createTechniqueTransition("water", ["cook", "boil"], "salt")
  ),
  ...buildCombineItem(
    {
      id: "baguette",
      name: "Baguette",
      emoji: "🥖",
      category: "Pantry",
      description: "Crispy long French bread.",
      blurb: "Raw wheat flour dough baked in a hot hearth oven."
    },
    createCombineTransition(["dough", "yeast"])
  ),
  ...buildCombineItem(
    {
      id: "cured_pork",
      name: "Cured Pork",
      emoji: "🥓",
      category: "Pantry",
      description: "Salted cured pork.",
      blurb: "Salting pork cures the meat, preventing spoilage."
    },
    createCombineTransition(["pork", "salt"])
  )
};

const tonkotsu_ramen = buildCombineItem(
  {
    id: "tonkotsu_ramen",
    name: "Tonkotsu Ramen",
    emoji: "🍜",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Rich, slow-simmered pork bone broth served with noodles.",
    blurb: "A Japanese masterpiece: pork bones are boiled for hours until the marrow and collagen emulsify into a creamy, white broth."
  },
  createCombineTransition(['pork', 'water', 'rice_flour'])
);

const mapo_tofu = buildCombineItem(
  {
    id: "mapo_tofu",
    name: "Mapo Tofu",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Spicy Sichuan tofu with minced pork and chili oil.",
    blurb: "A famous Sichuan dish featuring soft tofu cubes bathed in a bright red, oily, and spicy sauce."
  },
  createCombineTransition(['tofu', 'chili', 'pork'])
);

const bibimbap = buildCombineItem(
  {
    id: "bibimbap",
    name: "Bibimbap",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Korean warm rice topped with seasoned vegetables and gochujang.",
    blurb: "Literally 'mixed rice'—a colorful bowl of rice, sautéed vegetables, meat, and sweet-spicy gochujang sauce."
  },
  createCombineTransition(['rice', 'roots', 'egg', 'gochujang'])
);

const kimchi = buildCombineItem(
  {
    id: "kimchi",
    name: "Kimchi",
    emoji: "🥬",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Spiced and fermented napa cabbage.",
    blurb: "The soul of Korean cuisine: crisp cabbage salted and fermented with chili, garlic, and ginger."
  },
  createCombineTransition(['cabbage', 'chili', 'salt'])
);

const char_siu = buildCombineItem(
  {
    id: "char_siu",
    name: "Char Siu",
    emoji: "🥓",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Sweet, Cantonese barbecued roasted pork.",
    blurb: "Pork marinated in honey, soy, and spices, then roasted over high heat to create a caramelized glaze."
  },
  createCombineTransition(['pork', 'honey', 'soy_sauce'])
);

const sukiyaki = buildCombineItem(
  {
    id: "sukiyaki",
    name: "Sukiyaki",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Hot pot of beef and vegetables simmered in sweet soy sauce.",
    blurb: "Thinly sliced beef, tofu, and vegetables slowly simmered at the table in a shallow iron pot of sweet soy sauce broth."
  },
  createCombineTransition(['beef', 'soy_sauce', 'water'])
);

const peking_duck = buildCombineItem(
  {
    id: "peking_duck",
    name: "Peking Duck",
    emoji: "🦆",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Crispy-skinned imperial roasted whole duck.",
    blurb: "A legendary Beijing dish prized for its thin, crispy skin, served with sweet bean sauce and thin pancakes."
  },
  createCombineTransition(['duck', 'honey', 'soy_sauce'])
);

const japchae = buildCombineItem(
  {
    id: "japchae",
    name: "Japchae",
    emoji: "🍜",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Korean sweet potato glass noodles stir-fried with vegetables.",
    blurb: "Chewy sweet potato starch noodles tossed with colorful vegetables and seasoned with sesame oil and soy sauce."
  },
  createCombineTransition(['sweet_potato', 'roots', 'soy_sauce'])
);

const congee = buildCombineItem(
  {
    id: "congee",
    name: "Congee",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Slow-simmered rice porridge.",
    blurb: "A gentle, comforting rice soup simmered in water or broth until the grains break down completely."
  },
  createCombineTransition(['rice', 'water'])
);

const miso_soup = buildCombineItem(
  {
    id: "miso_soup",
    name: "Miso Soup",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Traditional Japanese fermented soybean paste broth.",
    blurb: "A simple yet profound soup made by whisking fermented miso paste into dashi broth."
  },
  createCombineTransition(['soy_paste', 'water'])
);

const xiaolongbao = buildCombineItem(
  {
    id: "xiaolongbao",
    name: "Dim Sum (Xiaolongbao)",
    emoji: "🥟",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Shanghai-style steamed soup dumplings.",
    blurb: "Delicate wheat dumplings filled with seasoned pork and a rich stock that melts into soup when steamed."
  },
  createCombineTransition(['flour', 'pork', 'water'])
);

const tteokbokki = buildCombineItem(
  {
    id: "tteokbokki",
    name: "Tteokbokki",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Chewy rice cakes simmered in sweet and spicy chili paste.",
    blurb: "A popular Korean street food made of cylindrical boiled rice cakes tossed in a fiery gochujang sauce."
  },
  createCombineTransition(['rice', 'gochujang', 'water'])
);

const okonomiyaki = buildCombineItem(
  {
    id: "okonomiyaki",
    name: "Okonomiyaki",
    emoji: "🥞",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Savory Japanese cabbage pancake.",
    blurb: "A grilled batter pancake loaded with shredded cabbage and pork, topped with savory sauce."
  },
  createCombineTransition(['flour', 'cabbage', 'egg', 'pork'])
);

const hot_pot = buildCombineItem(
  {
    id: "hot_pot",
    name: "Hot Pot",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Communal simmering hot pot broth with meats and vegetables.",
    blurb: "A gathering dish where diners cook raw meats, seafood, and vegetables in a central pot of bubbling broth."
  },
  createCombineTransition(['water', 'beef', 'cabbage', 'chili'])
);

const tempura = buildCombineItem(
  {
    id: "tempura",
    name: "Tempura",
    emoji: "🍤",
    type: "recipe",
    origin: "processed",
    category: "East Asian",
    description: "Light and crispy battered, flash-fried seafood or vegetables.",
    blurb: "An Edo-period classic: seafood and vegetables dipped in a chilled flour-and-egg batter, then fried to golden perfection."
  },
  createCombineTransition(['flour', 'egg', 'shrimp'])
);

const pho_bo = buildCombineItem(
  {
    id: "pho_bo",
    name: "Pho Bo",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Vietnamese beef noodle soup with charred aromatics.",
    blurb: "Fragrant beef bone broth infused with charred ginger, onions, and spices, poured over rice noodles."
  },
  createCombineTransition(['beef', 'water', 'ginger', 'rice'])
);

const tom_yum_goong = buildCombineItem(
  {
    id: "tom_yum_goong",
    name: "Tom Yum Goong",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Hot and sour Thai shrimp soup.",
    blurb: "A fiery Thai soup cooked with lemongrass, lime leaf, chili, and fresh shrimp."
  },
  createCombineTransition(['shrimp', 'water', 'chili', 'citrus'])
);

const rendang = buildCombineItem(
  {
    id: "rendang",
    name: "Rendang",
    emoji: "🥩",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Slow-braised caramelized coconut beef curry.",
    blurb: "Beef slow-cooked in coconut milk and spices until the liquid evaporates, leaving the meat tender and caramelized."
  },
  createCombineTransition(['beef', 'coconuts', 'chili'])
);

const pad_thai = buildCombineItem(
  {
    id: "pad_thai",
    name: "Pad Thai",
    emoji: "🍜",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Stir-fried Thai rice noodles.",
    blurb: "Rice noodles stir-fried with shrimp, tofu, eggs, tamarind, and peanuts."
  },
  createCombineTransition(['rice', 'egg', 'peanuts', 'shrimp'])
);

const banh_mi = buildCombineItem(
  {
    id: "banh_mi",
    name: "Banh Mi",
    emoji: "🥖",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Vietnamese baguette filled with savory meats and pickled vegetables.",
    blurb: "A French-colonial fusion: crispy baguette spread with pâté, filled with pork, cilantro, and pickled carrots."
  },
  createCombineTransition(['baguette', 'pork', 'carrot'])
);

const satay = buildCombineItem(
  {
    id: "satay",
    name: "Satay",
    emoji: "🍢",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Grilled skewered meat served with peanut sauce.",
    blurb: "Skewered marinated meat grilled over wood coals, served with a rich, spicy peanut dip."
  },
  createCombineTransition(['chicken', 'peanuts'])
);

const laksa = buildCombineItem(
  {
    id: "laksa",
    name: "Laksa",
    emoji: "🍜",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Spicy coconut curry noodle soup.",
    blurb: "A rich Peranakan noodle soup combining a spicy coconut milk broth with fish cakes and tofu puff."
  },
  createCombineTransition(['rice', 'coconuts', 'shrimp', 'chili'])
);

const green_papaya_salad = buildCombineItem(
  {
    id: "green_papaya_salad",
    name: "Green Papaya Salad",
    emoji: "🥗",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Pounded spicy and sour raw papaya salad.",
    blurb: "Shredded unripe papaya pounded in a mortar with lime juice, chili, fish sauce, and peanuts."
  },
  createCombineTransition(['fruits', 'chili', 'peanuts', 'citrus'])
);

const nasi_goreng = buildCombineItem(
  {
    id: "nasi_goreng",
    name: "Nasi Goreng",
    emoji: "🍛",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Indonesian fried rice flavored with sweet soy and shrimp paste.",
    blurb: "Rice stir-fried with sweet soy sauce, garlic, tamarind, chili, and pungent shrimp paste."
  },
  createCombineTransition(['rice', 'shrimp_paste', 'chili'])
);

const spring_rolls = buildCombineItem(
  {
    id: "spring_rolls",
    name: "Spring Rolls",
    emoji: "🌯",
    type: "recipe",
    origin: "processed",
    category: "Southeast Asian",
    description: "Fresh rice paper wrapped rolls.",
    blurb: "Fresh salad, herbs, and shrimp wrapped in thin translucent rice paper sheets."
  },
  createCombineTransition(['rice', 'shrimp', 'shoots'])
);

const butter_chicken = buildCombineItem(
  {
    id: "butter_chicken",
    name: "Butter Chicken",
    emoji: "🍗",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Mild, creamy tomato curry with tandoori chicken.",
    blurb: "Tender spiced chicken simmered in a velvety sauce of butter, cream, tomatoes, and spices."
  },
  createCombineTransition(['chicken', 'tomato', 'cream'])
);

const biryani = buildCombineItem(
  {
    id: "biryani",
    name: "Biryani",
    emoji: "🍛",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Layered spiced rice and marinated meat.",
    blurb: "A celebratory South Asian dish of spiced basmati rice layered with meat and cooked on slow heat."
  },
  createCombineTransition(['rice', 'chicken', 'seeds'])
);

const dal = buildCombineItem(
  {
    id: "dal",
    name: "Dal",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Slow-simmered spiced lentils.",
    blurb: "A staple Indian dish of split lentils simmered with turmeric and tempered with spiced oil."
  },
  createCombineTransition(['lentils', 'water'])
);

const tandoori_chicken = buildCombineItem(
  {
    id: "tandoori_chicken",
    name: "Tandoori Chicken",
    emoji: "🍗",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Spiced yogurt-marinated chicken roasted in a clay tandoor.",
    blurb: "Chicken marinated in yogurt and red spices, roasted at high heat in a clay oven."
  },
  createCombineTransition(['chicken', 'yogurt'])
);

const samosa = buildCombineItem(
  {
    id: "samosa",
    name: "Samosa",
    emoji: "🥟",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Fried pastry stuffed with spiced potatoes and peas.",
    blurb: "Crispy triangular pastry pockets filled with spiced potato and pea mash, then fried."
  },
  createCombineTransition(['flour', 'potato', 'seeds'])
);

const naan = buildCombineItem(
  {
    id: "naan",
    name: "Naan",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Leavened flatbread baked in a tandoor.",
    blurb: "Soft, pillowy leavened flatbread slapped onto the inside walls of a hot clay tandoor oven."
  },
  createCombineTransition(['flour', 'water', 'yeast'])
);

const saag = buildCombineItem(
  {
    id: "saag",
    name: "Saag",
    emoji: "🥬",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Slow-cooked spiced greens.",
    blurb: "Fresh spinach and mustard greens slow-simmered and puréed with ginger and spices."
  },
  createCombineTransition(['cabbage', 'water'])
);

const chana_masala = buildCombineItem(
  {
    id: "chana_masala",
    name: "Chana Masala",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Spiced chickpea stew.",
    blurb: "Plump chickpeas simmered in a tangy tomato, onion, and spice gravy."
  },
  createCombineTransition(['chickpeas', 'tomato', 'water'])
);

const vindaloo = buildCombineItem(
  {
    id: "vindaloo",
    name: "Vindaloo",
    emoji: "🍛",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Fiery, vinegar-marinated curry.",
    blurb: "A Goan curry blending Portuguese wine-and-glycine marinade with intense local chilies."
  },
  createCombineTransition(['pork', 'citrus', 'chili'])
);

const dosa = buildCombineItem(
  {
    id: "dosa",
    name: "Dosa",
    emoji: "🥞",
    type: "recipe",
    origin: "processed",
    category: "South Asian",
    description: "Crispy fermented rice and lentil crepe.",
    blurb: "A thin, crispy South Indian crepe made from a fermented batter of rice and black lentils."
  },
  createCombineTransition(['rice', 'lentils', 'water'])
);

const hummus = buildCombineItem(
  {
    id: "hummus",
    name: "Hummus",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Creamy chickpea and tahini dip.",
    blurb: "Cooked chickpeas ground smooth with tahini, olive oil, garlic, and lemon juice."
  },
  createCombineTransition(['chickpeas', 'tahini', 'citrus'])
);

const shawarma = buildCombineItem(
  {
    id: "shawarma",
    name: "Shawarma",
    emoji: "🥙",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Spit-roasted sliced meat wrapped in flatbread.",
    blurb: "Spiced lamb, chicken, or beef slow-roasted on a vertical spit and shaved into flatbread wraps."
  },
  createCombineTransition(['beef', 'flatbread'])
);

const falafel = buildCombineItem(
  {
    id: "falafel",
    name: "Falafel",
    emoji: "🧆",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Fried spiced chickpea patties.",
    blurb: "Herbed ground chickpea and fava bean balls deep-fried to a golden crust."
  },
  createCombineTransition(['chickpeas', 'flour'])
);

const kebab = buildCombineItem(
  {
    id: "kebab",
    name: "Kebab",
    emoji: "🍢",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Grilled skewered minced meat.",
    blurb: "Spiced minced lamb or beef molded onto metal skewers and seared over natural wood coals."
  },
  createCombineTransition(['beef', 'salt'])
);

const tabbouleh = buildCombineItem(
  {
    id: "tabbouleh",
    name: "Tabbouleh",
    emoji: "🥗",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Chopped parsley and bulgur salad.",
    blurb: "A fresh Levantine salad dominated by finely chopped parsley, mint, tomatoes, and bulgur wheat."
  },
  createCombineTransition(['basil', 'tomato', 'wheat'])
);

const baklava = buildCombineItem(
  {
    id: "baklava",
    name: "Baklava",
    emoji: "📐",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Layered pastry with nuts and sweet syrup.",
    blurb: "Dozens of paper-thin sheets of phyllo dough layered with ground nuts and sweetened with honey syrup."
  },
  createCombineTransition(['flour', 'nuts', 'honey'])
);

const shakshuka = buildCombineItem(
  {
    id: "shakshuka",
    name: "Shakshuka",
    emoji: "🍳",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Eggs poached in a spicy tomato and pepper sauce.",
    blurb: "A comforting breakfast dish of eggs gently simmered in a skillet of rich tomato sauce, onions, and peppers."
  },
  createCombineTransition(['egg', 'tomato', 'chili'])
);

const tahini = buildCombineItem(
  {
    id: "tahini",
    name: "Tahini",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Sesame seed paste.",
    blurb: "Sesame seeds toasted and ground into a thick, smooth paste."
  },
  createCombineTransition(['sesame', 'salt'])
);

const manakish = buildCombineItem(
  {
    id: "manakish",
    name: "Manakish",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Flatbread baked with za'atar.",
    blurb: "A popular Levantine breakfast flatbread topped with olive oil and fragrant za'atar herbs."
  },
  createCombineTransition(['dough', 'basil'])
);

const kibbeh = buildCombineItem(
  {
    id: "kibbeh",
    name: "Kibbeh",
    emoji: "🧆",
    type: "recipe",
    origin: "processed",
    category: "Middle Eastern",
    description: "Bulgur and meat croquettes.",
    blurb: "A shell of cracked bulgur wheat and beef stuffed with spiced pine nuts and minced meat."
  },
  createCombineTransition(['wheat', 'beef', 'nuts'])
);

const coq_au_vin = buildCombineItem(
  {
    id: "coq_au_vin",
    name: "Coq au Vin",
    emoji: "🍗",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Chicken braised in red wine with mushrooms.",
    blurb: "A classic French bistro stew: chicken pieces braised slowly in dry red wine with bacon and mushrooms."
  },
  createCombineTransition(['chicken', 'mushrooms'])
);

const bouillabaisse = buildCombineItem(
  {
    id: "bouillabaisse",
    name: "Bouillabaisse",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Saffron seafood stew.",
    blurb: "A traditional Provençal fish stew cooked with saffron, fennel, citrus peel, and mixed fish."
  },
  createCombineTransition(['whole_fish', 'shellfish', 'water'])
);

const risotto = buildCombineItem(
  {
    id: "risotto",
    name: "Risotto",
    emoji: "🍚",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Slow-stirred creamy rice broth.",
    blurb: "Italian rice cooked with hot broth added slowly, stirred continuously to release starches into a creamy glaze."
  },
  createCombineTransition(['rice', 'water'])
);

const pasta_carbonara = buildCombineItem(
  {
    id: "pasta_carbonara",
    name: "Pasta Carbonara",
    emoji: "🍝",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Roman pasta with egg, cheese, and cured pork.",
    blurb: "Hot pasta tossed with raw egg, pecorino cheese, and crispy guanciale, creating a rich sauce from residual heat."
  },
  createCombineTransition(['flour', 'egg', 'cured_pork', 'cheese'])
);

const paella = buildCombineItem(
  {
    id: "paella",
    name: "Paella",
    emoji: "🥘",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Spanish saffron rice with seafood.",
    blurb: "A famous Valencian rice dish flavored with saffron, cooked flat in a wide shallow pan with shrimp and shellfish."
  },
  createCombineTransition(['rice', 'shrimp', 'shellfish'])
);

const moussaka = buildCombineItem(
  {
    id: "moussaka",
    name: "Moussaka",
    emoji: "🥘",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Baked eggplant and meat casserole topped with béchamel.",
    blurb: "Layered sliced eggplant and spiced lamb, baked under a thick blanket of creamy béchamel sauce."
  },
  createCombineTransition(['eggplant', 'beef', 'milk'])
);

const tzatziki = buildCombineItem(
  {
    id: "tzatziki",
    name: "Tzatziki",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Yogurt, cucumber, and garlic dip.",
    blurb: "A cooling Greek dip of strained yogurt, grated cucumber, garlic, olive oil, and dill."
  },
  createCombineTransition(['yogurt', 'roots'])
);

const gazpacho = buildCombineItem(
  {
    id: "gazpacho",
    name: "Gazpacho",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Cold blended raw vegetable soup.",
    blurb: "An Andalusian cold soup made of blended ripe tomatoes, cucumbers, peppers, olive oil, and stale bread."
  },
  createCombineTransition(['tomato', 'roots'])
);

const caprese = buildCombineItem(
  {
    id: "caprese",
    name: "Caprese",
    emoji: "🥗",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Salad of fresh tomato, mozzarella, and basil.",
    blurb: "A simple Italian salad of sliced fresh mozzarella, ripe tomatoes, and sweet basil leaves."
  },
  createCombineTransition(['tomato', 'cheese', 'basil'])
);

const tortilla_espanola = buildCombineItem(
  {
    id: "tortilla_espanola",
    name: "Tortilla Española",
    emoji: "🍳",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Spanish egg and potato omelet.",
    blurb: "A thick Spanish omelet of sliced potatoes and onions cooked gently in olive oil, bound with beaten egg."
  },
  createCombineTransition(['egg', 'potato'])
);

const ratatouille = buildCombineItem(
  {
    id: "ratatouille",
    name: "Ratatouille",
    emoji: "🥘",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Stewed summer vegetables.",
    blurb: "A rustic Provençal stew of eggplant, zucchini, peppers, and tomatoes cooked in olive oil."
  },
  createCombineTransition(['eggplant', 'tomato'])
);

const pesto = buildCombineItem(
  {
    id: "pesto",
    name: "Pesto",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Mediterranean",
    description: "Pounded basil, pine nut, and olive oil paste.",
    blurb: "A bright green Genoese paste made by pounding fresh basil, pine nuts, garlic, cheese, and olive oil."
  },
  createCombineTransition(['basil', 'nuts', 'cheese'])
);

const cassoulet = buildCombineItem(
  {
    id: "cassoulet",
    name: "Cassoulet",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Slow-cooked bean and duck stew.",
    blurb: "A rich, slow-simmered casserole of white beans, duck confit, pork, and sausage from southern France."
  },
  createCombineTransition(['beans', 'duck', 'water'])
);

const croissant = buildCombineItem(
  {
    id: "croissant",
    name: "Croissant",
    emoji: "🥐",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Laminated buttery puff pastry.",
    blurb: "A crescent-shaped pastry made by folding butter into yeast dough repeatedly to create dozens of flaky layers."
  },
  createCombineTransition(['flour', 'butter', 'yeast'])
);

const onion_soup = buildCombineItem(
  {
    id: "onion_soup",
    name: "Onion Soup",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Caramelized onion broth topped with cheese toasted bread.",
    blurb: "Rich beef broth packed with sweet, deeply caramelized onions, baked under a crust of bread and Gruyère cheese."
  },
  createCombineTransition(['onion', 'water', 'cheese'])
);

const beef_bourguignon = buildCombineItem(
  {
    id: "beef_bourguignon",
    name: "Beef Bourguignon",
    emoji: "🥩",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Beef braised in red wine broth.",
    blurb: "Tender beef chuck slowly braised in red Burgundy wine, beef stock, garlic, carrots, and mushrooms."
  },
  createCombineTransition(['beef', 'water', 'mushrooms'])
);

const quiche = buildCombineItem(
  {
    id: "quiche",
    name: "Quiche",
    emoji: "🥧",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Savory egg custard pastry tart.",
    blurb: "A savory tart filled with a rich egg and cream custard, baked in a pastry shell."
  },
  createCombineTransition(['egg', 'cream', 'flour'])
);

const creme_brulee = buildCombineItem(
  {
    id: "creme_brulee",
    name: "Crème Brûlée",
    emoji: "🍮",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Vanilla custard with a torched sugar shell.",
    blurb: "A rich custard base topped with a layer of hardened caramelized sugar, torched to a crisp sheet."
  },
  createCombineTransition(['egg', 'cream', 'honey'])
);

const confit = buildCombineItem(
  {
    id: "confit",
    name: "Confit",
    emoji: "🥩",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Fat-preserved, slow-cooked duck or pork.",
    blurb: "An ancient preservation method: curing meat in salt, then slow-cooking it submerged in its own fat."
  },
  createCombineTransition(['duck', 'butter'])
);

const hollandaise = buildCombineItem(
  {
    id: "hollandaise",
    name: "Hollandaise",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "French",
    description: "Emulsified warm butter and egg yolk sauce.",
    blurb: "A warm emulsion of egg yolks, melted butter, and lemon juice, seasoned with cayenne pepper."
  },
  createCombineTransition(['egg', 'butter', 'citrus'])
);

const jollof_rice = buildCombineItem(
  {
    id: "jollof_rice",
    name: "Jollof Rice",
    emoji: "🍛",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "West African spiced tomato rice.",
    blurb: "A beloved West African staple: rice cooked in a rich, spiced tomato and onion sauce."
  },
  createCombineTransition(['rice', 'tomato', 'water'])
);

const injera = buildCombineItem(
  {
    id: "injera",
    name: "Injera",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Ethiopian fermented sourdough flatbread.",
    blurb: "A spongy, sour flatbread made from fermented teff flour batter, serving as the base for stews."
  },
  createCombineTransition(['flour', 'water', 'yeast'])
);

const berbere_stew = buildCombineItem(
  {
    id: "berbere_stew",
    name: "Berbere Stew",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Ethiopian spiced beef or chicken stew.",
    blurb: "A fiery stew slow-cooked with a complex berbere chili-spice blend, onions, and beef."
  },
  createCombineTransition(['beef', 'chili', 'water'])
);

const egusi_soup = buildCombineItem(
  {
    id: "egusi_soup",
    name: "Egusi Soup",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "West African ground melon seed and green soup.",
    blurb: "A thick soup made with ground melon seeds, leafy greens, palm oil, and dried fish."
  },
  createCombineTransition(['melon_seed', 'water', 'cabbage'])
);

const bobotie = buildCombineItem(
  {
    id: "bobotie",
    name: "Bobotie",
    emoji: "🥘",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Spiced minced meat baked under an egg custard.",
    blurb: "A South African classic: spiced minced beef baked under a savory egg-and-milk topping."
  },
  createCombineTransition(['beef', 'egg', 'milk'])
);

const tagine = buildCombineItem(
  {
    id: "tagine",
    name: "Tagine",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Slow-cooked Moroccan clay pot stew.",
    blurb: "Moroccan stew named after the conical clay pot it cooks in, slow-cooked with meat and dried fruits."
  },
  createCombineTransition(['beef', 'fruits', 'water'])
);

const couscous = buildCombineItem(
  {
    id: "couscous",
    name: "Couscous",
    emoji: "🍚",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Steamed semolina grains.",
    blurb: "Tiny grains of semolina steamed over a simmering stew, serving as a staple across North Africa."
  },
  createCombineTransition(['flour', 'water'])
);

const suya = buildCombineItem(
  {
    id: "suya",
    name: "Suya",
    emoji: "🍢",
    type: "recipe",
    origin: "processed",
    category: "African",
    description: "Spiced, grilled skewered beef.",
    blurb: "Thinly sliced beef coated in a spicy peanut and chili rub (yaji), grilled over hot coals."
  },
  createCombineTransition(['beef', 'peanuts', 'chili'])
);

const corn_tortilla = buildCombineItem(
  {
    id: "corn_tortilla",
    name: "Corn Tortilla",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Mesoamerican thin corn flatbread.",
    blurb: "Flatbread made from ground, alkaline-treated corn dough (nixtamalized masa) pressed thin and griddled."
  },
  createCombineTransition(['corn', 'water'])
);

const mole_poblano = buildCombineItem(
  {
    id: "mole_poblano",
    name: "Mole Poblano",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Complex Mexican chili and chocolate sauce.",
    blurb: "A velvety Mexican sauce blending toasted chilies, seeds, spices, and a touch of dark cocoa."
  },
  createCombineTransition(['chili', 'cocoa', 'seeds'])
);

const ceviche = buildCombineItem(
  {
    id: "ceviche",
    name: "Ceviche",
    emoji: "🥗",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Citrus-cured fresh raw fish.",
    blurb: "Raw fish cubes marinated in fresh lime juice until the acids denature the protein, served cold."
  },
  createCombineTransition(['whole_fish', 'citrus', 'chili'])
);

const tamale = buildCombineItem(
  {
    id: "tamale",
    name: "Tamale",
    emoji: "🫔",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Masa dough filled with meat, steamed in a corn husk.",
    blurb: "Steamed parcels of corn masa dough filled with meat, wrapped in corn husks."
  },
  createCombineTransition(['corn', 'pork', 'water'])
);

const feijoada = buildCombineItem(
  {
    id: "feijoada",
    name: "Feijoada",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Rich Brazilian black bean and pork stew.",
    blurb: "A hearty Portuguese-Brazilian stew of black beans slow-simmered with various cuts of pork."
  },
  createCombineTransition(['beans', 'pork', 'water'])
);

const pupusa = buildCombineItem(
  {
    id: "pupusa",
    name: "Pupusa",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Stuffed Salvadoran griddled corn cake.",
    blurb: "Thick corn flatbread stuffed with cheese, beans, or pork, griddled until golden."
  },
  createCombineTransition(['corn', 'cheese', 'beans'])
);

const empanada = buildCombineItem(
  {
    id: "empanada",
    name: "Empanada",
    emoji: "🥟",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Filled pastry pocket.",
    blurb: "A crescent-shaped pastry folded over spiced beef or chicken filling and baked."
  },
  createCombineTransition(['flour', 'beef'])
);

const asado = buildCombineItem(
  {
    id: "asado",
    name: "Asado",
    emoji: "🥩",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Traditional Argentine open-fire barbecue.",
    blurb: "An Argentine social feast of beef cuts slowly roasted over open hardwood coals."
  },
  createCombineTransition(['beef', 'salt'])
);

const mofongo = buildCombineItem(
  {
    id: "mofongo",
    name: "Mofongo",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Puerto Rican mashed fried plantains with garlic.",
    blurb: "Garlicky green plantains fried and mashed in a wooden mortar with crispy pork skin."
  },
  createCombineTransition(['fruits', 'pork'])
);

const chimichurri = buildCombineItem(
  {
    id: "chimichurri",
    name: "Chimichurri",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Latin American",
    description: "Argentine garlic, herb, and vinegar steak sauce.",
    blurb: "A raw green table sauce of parsley, oregano, garlic, olive oil, and red wine vinegar."
  },
  createCombineTransition(['basil', 'citrus'])
);

const borscht = buildCombineItem(
  {
    id: "borscht",
    name: "Borscht",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Traditional fermented beet soup.",
    blurb: "A vibrant red sour soup made from beets, cabbage, and beef, topped with sour cream."
  },
  createCombineTransition(['beet', 'cabbage', 'beef'])
);

const pierogi = buildCombineItem(
  {
    id: "pierogi",
    name: "Pierogi",
    emoji: "🥟",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Stuffed boiled dumplings.",
    blurb: "Dough pockets stuffed with potato, cheese, or sauerkraut, boiled and then pan-fried."
  },
  createCombineTransition(['flour', 'potato', 'cheese'])
);

const goulash = buildCombineItem(
  {
    id: "goulash",
    name: "Goulash",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Rich Hungarian paprika beef stew.",
    blurb: "A comforting Hungarian stew of beef slow-cooked with heaps of sweet paprika, onions, and peppers."
  },
  createCombineTransition(['beef', 'tomato', 'water'])
);

const sauerkraut = buildCombineItem(
  {
    id: "sauerkraut",
    name: "Sauerkraut",
    emoji: "🥬",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Fermented sour cabbage.",
    blurb: "Finely shredded cabbage salted and fermented under its own juice to produce sour lactic acid."
  },
  createCombineTransition(['cabbage', 'salt'])
);

const pelmeni = buildCombineItem(
  {
    id: "pelmeni",
    name: "Pelmeni",
    emoji: "🥟",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Siberian meat-filled dumplings.",
    blurb: "Thin wheat dumplings packed with spiced minced beef and pork, boiled in seasoned broth."
  },
  createCombineTransition(['flour', 'beef', 'pork'])
);

const stroganoff = buildCombineItem(
  {
    id: "stroganoff",
    name: "Stroganoff",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Beef sautéed in a rich sour cream sauce.",
    blurb: "Tender beef slices sautéed with onions and mushrooms, simmered in a sour cream gravy."
  },
  createCombineTransition(['beef', 'mushrooms', 'cream'])
);

const cabbage_rolls = buildCombineItem(
  {
    id: "cabbage_rolls",
    name: "Cabbage Rolls",
    emoji: "🥬",
    type: "recipe",
    origin: "processed",
    category: "Eastern European",
    description: "Stuffed cabbage leaves braised in tomato sauce.",
    blurb: "Cabbage leaves wrapped around ground beef, pork, and rice, braised in a sweet tomato sauce."
  },
  createCombineTransition(['cabbage', 'beef', 'rice'])
);

const smoked_brisket = buildCombineItem(
  {
    id: "smoked_brisket",
    name: "Smoked Brisket",
    emoji: "🥩",
    type: "recipe",
    origin: "processed",
    category: "North American",
    description: "Low-and-slow smoked beef brisket.",
    blurb: "Tough beef brisket smoked over oak or hickory coals for half a day until meltingly tender."
  },
  createCombineTransition(['beef', 'salt'])
);

const gumbo = buildCombineItem(
  {
    id: "gumbo",
    name: "Gumbo",
    emoji: "🍲",
    type: "recipe",
    origin: "processed",
    category: "North American",
    description: "Roux-based Louisiana seafood and sausage okra stew.",
    blurb: "The official state dish of Louisiana: a thick stew built on dark flour-oil roux, okra, and shrimp."
  },
  createCombineTransition(['shrimp', 'flour', 'water'])
);

const cornbread = buildCombineItem(
  {
    id: "cornbread",
    name: "Cornbread",
    emoji: "🍞",
    type: "recipe",
    origin: "processed",
    category: "North American",
    description: "Southern griddled cornmeal bread.",
    blurb: "A rustic griddled bread made from ground cornmeal, baked in a cast-iron skillet."
  },
  createCombineTransition(['corn', 'egg', 'milk'])
);

const clam_chowder = buildCombineItem(
  {
    id: "clam_chowder",
    name: "Clam Chowder",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "North American",
    description: "Creamy New England seafood clam soup.",
    blurb: "A rich chowder of sweet chopped clams, potatoes, salt pork, onion, and thick dairy cream."
  },
  createCombineTransition(['shellfish', 'potato', 'cream', 'water'])
);

const bannock = buildCombineItem(
  {
    id: "bannock",
    name: "Bannock",
    emoji: "🍞",
    type: "recipe",
    origin: "processed",
    category: "North American",
    description: "Simple Indigenous fire-baked skillet bread.",
    blurb: "A quick bread prepared with flour, water, and baking powder, baked over an open campfire."
  },
  createCombineTransition(['flour', 'water'])
);

const flatbread = buildCombineItem(
  {
    id: "flatbread",
    name: "Flatbread",
    emoji: "🫓",
    type: "recipe",
    origin: "processed",
    category: "Universal/Ancient",
    description: "Simple grain, water, and heat flatbread.",
    blurb: "The global ancestor of all breads: simple ground grain mixed with water and griddled on hot stone."
  },
  createCombineTransition(['flour', 'water'])
);

const bone_broth = buildCombineItem(
  {
    id: "bone_broth",
    name: "Bone Broth",
    emoji: "🥣",
    type: "recipe",
    origin: "processed",
    category: "Universal/Ancient",
    description: "Universal long-simmered bone broth.",
    blurb: "Collagen-rich broth extracted by simmering animal bones and connective tissue in water."
  },
  createCombineTransition(['beef', 'water'])
);

const cured_meat = buildCombineItem(
  {
    id: "cured_meat",
    name: "Cured Meat",
    emoji: "🥓",
    type: "recipe",
    origin: "processed",
    category: "Universal/Ancient",
    description: "Dry, salted cured meat jerky.",
    blurb: "Lean meat sliced thin, salted, and dried over low heat or wind to prevent spoilage."
  },
  createCombineTransition(['beef', 'salt'])
);

const fermented_drink = buildCombineItem(
  {
    id: "fermented_drink",
    name: "Fermented Drink",
    emoji: "🍷",
    type: "recipe",
    origin: "processed",
    category: "Universal/Ancient",
    description: "Ancient fermented wine or beer base.",
    blurb: "A fermented beverage brewed from wild sugars or grains left to sit over time."
  },
  createCombineTransition(['fruits', 'water'])
);

const pickled_vegetables = buildCombineItem(
  {
    id: "pickled_vegetables",
    name: "Pickled Vegetables",
    emoji: "🥒",
    type: "recipe",
    origin: "processed",
    category: "Universal/Ancient",
    description: "Acid-preserved pickled vegetables.",
    blurb: "Fresh vegetables submerged in acid or salt brine to preserve their crunch and nutrients."
  },
  createCombineTransition(['roots', 'citrus'])
);

export default {
  ...extraBasics,
  ...tonkotsu_ramen,
  ...mapo_tofu,
  ...bibimbap,
  ...kimchi,
  ...char_siu,
  ...sukiyaki,
  ...peking_duck,
  ...japchae,
  ...congee,
  ...miso_soup,
  ...xiaolongbao,
  ...tteokbokki,
  ...okonomiyaki,
  ...hot_pot,
  ...tempura,
  ...pho_bo,
  ...tom_yum_goong,
  ...rendang,
  ...pad_thai,
  ...banh_mi,
  ...satay,
  ...laksa,
  ...green_papaya_salad,
  ...nasi_goreng,
  ...spring_rolls,
  ...butter_chicken,
  ...biryani,
  ...dal,
  ...tandoori_chicken,
  ...samosa,
  ...naan,
  ...saag,
  ...chana_masala,
  ...vindaloo,
  ...dosa,
  ...hummus,
  ...shawarma,
  ...falafel,
  ...kebab,
  ...tabbouleh,
  ...baklava,
  ...shakshuka,
  ...tahini,
  ...manakish,
  ...kibbeh,
  ...coq_au_vin,
  ...bouillabaisse,
  ...risotto,
  ...pasta_carbonara,
  ...paella,
  ...moussaka,
  ...tzatziki,
  ...gazpacho,
  ...caprese,
  ...tortilla_espanola,
  ...ratatouille,
  ...pesto,
  ...cassoulet,
  ...croissant,
  ...onion_soup,
  ...beef_bourguignon,
  ...quiche,
  ...creme_brulee,
  ...confit,
  ...hollandaise,
  ...jollof_rice,
  ...injera,
  ...berbere_stew,
  ...egusi_soup,
  ...bobotie,
  ...tagine,
  ...couscous,
  ...suya,
  ...corn_tortilla,
  ...mole_poblano,
  ...ceviche,
  ...tamale,
  ...feijoada,
  ...pupusa,
  ...empanada,
  ...asado,
  ...mofongo,
  ...chimichurri,
  ...borscht,
  ...pierogi,
  ...goulash,
  ...sauerkraut,
  ...pelmeni,
  ...stroganoff,
  ...cabbage_rolls,
  ...smoked_brisket,
  ...gumbo,
  ...cornbread,
  ...clam_chowder,
  ...bannock,
  ...flatbread,
  ...bone_broth,
  ...cured_meat,
  ...fermented_drink,
  ...pickled_vegetables,
};
