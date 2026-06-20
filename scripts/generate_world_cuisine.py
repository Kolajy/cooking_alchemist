#!/usr/bin/env python3
import os

DISHES = [
    # East Asian (15)
    ("tonkotsu_ramen", "Tonkotsu Ramen", "🍜", "East Asian", "Rich, slow-simmered pork bone broth served with noodles.", "A Japanese masterpiece: pork bones are boiled for hours until the marrow and collagen emulsify into a creamy, white broth.", ["pork", "water", "rice_flour"]),
    ("mapo_tofu", "Mapo Tofu", "🍲", "East Asian", "Spicy Sichuan tofu with minced pork and chili oil.", "A famous Sichuan dish featuring soft tofu cubes bathed in a bright red, oily, and spicy sauce.", ["tofu", "chili", "pork"]),
    ("bibimbap", "Bibimbap", "🥣", "East Asian", "Korean warm rice topped with seasoned vegetables and gochujang.", "Literally 'mixed rice'—a colorful bowl of rice, sautéed vegetables, meat, and sweet-spicy gochujang sauce.", ["rice", "roots", "egg", "gochujang"]),
    ("kimchi", "Kimchi", "🥬", "East Asian", "Spiced and fermented napa cabbage.", "The soul of Korean cuisine: crisp cabbage salted and fermented with chili, garlic, and ginger.", ["cabbage", "chili", "salt"]),
    ("char_siu", "Char Siu", "🥓", "East Asian", "Sweet, Cantonese barbecued roasted pork.", "Pork marinated in honey, soy, and spices, then roasted over high heat to create a caramelized glaze.", ["pork", "honey", "soy_sauce"]),
    ("sukiyaki", "Sukiyaki", "🍲", "East Asian", "Hot pot of beef and vegetables simmered in sweet soy sauce.", "Thinly sliced beef, tofu, and vegetables slowly simmered at the table in a shallow iron pot of sweet soy sauce broth.", ["beef", "soy_sauce", "water"]),
    ("peking_duck", "Peking Duck", "🦆", "East Asian", "Crispy-skinned imperial roasted whole duck.", "A legendary Beijing dish prized for its thin, crispy skin, served with sweet bean sauce and thin pancakes.", ["duck", "honey", "soy_sauce"]),
    ("japchae", "Japchae", "🍜", "East Asian", "Korean sweet potato glass noodles stir-fried with vegetables.", "Chewy sweet potato starch noodles tossed with colorful vegetables and seasoned with sesame oil and soy sauce.", ["sweet_potato", "roots", "soy_sauce"]),
    ("congee", "Congee", "🥣", "East Asian", "Slow-simmered rice porridge.", "A gentle, comforting rice soup simmered in water or broth until the grains break down completely.", ["rice", "water"]),
    ("miso_soup", "Miso Soup", "🥣", "East Asian", "Traditional Japanese fermented soybean paste broth.", "A simple yet profound soup made by whisking fermented miso paste into dashi broth.", ["soy_paste", "water"]),
    ("xiaolongbao", "Dim Sum (Xiaolongbao)", "🥟", "East Asian", "Shanghai-style steamed soup dumplings.", "Delicate wheat dumplings filled with seasoned pork and a rich stock that melts into soup when steamed.", ["flour", "pork", "water"]),
    ("tteokbokki", "Tteokbokki", "🍲", "East Asian", "Chewy rice cakes simmered in sweet and spicy chili paste.", "A popular Korean street food made of cylindrical boiled rice cakes tossed in a fiery gochujang sauce.", ["rice", "gochujang", "water"]),
    ("okonomiyaki", "Okonomiyaki", "🥞", "East Asian", "Savory Japanese cabbage pancake.", "A grilled batter pancake loaded with shredded cabbage and pork, topped with savory sauce.", ["flour", "cabbage", "egg", "pork"]),
    ("hot_pot", "Hot Pot", "🍲", "East Asian", "Communal simmering hot pot broth with meats and vegetables.", "A gathering dish where diners cook raw meats, seafood, and vegetables in a central pot of bubbling broth.", ["water", "beef", "cabbage", "chili"]),
    ("tempura", "Tempura", "🍤", "East Asian", "Light and crispy battered, flash-fried seafood or vegetables.", "An Edo-period classic: seafood and vegetables dipped in a chilled flour-and-egg batter, then fried to golden perfection.", ["flour", "egg", "shrimp"]),

    # Southeast Asian (10)
    ("pho_bo", "Pho Bo", "🥣", "Southeast Asian", "Vietnamese beef noodle soup with charred aromatics.", "Fragrant beef bone broth infused with charred ginger, onions, and spices, poured over rice noodles.", ["beef", "water", "ginger", "rice"]),
    ("tom_yum_goong", "Tom Yum Goong", "🍲", "Southeast Asian", "Hot and sour Thai shrimp soup.", "A fiery Thai soup cooked with lemongrass, lime leaf, chili, and fresh shrimp.", ["shrimp", "water", "chili", "citrus"]),
    ("rendang", "Rendang", "🥩", "Southeast Asian", "Slow-braised caramelized coconut beef curry.", "Beef slow-cooked in coconut milk and spices until the liquid evaporates, leaving the meat tender and caramelized.", ["beef", "coconuts", "chili"]),
    ("pad_thai", "Pad Thai", "🍜", "Southeast Asian", "Stir-fried Thai rice noodles.", "Rice noodles stir-fried with shrimp, tofu, eggs, tamarind, and peanuts.", ["rice", "egg", "peanuts", "shrimp"]),
    ("banh_mi", "Banh Mi", "🥖", "Southeast Asian", "Vietnamese baguette filled with savory meats and pickled vegetables.", "A French-colonial fusion: crispy baguette spread with pâté, filled with pork, cilantro, and pickled carrots.", ["baguette", "pork", "carrot"]),
    ("satay", "Satay", "🍢", "Southeast Asian", "Grilled skewered meat served with peanut sauce.", "Skewered marinated meat grilled over wood coals, served with a rich, spicy peanut dip.", ["chicken", "peanuts"]),
    ("laksa", "Laksa", "🍜", "Southeast Asian", "Spicy coconut curry noodle soup.", "A rich Peranakan noodle soup combining a spicy coconut milk broth with fish cakes and tofu puff.", ["rice", "coconuts", "shrimp", "chili"]),
    ("green_papaya_salad", "Green Papaya Salad", "🥗", "Southeast Asian", "Pounded spicy and sour raw papaya salad.", "Shredded unripe papaya pounded in a mortar with lime juice, chili, fish sauce, and peanuts.", ["fruits", "chili", "peanuts", "citrus"]),
    ("nasi_goreng", "Nasi Goreng", "🍛", "Southeast Asian", "Indonesian fried rice flavored with sweet soy and shrimp paste.", "Rice stir-fried with sweet soy sauce, garlic, tamarind, chili, and pungent shrimp paste.", ["rice", "shrimp_paste", "chili"]),
    ("spring_rolls", "Spring Rolls", "🌯", "Southeast Asian", "Fresh rice paper wrapped rolls.", "Fresh salad, herbs, and shrimp wrapped in thin translucent rice paper sheets.", ["rice", "shrimp", "shoots"]),

    # South Asian (10)
    ("butter_chicken", "Butter Chicken", "🍗", "South Asian", "Mild, creamy tomato curry with tandoori chicken.", "Tender spiced chicken simmered in a velvety sauce of butter, cream, tomatoes, and spices.", ["chicken", "tomato", "cream"]),
    ("biryani", "Biryani", "🍛", "South Asian", "Layered spiced rice and marinated meat.", "A celebratory South Asian dish of spiced basmati rice layered with meat and cooked on slow heat.", ["rice", "chicken", "seeds"]),
    ("dal", "Dal", "🥣", "South Asian", "Slow-simmered spiced lentils.", "A staple Indian dish of split lentils simmered with turmeric and tempered with spiced oil.", ["lentils", "water"]),
    ("tandoori_chicken", "Tandoori Chicken", "🍗", "South Asian", "Spiced yogurt-marinated chicken roasted in a clay tandoor.", "Chicken marinated in yogurt and red spices, roasted at high heat in a clay oven.", ["chicken", "yogurt"]),
    ("samosa", "Samosa", "🥟", "South Asian", "Fried pastry stuffed with spiced potatoes and peas.", "Crispy triangular pastry pockets filled with spiced potato and pea mash, then fried.", ["flour", "potato", "seeds"]),
    ("naan", "Naan", "🫓", "South Asian", "Leavened flatbread baked in a tandoor.", "Soft, pillowy leavened flatbread slapped onto the inside walls of a hot clay tandoor oven.", ["flour", "water", "yeast"]),
    ("saag", "Saag", "🥬", "South Asian", "Slow-cooked spiced greens.", "Fresh spinach and mustard greens slow-simmered and puréed with ginger and spices.", ["cabbage", "water"]),
    ("chana_masala", "Chana Masala", "🍲", "South Asian", "Spiced chickpea stew.", "Plump chickpeas simmered in a tangy tomato, onion, and spice gravy.", ["chickpeas", "tomato", "water"]),
    ("vindaloo", "Vindaloo", "🍛", "South Asian", "Fiery, vinegar-marinated curry.", "A Goan curry blending Portuguese wine-and-glycine marinade with intense local chilies.", ["pork", "citrus", "chili"]),
    ("dosa", "Dosa", "🥞", "South Asian", "Crispy fermented rice and lentil crepe.", "A thin, crispy South Indian crepe made from a fermented batter of rice and black lentils.", ["rice", "lentils", "water"]),

    # Middle Eastern (10)
    ("hummus", "Hummus", "🥣", "Middle Eastern", "Creamy chickpea and tahini dip.", "Cooked chickpeas ground smooth with tahini, olive oil, garlic, and lemon juice.", ["chickpeas", "tahini", "citrus"]),
    ("shawarma", "Shawarma", "🥙", "Middle Eastern", "Spit-roasted sliced meat wrapped in flatbread.", "Spiced lamb, chicken, or beef slow-roasted on a vertical spit and shaved into flatbread wraps.", ["beef", "flatbread"]),
    ("falafel", "Falafel", "🧆", "Middle Eastern", "Fried spiced chickpea patties.", "Herbed ground chickpea and fava bean balls deep-fried to a golden crust.", ["chickpeas", "flour"]),
    ("kebab", "Kebab", "🍢", "Middle Eastern", "Grilled skewered minced meat.", "Spiced minced lamb or beef molded onto metal skewers and seared over natural wood coals.", ["beef", "salt"]),
    ("tabbouleh", "Tabbouleh", "🥗", "Middle Eastern", "Chopped parsley and bulgur salad.", "A fresh Levantine salad dominated by finely chopped parsley, mint, tomatoes, and bulgur wheat.", ["basil", "tomato", "wheat"]),
    ("baklava", "Baklava", "📐", "Middle Eastern", "Layered pastry with nuts and sweet syrup.", "Dozens of paper-thin sheets of phyllo dough layered with ground nuts and sweetened with honey syrup.", ["flour", "nuts", "honey"]),
    ("shakshuka", "Shakshuka", "🍳", "Middle Eastern", "Eggs poached in a spicy tomato and pepper sauce.", "A comforting breakfast dish of eggs gently simmered in a skillet of rich tomato sauce, onions, and peppers.", ["egg", "tomato", "chili"]),
    ("tahini", "Tahini", "🥣", "Middle Eastern", "Sesame seed paste.", "Sesame seeds toasted and ground into a thick, smooth paste.", ["sesame", "salt"]),
    ("manakish", "Manakish", "🫓", "Middle Eastern", "Flatbread baked with za'atar.", "A popular Levantine breakfast flatbread topped with olive oil and fragrant za'atar herbs.", ["dough", "basil"]),
    ("kibbeh", "Kibbeh", "🧆", "Middle Eastern", "Bulgur and meat croquettes.", "A shell of cracked bulgur wheat and beef stuffed with spiced pine nuts and minced meat.", ["wheat", "beef", "nuts"]),

    # Mediterranean (12)
    ("coq_au_vin", "Coq au Vin", "🍗", "Mediterranean", "Chicken braised in red wine with mushrooms.", "A classic French bistro stew: chicken pieces braised slowly in dry red wine with bacon and mushrooms.", ["chicken", "mushrooms"]),
    ("bouillabaisse", "Bouillabaisse", "🍲", "Mediterranean", "Saffron seafood stew.", "A traditional Provençal fish stew cooked with saffron, fennel, citrus peel, and mixed fish.", ["whole_fish", "shellfish", "water"]),
    ("risotto", "Risotto", "🍚", "Mediterranean", "Slow-stirred creamy rice broth.", "Italian rice cooked with hot broth added slowly, stirred continuously to release starches into a creamy glaze.", ["rice", "water"]),
    ("pasta_carbonara", "Pasta Carbonara", "🍝", "Mediterranean", "Roman pasta with egg, cheese, and cured pork.", "Hot pasta tossed with raw egg, pecorino cheese, and crispy guanciale, creating a rich sauce from residual heat.", ["flour", "egg", "cured_pork", "cheese"]),
    ("paella", "Paella", "🥘", "Mediterranean", "Spanish saffron rice with seafood.", "A famous Valencian rice dish flavored with saffron, cooked flat in a wide shallow pan with shrimp and shellfish.", ["rice", "shrimp", "shellfish"]),
    ("moussaka", "Moussaka", "🥘", "Mediterranean", "Baked eggplant and meat casserole topped with béchamel.", "Layered sliced eggplant and spiced lamb, baked under a thick blanket of creamy béchamel sauce.", ["eggplant", "beef", "milk"]),
    ("tzatziki", "Tzatziki", "🥣", "Mediterranean", "Yogurt, cucumber, and garlic dip.", "A cooling Greek dip of strained yogurt, grated cucumber, garlic, olive oil, and dill.", ["yogurt", "roots"]),
    ("gazpacho", "Gazpacho", "🥣", "Mediterranean", "Cold blended raw vegetable soup.", "An Andalusian cold soup made of blended ripe tomatoes, cucumbers, peppers, olive oil, and stale bread.", ["tomato", "roots"]),
    ("caprese", "Caprese", "🥗", "Mediterranean", "Salad of fresh tomato, mozzarella, and basil.", "A simple Italian salad of sliced fresh mozzarella, ripe tomatoes, and sweet basil leaves.", ["tomato", "cheese", "basil"]),
    ("tortilla_espanola", "Tortilla Española", "🍳", "Mediterranean", "Spanish egg and potato omelet.", "A thick Spanish omelet of sliced potatoes and onions cooked gently in olive oil, bound with beaten egg.", ["egg", "potato"]),
    ("ratatouille", "Ratatouille", "🥘", "Mediterranean", "Stewed summer vegetables.", "A rustic Provençal stew of eggplant, zucchini, peppers, and tomatoes cooked in olive oil.", ["eggplant", "tomato"]),
    ("pesto", "Pesto", "🥣", "Mediterranean", "Pounded basil, pine nut, and olive oil paste.", "A bright green Genoese paste made by pounding fresh basil, pine nuts, garlic, cheese, and olive oil.", ["basil", "nuts", "cheese"]),

    # French (8)
    ("cassoulet", "Cassoulet", "🍲", "French", "Slow-cooked bean and duck stew.", "A rich, slow-simmered casserole of white beans, duck confit, pork, and sausage from southern France.", ["beans", "duck", "water"]),
    ("croissant", "Croissant", "🥐", "French", "Laminated buttery puff pastry.", "A crescent-shaped pastry made by folding butter into yeast dough repeatedly to create dozens of flaky layers.", ["flour", "butter", "yeast"]),
    ("onion_soup", "Onion Soup", "🥣", "French", "Caramelized onion broth topped with cheese toasted bread.", "Rich beef broth packed with sweet, deeply caramelized onions, baked under a crust of bread and Gruyère cheese.", ["onion", "water", "cheese"]),
    ("beef_bourguignon", "Beef Bourguignon", "🥩", "French", "Beef braised in red wine broth.", "Tender beef chuck slowly braised in red Burgundy wine, beef stock, garlic, carrots, and mushrooms.", ["beef", "water", "mushrooms"]),
    ("quiche", "Quiche", "🥧", "French", "Savory egg custard pastry tart.", "A savory tart filled with a rich egg and cream custard, baked in a pastry shell.", ["egg", "cream", "flour"]),
    ("creme_brulee", "Crème Brûlée", "🍮", "French", "Vanilla custard with a torched sugar shell.", "A rich custard base topped with a layer of hardened caramelized sugar, torched to a crisp sheet.", ["egg", "cream", "honey"]),
    ("confit", "Confit", "🥩", "French", "Fat-preserved, slow-cooked duck or pork.", "An ancient preservation method: curing meat in salt, then slow-cooking it submerged in its own fat.", ["duck", "butter"]),
    ("hollandaise", "Hollandaise", "🥣", "French", "Emulsified warm butter and egg yolk sauce.", "A warm emulsion of egg yolks, melted butter, and lemon juice, seasoned with cayenne pepper.", ["egg", "butter", "citrus"]),

    # African (8)
    ("jollof_rice", "Jollof Rice", "🍛", "African", "West African spiced tomato rice.", "A beloved West African staple: rice cooked in a rich, spiced tomato and onion sauce.", ["rice", "tomato", "water"]),
    ("injera", "Injera", "🫓", "African", "Ethiopian fermented sourdough flatbread.", "A spongy, sour flatbread made from fermented teff flour batter, serving as the base for stews.", ["flour", "water", "yeast"]),
    ("berbere_stew", "Berbere Stew", "🍲", "African", "Ethiopian spiced beef or chicken stew.", "A fiery stew slow-cooked with a complex berbere chili-spice blend, onions, and beef.", ["beef", "chili", "water"]),
    ("egusi_soup", "Egusi Soup", "🥣", "African", "West African ground melon seed and green soup.", "A thick soup made with ground melon seeds, leafy greens, palm oil, and dried fish.", ["melon_seed", "water", "cabbage"]),
    ("bobotie", "Bobotie", "🥘", "African", "Spiced minced meat baked under an egg custard.", "A South African classic: spiced minced beef baked under a savory egg-and-milk topping.", ["beef", "egg", "milk"]),
    ("tagine", "Tagine", "🍲", "African", "Slow-cooked Moroccan clay pot stew.", "Moroccan stew named after the conical clay pot it cooks in, slow-cooked with meat and dried fruits.", ["beef", "fruits", "water"]),
    ("couscous", "Couscous", "🍚", "African", "Steamed semolina grains.", "Tiny grains of semolina steamed over a simmering stew, serving as a staple across North Africa.", ["flour", "water"]),
    ("suya", "Suya", "🍢", "African", "Spiced, grilled skewered beef.", "Thinly sliced beef coated in a spicy peanut and chili rub (yaji), grilled over hot coals.", ["beef", "peanuts", "chili"]),

    # Latin American (10)
    ("corn_tortilla", "Corn Tortilla", "🫓", "Latin American", "Mesoamerican thin corn flatbread.", "Flatbread made from ground, alkaline-treated corn dough (nixtamalized masa) pressed thin and griddled.", ["corn", "water"]),
    ("mole_poblano", "Mole Poblano", "🥣", "Latin American", "Complex Mexican chili and chocolate sauce.", "A velvety Mexican sauce blending toasted chilies, seeds, spices, and a touch of dark cocoa.", ["chili", "cocoa", "seeds"]),
    ("ceviche", "Ceviche", "🥗", "Latin American", "Citrus-cured fresh raw fish.", "Raw fish cubes marinated in fresh lime juice until the acids denature the protein, served cold.", ["whole_fish", "citrus", "chili"]),
    ("tamale", "Tamale", "🫔", "Latin American", "Masa dough filled with meat, steamed in a corn husk.", "Steamed parcels of corn masa dough filled with meat, wrapped in corn husks.", ["corn", "pork", "water"]),
    ("feijoada", "Feijoada", "🍲", "Latin American", "Rich Brazilian black bean and pork stew.", "A hearty Portuguese-Brazilian stew of black beans slow-simmered with various cuts of pork.", ["beans", "pork", "water"]),
    ("pupusa", "Pupusa", "🫓", "Latin American", "Stuffed Salvadoran griddled corn cake.", "Thick corn flatbread stuffed with cheese, beans, or pork, griddled until golden.", ["corn", "cheese", "beans"]),
    ("empanada", "Empanada", "🥟", "Latin American", "Filled pastry pocket.", "A crescent-shaped pastry folded over spiced beef or chicken filling and baked.", ["flour", "beef"]),
    ("asado", "Asado", "🥩", "Latin American", "Traditional Argentine open-fire barbecue.", "An Argentine social feast of beef cuts slowly roasted over open hardwood coals.", ["beef", "salt"]),
    ("mofongo", "Mofongo", "🥣", "Latin American", "Puerto Rican mashed fried plantains with garlic.", "Garlicky green plantains fried and mashed in a wooden mortar with crispy pork skin.", ["fruits", "pork"]),
    ("chimichurri", "Chimichurri", "🥣", "Latin American", "Argentine garlic, herb, and vinegar steak sauce.", "A raw green table sauce of parsley, oregano, garlic, olive oil, and red wine vinegar.", ["basil", "citrus"]),

    # Eastern European (7)
    ("borscht", "Borscht", "🥣", "Eastern European", "Traditional fermented beet soup.", "A vibrant red sour soup made from beets, cabbage, and beef, topped with sour cream.", ["beet", "cabbage", "beef"]),
    ("pierogi", "Pierogi", "🥟", "Eastern European", "Stuffed boiled dumplings.", "Dough pockets stuffed with potato, cheese, or sauerkraut, boiled and then pan-fried.", ["flour", "potato", "cheese"]),
    ("goulash", "Goulash", "🍲", "Eastern European", "Rich Hungarian paprika beef stew.", "A comforting Hungarian stew of beef slow-cooked with heaps of sweet paprika, onions, and peppers.", ["beef", "tomato", "water"]),
    ("sauerkraut", "Sauerkraut", "🥬", "Eastern European", "Fermented sour cabbage.", "Finely shredded cabbage salted and fermented under its own juice to produce sour lactic acid.", ["cabbage", "salt"]),
    ("pelmeni", "Pelmeni", "🥟", "Eastern European", "Siberian meat-filled dumplings.", "Thin wheat dumplings packed with spiced minced beef and pork, boiled in seasoned broth.", ["flour", "beef", "pork"]),
    ("stroganoff", "Stroganoff", "🍲", "Eastern European", "Beef sautéed in a rich sour cream sauce.", "Tender beef slices sautéed with onions and mushrooms, simmered in a sour cream gravy.", ["beef", "mushrooms", "cream"]),
    ("cabbage_rolls", "Cabbage Rolls", "🥬", "Eastern European", "Stuffed cabbage leaves braised in tomato sauce.", "Cabbage leaves wrapped around ground beef, pork, and rice, braised in a sweet tomato sauce.", ["cabbage", "beef", "rice"]),

    # North American (5)
    ("smoked_brisket", "Smoked Brisket", "🥩", "North American", "Low-and-slow smoked beef brisket.", "Tough beef brisket smoked over oak or hickory coals for half a day until meltingly tender.", ["beef", "salt"]),
    ("gumbo", "Gumbo", "🍲", "North American", "Roux-based Louisiana seafood and sausage okra stew.", "The official state dish of Louisiana: a thick stew built on dark flour-oil roux, okra, and shrimp.", ["shrimp", "flour", "water"]),
    ("cornbread", "Cornbread", "🍞", "North American", "Southern griddled cornmeal bread.", "A rustic griddled bread made from ground cornmeal, baked in a cast-iron skillet.", ["corn", "egg", "milk"]),
    ("clam_chowder", "Clam Chowder", "🥣", "North American", "Creamy New England seafood clam soup.", "A rich chowder of sweet chopped clams, potatoes, salt pork, onion, and thick dairy cream.", ["shellfish", "potato", "cream", "water"]),
    ("bannock", "Bannock", "🍞", "North American", "Simple Indigenous fire-baked skillet bread.", "A quick bread prepared with flour, water, and baking powder, baked over an open campfire.", ["flour", "water"]),

    # Universal/Ancient (5)
    ("flatbread", "Flatbread", "🫓", "Universal/Ancient", "Simple grain, water, and heat flatbread.", "The global ancestor of all breads: simple ground grain mixed with water and griddled on hot stone.", ["flour", "water"]),
    ("bone_broth", "Bone Broth", "🥣", "Universal/Ancient", "Universal long-simmered bone broth.", "Collagen-rich broth extracted by simmering animal bones and connective tissue in water.", ["beef", "water"]),
    ("cured_meat", "Cured Meat", "🥓", "Universal/Ancient", "Dry, salted cured meat jerky.", "Lean meat sliced thin, salted, and dried over low heat or wind to prevent spoilage.", ["beef", "salt"]),
    ("fermented_drink", "Fermented Drink", "🍷", "Universal/Ancient", "Ancient fermented wine or beer base.", "A fermented beverage brewed from wild sugars or grains left to sit over time.", ["fruits", "water"]),
    ("pickled_vegetables", "Pickled Vegetables", "🥒", "Universal/Ancient", "Acid-preserved pickled vegetables.", "Fresh vegetables submerged in acid or salt brine to preserve their crunch and nutrients.", ["roots", "citrus"])
]

STARTERS_PROPERTIES = {
    "pork": '{"edibleRaw":false,"moisture":"medium","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "beef": '{"edibleRaw":false,"moisture":"medium","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "chicken": '{"edibleRaw":false,"moisture":"medium","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "duck": '{"edibleRaw":false,"moisture":"medium","fat":"high","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "cabbage": '{"edibleRaw":true,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "beans": '{"edibleRaw":false,"moisture":"low","fat":"low","structure":"hard","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "milk": '{"edibleRaw":true,"moisture":"high","fat":"medium","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "egg": '{"edibleRaw":false,"moisture":"high","fat":"medium","structure":"soft","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "tomato": '{"edibleRaw":true,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":true,"toxic":false}',
    "chili": '{"edibleRaw":true,"moisture":"medium","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":true,"toxic":false}',
    "citrus": '{"edibleRaw":true,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":true,"hasBones":false,"hasSeeds":true,"toxic":false}',
    "lentils": '{"edibleRaw":false,"moisture":"low","fat":"low","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "sesame": '{"edibleRaw":true,"moisture":"low","fat":"high","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "chickpeas": '{"edibleRaw":false,"moisture":"low","fat":"low","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "cocoa": '{"edibleRaw":true,"moisture":"low","fat":"high","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "basil": '{"edibleRaw":true,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "coconuts": '{"edibleRaw":true,"moisture":"medium","fat":"high","structure":"hard","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "peanuts": '{"edibleRaw":true,"moisture":"low","fat":"high","structure":"hard","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "cheese": '{"edibleRaw":true,"moisture":"medium","fat":"high","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "yogurt": '{"edibleRaw":true,"moisture":"high","fat":"medium","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "cream": '{"edibleRaw":true,"moisture":"high","fat":"high","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "rice_flour": '{"edibleRaw":false,"moisture":"low","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "yeast": '{"edibleRaw":false,"moisture":"medium","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "cured_pork": '{"edibleRaw":true,"moisture":"medium","fat":"high","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    # Plus common missing items:
    "rice": '{"edibleRaw":false,"moisture":"low","fat":"low","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "salt": '{"edibleRaw":true,"moisture":"low","fat":"low","structure":"hard","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "honey": '{"edibleRaw":true,"moisture":"medium","fat":"low","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "butter": '{"edibleRaw":true,"moisture":"medium","fat":"high","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "eggplant": '{"edibleRaw":false,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":true,"toxic":false}',
    "onion": '{"edibleRaw":true,"moisture":"high","fat":"low","structure":"hard","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "corn": '{"edibleRaw":true,"moisture":"medium","fat":"low","structure":"soft","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "melon_seed": '{"edibleRaw":true,"moisture":"low","fat":"medium","structure":"hard","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "baguette": '{"edibleRaw":true,"moisture":"low","fat":"low","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    # intermediates:
    "tofu": '{"edibleRaw":true,"moisture":"high","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "gochujang": '{"edibleRaw":true,"moisture":"medium","fat":"low","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "soy_paste": '{"edibleRaw":true,"moisture":"medium","fat":"low","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "tahini": '{"edibleRaw":true,"moisture":"low","fat":"high","structure":"liquid","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "shrimp_paste": '{"edibleRaw":true,"moisture":"medium","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}',
    "shrimp": '{"edibleRaw":false,"moisture":"high","fat":"low","structure":"soft","hasOuterLayer":true,"hasBones":false,"hasSeeds":false,"toxic":false}'
}

def generate():
    # Clean up properties.ts of the previous ones to make it repeatable and clean
    properties_path = "content/data/ingredients/properties.ts"
    with open(properties_path, "r") as f:
        content = f.read()

    # Find where our additions start. We can truncate from the first pork addition.
    pork_index = content.find("  pork: ")
    if pork_index != -1:
        content = content[:pork_index] + "};\n"

    closing_index = content.rfind("};")
    if closing_index == -1:
        print("Could not find closing brace in properties.ts")
        return

    prop_lines = []
    
    # Add key starters if not there
    for item, prop in STARTERS_PROPERTIES.items():
        if f'  {item}:' not in content:
            prop_lines.append(f'  {item}: {prop},')

    # Add dishes
    for id_val, name, emoji, category, desc, blurb, inputs in DISHES:
        if f'  {id_val}:' not in content:
            prop_lines.append(f'  {id_val}: {{"edibleRaw":true,"moisture":"medium","fat":"medium","structure":"soft","hasOuterLayer":false,"hasBones":false,"hasSeeds":false,"toxic":false}},')

    new_properties = content[:closing_index] + "\n".join(prop_lines) + "\n" + content[closing_index:]
    with open(properties_path, "w") as f:
        f.write(new_properties)
    print("Updated properties.ts")

    # 2. Write world_cuisine.ts
    recipes_path = "content/data/recipes/world_cuisine.ts"
    
    recipe_code = """import { buildTechniqueItem, createTechniqueTransition, buildCombineItem, createCombineTransition } from "./_techniqueRecipe";
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
  )
};

"""
    for id_val, name, emoji, category, desc, blurb, inputs in DISHES:
        recipe_code += f"""const {id_val} = buildCombineItem(
  {{
    id: "{id_val}",
    name: "{name}",
    emoji: "{emoji}",
    type: "recipe",
    origin: "processed",
    category: "{category}",
    description: "{desc}",
    blurb: "{blurb}"
  }},
  createCombineTransition({repr(inputs)})
);

"""
    
    recipe_code += "export default {\n  ...extraBasics,\n"
    for id_val, name, emoji, category, desc, blurb, inputs in DISHES:
        recipe_code += f"  ...{id_val},\n"
    recipe_code += "};\n"

    with open(recipes_path, "w") as f:
        f.write(recipe_code)
    print("Created world_cuisine.ts")

if __name__ == "__main__":
    generate()
