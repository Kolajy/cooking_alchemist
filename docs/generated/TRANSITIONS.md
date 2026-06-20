# Culinary Alchemy — Transitions

> **Auto-generated** from `content/` on 2026-06-20. Do not edit by hand.
> Regenerate with `npm run docs:generate` after content changes.

## Summary

| Kind | Count |
|------|------:|
| Technique | 45 |
| Combine | 118 |

## Technique transitions

Grouped by primary tool. `onePerAction` separation chains yield one undiscovered output per use.

### `char` (4)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🍎 Apple (`apple`) | 🍎 Charred Apple (`charred_apple`) | `char`, `roast` | no | Char fruit over flame to deepen sweetness before finishing a dish. |
| 🫙 Cooking Oil (`cooking_oil`) | 🔥 Hot Oil (`hot_oil`) | `char`, `cook`, `precision` | no | Apply heat to cooking oil to prepare it for high-temperature searing. |
| 🍞 Dough (`dough`) | 🫓 Ash Cake (`ash_cake`) | `char`, `roast` | no | Bake dough directly in hot ashes to make a primitive ash cake. |
| 🌻 Sunflower Seed (`sunflower_seed`) | 🌻 Roasted Sunflower Seeds (`roasted_sunflower_seeds`) | `char`, `roast` | no | Toast sunflower seeds over open flame or coals. |

### `cook` (3)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🐟 Prepared Fish (`prepared_fish`) | 🐟 Cooked Steamed Fish (`cooked_steamed_fish`) | `cook`, `simmer`, `boil` | no | Steam prepared fish using a controlled stovetop boil/simmer. |
| 🍲 Raw Stew Pot (`raw_stew_pot`) | 🍲 Stone-Boiled Stew (`stone_boiled_stew`) | `cook`, `simmer`, `boil` | no | Boil the raw stew pot with hot stones or stovetop heat. |
| 💧 Water (`water`) | 🧂 Salt (`salt`) | `cook`, `boil` | no | — |

### `ferment` (3)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🍎 Fruits (`fruits`) | 🦠 Yeast (`yeast`) | `ferment` | no | — |
| 🥛 Milk (`milk`) | 🥛 Yogurt (`yogurt`) | `ferment` | no | — |
| 🌻 Seeds (`seeds`) | 🍶 Soy Sauce (`soy_sauce`) | `ferment` | no | Ferment seeds to brew soy sauce. |

### `fillet` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🐟 Whole Fish (`whole_fish`) | 🐟 Cleaned Fish (`cleaned_fish`) | `fillet` | no | Use the fillet skill to scale and clean whole fish. |

### `grind` (3)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🌰 Almond (`almond`) | 🥣 Almond Paste (`almond_paste`) | `grind`, `pound` | no | Grind or pound almonds to release fats and form almond paste. |
| 🍚 Rice (`rice`) | 🌾 Rice Flour (`rice_flour`) | `grind`, `pound` | no | — |
| 🌾 Wheat (`wheat`) | 🌾 Flour (`flour`) | `grind`, `pound`, `smash` | no | Grind or pound wheat to make raw flour. |

### `hearth_bake` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🍞 Dough (`dough`) | 🫓 Hearth Flatbread (`hearth_flatbread`) | `hearth_bake`, `bake` | no | Bake raw dough directly on the floor of a Hearth & Clay Oven. |

### `peel` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🫚 Ginger (`ginger`) | 🫚 Peeled Ginger (`peeled_ginger`) | `peel` | no | Use the peel technique to prep fibrous roots before cutting. |

### `pit_cook` (3)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🦪 Shellfish (`shellfish`) | 🦪 Earth-Baked Shellfish (`earth_baked_shellfish`) | `pit_cook`, `bake` | no | Bake shellfish in a dirt fire pit to steam them naturally in their shells. |
| 🦐 Shrimp (`shrimp`) | 🦐 Pit-Cooked Shrimp (`pit_cooked_shrimp`) | `pit_cook`, `bake` | no | Bake shrimp under hot rocks in an earth pit oven. |
| 🍠 Sweet Potato (`sweet_potato`) | 🍠 Pit-Roasted Sweet Potato (`pit_roasted_sweet_potato`) | `pit_cook`, `bake` | no | Pit-cook sweet potatoes in an Earth & Dirt Oven for ultimate tenderness. |

### `press` (2)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🥜 Nuts (`nuts`) | 🫙 Cooking Oil (`cooking_oil`) | `press` | no | Apply pressure to oily nuts to extract cooking oil. |
| 🌻 Seeds (`seeds`) | 🫙 Cooking Oil (`cooking_oil`) | `press` | no | Apply pressure to oilseeds or nuts to extract cooking oil. |

### `separate` (20)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🫐 Berries (`berries`) | 🍓 Strawberry (`strawberry`)<br>🍒 Raspberry (`raspberry`)<br>🫐 Blueberry (`blueberry`)<br>🍇 Blackberry (`blackberry`)<br>🥣 Smashed Berries (`smashed_berries`)<br>🍎 Fruits (`fruits`) | `separate`, `peel`, `tear` | yes | Mixed berry patches ripen unevenly — separate them one at a time to sort each fruit. |
| 🍗 Chicken (`chicken`) | 🍗 Chicken (`chicken`)<br>🥚 Egg (`egg`) | `separate` | no | Separate the chicken to obtain meat and an egg. |
| 🐄 Cow (`cow`) | 🥩 Beef (`beef`)<br>🥛 Milk (`milk`) | `separate` | no | Separate the cow to obtain both beef and milk. |
| 🦆 Duck (`duck`) | 🦆 Duck (`duck`)<br>🥚 Egg (`egg`) | `separate` | no | Separate the duck to obtain meat and an egg. |
| 🍎 Fruits (`fruits`) | 🍎 Apple (`apple`)<br>🍌 Banana (`banana`)<br>🍊 Orange (`orange`)<br>🍇 Grape (`grape`)<br>🍐 Pear (`pear`)<br>🍉 Watermelon (`watermelon`)<br>🥭 Mango (`mango`)<br>🍍 Pineapple (`pineapple`)<br>🍋 Lemon (`lemon`)<br>🍑 Peach (`peach`) | `separate`, `peel`, `tear` | yes | Mixed fruit baskets hide surprises — separate them one at a time to learn what you have. |
| 🥬 Wild Flora (`garden_produce`) | 🥬 Cabbage (`cabbage`)<br>🍅 Tomato (`tomato`)<br>🧅 Onion (`onion`)<br>🍆 Eggplant (`eggplant`)<br>🌶️ Chili (`chili`)<br>🍋 Citrus (`citrus`)<br>🌿 Basil (`basil`) | `separate`, `peel`, `tear` | yes | Wild flora patches hold various herbs and crops — separate them to sort cabbage, tomato, onion, eggplant, chili, citrus, and basil. |
| 🌾 Grasses (`grasses`) | 🌾 Wheat (`wheat`)<br>🌾 Barley (`barley`)<br>🥣 Oats (`oats`)<br>🍚 Rice (`rice`)<br>🌾 Rye (`rye`)<br>🌽 Corn (`corn`) | `separate`, `peel`, `tear` | yes | A handful of grasses holds many cereals — separate them stalk by stalk. |
| 🐄 Livestock (`livestock`) | 🐄 Cow (`cow`)<br>🐖 Pig (`pig`)<br>🍗 Chicken (`chicken`)<br>🦆 Duck (`duck`) | `separate`, `peel`, `tear` | yes | Herds gather together — separate them to milk, shear, or butcher each animal. |
| 🥛 Milk (`milk`) | 🥛 Cream (`cream`) | `separate` | no | — |
| 🍄 Mushrooms (`mushrooms`) | 🍄 Button Mushroom (`button_mushroom`)<br>🍄‍🟫 Shiitake (`shiitake`)<br>🦪 Oyster Mushroom (`oyster_mushroom`)<br>🍄 Portobello (`portobello`)<br>🌼 Chanterelle (`chanterelle`) | `separate`, `peel`, `tear` | yes | Never rush a mushroom basket — separate and identify each find one at a time. |
| 🥜 Nuts (`nuts`) | 🌰 Almond (`almond`)<br>🥜 Walnut (`walnut`)<br>🌰 Pecan (`pecan`)<br>🌰 Hazelnut (`hazelnut`)<br>🟢 Pistachio (`pistachio`)<br>🥜 Peanuts (`peanuts`)<br>🥥 Coconuts (`coconuts`) | `separate`, `peel`, `tear` | yes | Mixed nuts rattle together — separate them one shell at a time. |
| 🐖 Pig (`pig`) | 🥩 Pork (`pork`) | `separate` | no | Separate the pig to obtain pork. |
| 🫚 Roots (`roots`) | 🥕 Carrot (`carrot`)<br>🫚 Ginger (`ginger`)<br>🟣 Beet (`beet`)<br>🔴 Radish (`radish`)<br>🟡 Turnip (`turnip`) | `separate`, `peel`, `tear` | yes | Root patches hide many species — separate them carefully one at a time. |
| 🌻 Seeds (`seeds`) | 🌻 Sunflower Seed (`sunflower_seed`)<br>🎃 Pumpkin Seed (`pumpkin_seed`)<br>⚪ Sesame (`sesame`)<br>🌿 Flax (`flax`)<br>🫘 Chia (`chia`)<br>🍉 Melon Seed (`melon_seed`)<br>🫘 Beans (`beans`)<br>🫘 Lentils (`lentils`)<br>🫘 Chickpeas (`chickpeas`)<br>🍫 Cocoa (`cocoa`) | `separate`, `peel`, `tear` | yes | Seed sacks hold mixtures — separate them to learn what will sprout or roast. |
| 🦪 Shellfish (`shellfish`) | 🦐 Shrimp (`shrimp`)<br>🦪 Oyster (`oyster`)<br>🐚 Clam (`clam`)<br>🦪 Mussel (`mussel`) | `separate`, `peel`, `tear` | yes | Mixed shore harvests need sorting — separate each creature carefully. |
| 🌱 Shoots (`shoots`) | 🌿 Asparagus (`asparagus`)<br>🎋 Bamboo Shoot (`bamboo_shoot`)<br>🌱 Pea Shoot (`pea_shoot`)<br>🌱 Alfalfa Sprout (`alfalfa_sprout`)<br>💧 Watercress (`watercress`)<br>🌿 Scallions (`scallions`) | `separate`, `peel`, `tear` | yes | Young shoots look alike at a glance — separate them gently one by one. |
| 🥣 Smashed Berries (`smashed_berries`) | 🥤 Berry Pulp (`berry_pulp`) | `separate` | no | Strain smashed soft fruits to extract pure pulps and juices. |
| 🥔 Tubers (`tubers`) | 🥔 Potato (`potato`)<br>🍠 Sweet Potato (`sweet_potato`)<br>🫚 Roots (`roots`) | `separate`, `peel`, `tear` | yes | Tuber piles look alike underground — separate them to sort each variety. |
| 💧 Water (`water`) | ⛲ Spring Water (`spring_water`)<br>🫧 Mineral Water (`mineral_water`)<br>🌧️ Rainwater (`rainwater`)<br>🌊 Seawater (`seawater`) | `separate`, `peel`, `tear` | yes | Water looks uniform until you separate it — spring, mineral, rain, and sea each behave differently in the pot. |
| 🐝 Wild Hives (`wild_hives`) | 🍯 Honey (`honey`) | `separate`, `peel`, `tear` | yes | Wild hives hold liquid honey — separate them carefully to avoid bee stings. |

### `slice` (2)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🫚 Peeled Ginger (`peeled_ginger`) | 🥢 Julienned Ginger (`julienned_ginger`) | `slice`, `dice`, `julienne` | no | Julienne aromatics to release their flavorful oils rapidly. |
| 🌿 Scallions (`scallions`) | 🌿 Julienned Scallions (`julienned_scallions`) | `slice`, `dice`, `julienne` | no | Use knife skills on fresh scallions to prep them for flash cooking. |

### `smash` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🥔 Potato (`potato`) | 🥣 Mashed Potato (`mashed_potato`) | `smash`, `pound` | no | Smash starchy tubers to break down fibers before mixing or cooking. |

### `smoke` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🐟 Cleaned Fish (`cleaned_fish`) | 🐟 Smoked Fish (`smoked_fish`) | `smoke` | no | Cure and smoke cleaned fish using the Smoke & Cure technique. |

## Combine transitions

Input order is commutative — keys are sorted ingredient ids.

| Inputs | Output | Description |
|--------|--------|-------------|
| 🥖 Baguette (`baguette`) + 🥩 Pork (`pork`) + 🥕 Carrot (`carrot`) | 🥖 Banh Mi (`banh_mi`) | — |
| 🌿 Basil (`basil`) + 🍋 Citrus (`citrus`) | 🥣 Chimichurri (`chimichurri`) | — |
| 🌿 Basil (`basil`) + 🥜 Nuts (`nuts`) + 🧀 Cheese (`cheese`) | 🥣 Pesto (`pesto`) | — |
| 🌿 Basil (`basil`) + 🍅 Tomato (`tomato`) + 🌾 Wheat (`wheat`) | 🥗 Tabbouleh (`tabbouleh`) | — |
| 🫘 Beans (`beans`) + 🦆 Duck (`duck`) + 💧 Water (`water`) | 🍲 Cassoulet (`cassoulet`) | — |
| 🫘 Beans (`beans`) + 🥩 Pork (`pork`) + 💧 Water (`water`) | 🍲 Feijoada (`feijoada`) | — |
| 🥩 Beef (`beef`) + 🌶️ Chili (`chili`) + 💧 Water (`water`) | 🍲 Berbere Stew (`berbere_stew`) | — |
| 🥩 Beef (`beef`) + 🥥 Coconuts (`coconuts`) + 🌶️ Chili (`chili`) | 🥩 Rendang (`rendang`) | — |
| 🥩 Beef (`beef`) + 🥚 Egg (`egg`) + 🥛 Milk (`milk`) | 🥘 Bobotie (`bobotie`) | — |
| 🥩 Beef (`beef`) + 🫓 Flatbread (`flatbread`) | 🥙 Shawarma (`shawarma`) | — |
| 🥩 Beef (`beef`) + 🍎 Fruits (`fruits`) + 💧 Water (`water`) | 🍲 Tagine (`tagine`) | — |
| 🥩 Beef (`beef`) + 🍄 Mushrooms (`mushrooms`) + 🥛 Cream (`cream`) | 🍲 Stroganoff (`stroganoff`) | — |
| 🥩 Beef (`beef`) + 🥜 Peanuts (`peanuts`) + 🌶️ Chili (`chili`) | 🍢 Suya (`suya`) | — |
| 🥩 Beef (`beef`) + 🧂 Salt (`salt`) | 🍢 Kebab (`kebab`) | — |
| 🥩 Beef (`beef`) + 🧂 Salt (`salt`) | 🥩 Asado (`asado`) | — |
| 🥩 Beef (`beef`) + 🧂 Salt (`salt`) | 🥩 Smoked Brisket (`smoked_brisket`) | — |
| 🥩 Beef (`beef`) + 🧂 Salt (`salt`) | 🥓 Cured Meat (`cured_meat`) | — |
| 🥩 Beef (`beef`) + 🍶 Soy Sauce (`soy_sauce`) + 💧 Water (`water`) | 🍲 Sukiyaki (`sukiyaki`) | — |
| 🥩 Beef (`beef`) + 🍅 Tomato (`tomato`) + 💧 Water (`water`) | 🍲 Goulash (`goulash`) | — |
| 🥩 Beef (`beef`) + 💧 Water (`water`) | 🥣 Bone Broth (`bone_broth`) | — |
| 🥩 Beef (`beef`) + 💧 Water (`water`) + 🫚 Ginger (`ginger`) + 🍚 Rice (`rice`) | 🥣 Pho Bo (`pho_bo`) | — |
| 🥩 Beef (`beef`) + 💧 Water (`water`) + 🍄 Mushrooms (`mushrooms`) | 🥩 Beef Bourguignon (`beef_bourguignon`) | — |
| 🟣 Beet (`beet`) + 🥬 Cabbage (`cabbage`) + 🥩 Beef (`beef`) | 🥣 Borscht (`borscht`) | — |
| 🥬 Cabbage (`cabbage`) + 🥩 Beef (`beef`) + 🍚 Rice (`rice`) | 🥬 Cabbage Rolls (`cabbage_rolls`) | — |
| 🥬 Cabbage (`cabbage`) + 🌶️ Chili (`chili`) + 🧂 Salt (`salt`) | 🥬 Kimchi (`kimchi`) | — |
| 🥬 Cabbage (`cabbage`) + 🧂 Salt (`salt`) | 🥬 Sauerkraut (`sauerkraut`) | — |
| 🥬 Cabbage (`cabbage`) + 💧 Water (`water`) | 🥬 Saag (`saag`) | — |
| 🥕 Carrot (`carrot`) + ⛲ Spring Water (`spring_water`) | 🥕 Carrot Broth (`carrot_broth`) | Carrot and water simmered into a clear, sweet broth. |
| 🍗 Chicken (`chicken`) + 🍄 Mushrooms (`mushrooms`) | 🍗 Coq au Vin (`coq_au_vin`) | — |
| 🍗 Chicken (`chicken`) + 🥜 Peanuts (`peanuts`) | 🍢 Satay (`satay`) | — |
| 🍗 Chicken (`chicken`) + 🍅 Tomato (`tomato`) + 🥛 Cream (`cream`) | 🍗 Butter Chicken (`butter_chicken`) | — |
| 🍗 Chicken (`chicken`) + 🥛 Yogurt (`yogurt`) | 🍗 Tandoori Chicken (`tandoori_chicken`) | — |
| 🫘 Chickpeas (`chickpeas`) + 🌾 Flour (`flour`) | 🧆 Falafel (`falafel`) | — |
| 🫘 Chickpeas (`chickpeas`) + 🥣 Tahini (`tahini`) + 🍋 Citrus (`citrus`) | 🥣 Hummus (`hummus`) | — |
| 🫘 Chickpeas (`chickpeas`) + 🍅 Tomato (`tomato`) + 💧 Water (`water`) | 🍲 Chana Masala (`chana_masala`) | — |
| 🌶️ Chili (`chili`) + 🍫 Cocoa (`cocoa`) + 🌻 Seeds (`seeds`) | 🥣 Mole Poblano (`mole_poblano`) | — |
| 🌶️ Chili (`chili`) + 🌾 Rice Flour (`rice_flour`) + 🦠 Yeast (`yeast`) | 🍶 Gochujang (`gochujang`) | — |
| 🐟 Cleaned Fish (`cleaned_fish`) + 🥢 Julienned Ginger (`julienned_ginger`) + 🌿 Julienned Scallions (`julienned_scallions`) | 🐟 Prepared Fish (`prepared_fish`) | You arranged the cleaned fish on a platter with ginger and scallions. |
| 🐟 Cooked Steamed Fish (`cooked_steamed_fish`) + 🍶 Soy Sauce (`soy_sauce`) + 🔥 Hot Oil (`hot_oil`) | 🐟 Cantonese Steamed Fish (`cantonese_steamed_fish`) | You splashed the shimmering hot oil over the fish, followed by soy sauce. The kitchen filled with a magnificent aroma. |
| 🌽 Corn (`corn`) + 🧀 Cheese (`cheese`) + 🫘 Beans (`beans`) | 🫓 Pupusa (`pupusa`) | — |
| 🌽 Corn (`corn`) + 🥚 Egg (`egg`) + 🥛 Milk (`milk`) | 🍞 Cornbread (`cornbread`) | — |
| 🌽 Corn (`corn`) + 🥩 Pork (`pork`) + 💧 Water (`water`) | 🫔 Tamale (`tamale`) | — |
| 🌽 Corn (`corn`) + 💧 Water (`water`) | 🫓 Corn Tortilla (`corn_tortilla`) | — |
| 🥛 Cream (`cream`) + 🧂 Salt (`salt`) | 🧈 Butter (`butter`) | — |
| 🍞 Dough (`dough`) + 🌿 Basil (`basil`) | 🫓 Manakish (`manakish`) | — |
| 🍞 Dough (`dough`) + 🦠 Yeast (`yeast`) | 🥖 Baguette (`baguette`) | — |
| 🦆 Duck (`duck`) + 🧈 Butter (`butter`) | 🥩 Confit (`confit`) | — |
| 🦆 Duck (`duck`) + 🍯 Honey (`honey`) + 🍶 Soy Sauce (`soy_sauce`) | 🦆 Peking Duck (`peking_duck`) | — |
| 🥚 Egg (`egg`) + 🧈 Butter (`butter`) + 🍋 Citrus (`citrus`) | 🥣 Hollandaise (`hollandaise`) | — |
| 🥚 Egg (`egg`) + 🥛 Cream (`cream`) + 🌾 Flour (`flour`) | 🥧 Quiche (`quiche`) | — |
| 🥚 Egg (`egg`) + 🥛 Cream (`cream`) + 🍯 Honey (`honey`) | 🍮 Crème Brûlée (`creme_brulee`) | — |
| 🥚 Egg (`egg`) + 🥔 Potato (`potato`) | 🍳 Tortilla Española (`tortilla_espanola`) | — |
| 🥚 Egg (`egg`) + 🍅 Tomato (`tomato`) + 🌶️ Chili (`chili`) | 🍳 Shakshuka (`shakshuka`) | — |
| 🍆 Eggplant (`eggplant`) + 🥩 Beef (`beef`) + 🥛 Milk (`milk`) | 🥘 Moussaka (`moussaka`) | — |
| 🍆 Eggplant (`eggplant`) + 🍅 Tomato (`tomato`) | 🥘 Ratatouille (`ratatouille`) | — |
| 🌾 Flour (`flour`) + 🥩 Beef (`beef`) | 🥟 Empanada (`empanada`) | — |
| 🌾 Flour (`flour`) + 🥩 Beef (`beef`) + 🥩 Pork (`pork`) | 🥟 Pelmeni (`pelmeni`) | — |
| 🌾 Flour (`flour`) + 🧈 Butter (`butter`) + 🦠 Yeast (`yeast`) | 🥐 Croissant (`croissant`) | — |
| 🌾 Flour (`flour`) + 🥬 Cabbage (`cabbage`) + 🥚 Egg (`egg`) + 🥩 Pork (`pork`) | 🥞 Okonomiyaki (`okonomiyaki`) | — |
| 🌾 Flour (`flour`) + 🥚 Egg (`egg`) + 🥓 Cured Pork (`cured_pork`) + 🧀 Cheese (`cheese`) | 🍝 Pasta Carbonara (`pasta_carbonara`) | — |
| 🌾 Flour (`flour`) + 🥚 Egg (`egg`) + 🦐 Shrimp (`shrimp`) | 🍤 Tempura (`tempura`) | — |
| 🌾 Flour (`flour`) + 🥜 Nuts (`nuts`) + 🍯 Honey (`honey`) | 📐 Baklava (`baklava`) | — |
| 🌾 Flour (`flour`) + 🥩 Pork (`pork`) + 💧 Water (`water`) | 🥟 Dim Sum (Xiaolongbao) (`xiaolongbao`) | — |
| 🌾 Flour (`flour`) + 🥔 Potato (`potato`) + 🧀 Cheese (`cheese`) | 🥟 Pierogi (`pierogi`) | — |
| 🌾 Flour (`flour`) + 🥔 Potato (`potato`) + 🌻 Seeds (`seeds`) | 🥟 Samosa (`samosa`) | — |
| 🌾 Flour (`flour`) + 💧 Water (`water`) | 🍞 Dough (`dough`) | You mixed flour and water, kneading them into a smooth, elastic dough ball. |
| 🌾 Flour (`flour`) + 💧 Water (`water`) | 🍚 Couscous (`couscous`) | — |
| 🌾 Flour (`flour`) + 💧 Water (`water`) | 🍞 Bannock (`bannock`) | — |
| 🌾 Flour (`flour`) + 💧 Water (`water`) | 🫓 Flatbread (`flatbread`) | — |
| 🌾 Flour (`flour`) + 💧 Water (`water`) + 🦠 Yeast (`yeast`) | 🫓 Naan (`naan`) | — |
| 🌾 Flour (`flour`) + 💧 Water (`water`) + 🦠 Yeast (`yeast`) | 🫓 Injera (`injera`) | — |
| 🍎 Fruits (`fruits`) + 🌶️ Chili (`chili`) + 🥜 Peanuts (`peanuts`) + 🍋 Citrus (`citrus`) | 🥗 Green Papaya Salad (`green_papaya_salad`) | — |
| 🍎 Fruits (`fruits`) + 🥩 Pork (`pork`) | 🥣 Mofongo (`mofongo`) | — |
| 🍎 Fruits (`fruits`) + 💧 Water (`water`) | 🍷 Fermented Drink (`fermented_drink`) | — |
| 🫘 Lentils (`lentils`) + 💧 Water (`water`) | 🥣 Dal (`dal`) | — |
| 🥣 Mashed Potato (`mashed_potato`) + 🍎 Charred Apple (`charred_apple`) | 🔥 Hearth Mash (`hearth_mash`) | Mash and charred fruit came together into a smoky-sweet hearth dish. |
| 🥣 Mashed Potato (`mashed_potato`) + ⛲ Spring Water (`spring_water`) | 🍲 Tuber Stew (`tuber_stew`) | Mash and water loosened into a simple, filling stew. |
| 🍉 Melon Seed (`melon_seed`) + 💧 Water (`water`) + 🥬 Cabbage (`cabbage`) | 🥣 Egusi Soup (`egusi_soup`) | — |
| 🥛 Milk (`milk`) + 🍋 Citrus (`citrus`) | 🧀 Cheese (`cheese`) | — |
| 🧅 Onion (`onion`) + 💧 Water (`water`) + 🧀 Cheese (`cheese`) | 🥣 Onion Soup (`onion_soup`) | — |
| 🥩 Pork (`pork`) + 🍋 Citrus (`citrus`) + 🌶️ Chili (`chili`) | 🍛 Vindaloo (`vindaloo`) | — |
| 🥩 Pork (`pork`) + 🍯 Honey (`honey`) + 🍶 Soy Sauce (`soy_sauce`) | 🥓 Char Siu (`char_siu`) | — |
| 🥩 Pork (`pork`) + 🧂 Salt (`salt`) | 🥓 Cured Pork (`cured_pork`) | — |
| 🥩 Pork (`pork`) + 💧 Water (`water`) + 🌾 Rice Flour (`rice_flour`) | 🍜 Tonkotsu Ramen (`tonkotsu_ramen`) | — |
| 🍚 Rice (`rice`) + 🍗 Chicken (`chicken`) + 🌻 Seeds (`seeds`) | 🍛 Biryani (`biryani`) | — |
| 🍚 Rice (`rice`) + 🥥 Coconuts (`coconuts`) + 🦐 Shrimp (`shrimp`) + 🌶️ Chili (`chili`) | 🍜 Laksa (`laksa`) | — |
| 🍚 Rice (`rice`) + 🥚 Egg (`egg`) + 🥜 Peanuts (`peanuts`) + 🦐 Shrimp (`shrimp`) | 🍜 Pad Thai (`pad_thai`) | — |
| 🍚 Rice (`rice`) + 🍶 Gochujang (`gochujang`) + 💧 Water (`water`) | 🍲 Tteokbokki (`tteokbokki`) | — |
| 🍚 Rice (`rice`) + 🫘 Lentils (`lentils`) + 💧 Water (`water`) | 🥞 Dosa (`dosa`) | — |
| 🍚 Rice (`rice`) + 🫚 Roots (`roots`) + 🥚 Egg (`egg`) + 🍶 Gochujang (`gochujang`) | 🥣 Bibimbap (`bibimbap`) | — |
| 🍚 Rice (`rice`) + 🫙 Shrimp Paste (`shrimp_paste`) + 🌶️ Chili (`chili`) | 🍛 Nasi Goreng (`nasi_goreng`) | — |
| 🍚 Rice (`rice`) + 🦐 Shrimp (`shrimp`) + 🦪 Shellfish (`shellfish`) | 🥘 Paella (`paella`) | — |
| 🍚 Rice (`rice`) + 🦐 Shrimp (`shrimp`) + 🌱 Shoots (`shoots`) | 🌯 Spring Rolls (`spring_rolls`) | — |
| 🍚 Rice (`rice`) + 🍅 Tomato (`tomato`) + 💧 Water (`water`) | 🍛 Jollof Rice (`jollof_rice`) | — |
| 🍚 Rice (`rice`) + 💧 Water (`water`) | 🥣 Congee (`congee`) | — |
| 🍚 Rice (`rice`) + 💧 Water (`water`) | 🍚 Risotto (`risotto`) | — |
| 🫚 Roots (`roots`) + 🍋 Citrus (`citrus`) | 🥒 Pickled Vegetables (`pickled_vegetables`) | — |
| 🌻 Seeds (`seeds`) + 💧 Water (`water`) | 🌱 Sprouted Seeds (`sprouted_seeds`) | The seeds swelled and split, sending out pale shoots. |
| 🌻 Seeds (`seeds`) + 💧 Water (`water`) + 🧂 Salt (`salt`) | ⬜ Tofu (`tofu`) | — |
| 🌻 Seeds (`seeds`) + 🦠 Yeast (`yeast`) | 🍶 Miso / Soybean Paste (`soy_paste`) | — |
| ⚪ Sesame (`sesame`) + 🧂 Salt (`salt`) | 🥣 Tahini (`tahini`) | — |
| 🦪 Shellfish (`shellfish`) + 🥔 Potato (`potato`) + 🥛 Cream (`cream`) + 💧 Water (`water`) | 🥣 Clam Chowder (`clam_chowder`) | — |
| 🦐 Shrimp (`shrimp`) + 🌾 Flour (`flour`) + 💧 Water (`water`) | 🍲 Gumbo (`gumbo`) | — |
| 🦐 Shrimp (`shrimp`) + 💧 Water (`water`) + 🌶️ Chili (`chili`) + 🍋 Citrus (`citrus`) | 🍲 Tom Yum Goong (`tom_yum_goong`) | — |
| 🦐 Shrimp (`shrimp`) + 🦠 Yeast (`yeast`) | 🫙 Shrimp Paste (`shrimp_paste`) | — |
| 🍶 Miso / Soybean Paste (`soy_paste`) + 💧 Water (`water`) | 🥣 Miso Soup (`miso_soup`) | — |
| 🌱 Sprouted Seeds (`sprouted_seeds`) + ⛲ Spring Water (`spring_water`) | 🥛 Seed Tonic (`seed_tonic`) | Sprouted seeds broke down into a mellow, drinkable tonic. |
| 🍓 Strawberry (`strawberry`) + ⛲ Spring Water (`spring_water`) | 🍵 Berry Brew (`berry_brew`) | Berries and spring water mingled into a fragrant brew. |
| 🍠 Sweet Potato (`sweet_potato`) + 🫚 Roots (`roots`) + 🍶 Soy Sauce (`soy_sauce`) | 🍜 Japchae (`japchae`) | — |
| ⬜ Tofu (`tofu`) + 🌶️ Chili (`chili`) + 🥩 Pork (`pork`) | 🍲 Mapo Tofu (`mapo_tofu`) | — |
| 🍅 Tomato (`tomato`) + 🧀 Cheese (`cheese`) + 🌿 Basil (`basil`) | 🥗 Caprese (`caprese`) | — |
| 🍅 Tomato (`tomato`) + 🫚 Roots (`roots`) | 🥣 Gazpacho (`gazpacho`) | — |
| 💧 Water (`water`) + 🥩 Beef (`beef`) + 🥬 Cabbage (`cabbage`) + 🌶️ Chili (`chili`) | 🍲 Hot Pot (`hot_pot`) | — |
| 💧 Water (`water`) + 🥕 Carrot (`carrot`) + 🍄 Button Mushroom (`button_mushroom`) | 🍲 Raw Stew Pot (`raw_stew_pot`) | You placed the roots, wild mushrooms, and water together in a cooking vessel. |
| 🌾 Wheat (`wheat`) + 🥩 Beef (`beef`) + 🥜 Nuts (`nuts`) | 🧆 Kibbeh (`kibbeh`) | — |
| 🐟 Whole Fish (`whole_fish`) + 🍋 Citrus (`citrus`) + 🌶️ Chili (`chili`) | 🥗 Ceviche (`ceviche`) | — |
| 🐟 Whole Fish (`whole_fish`) + 🦪 Shellfish (`shellfish`) + 💧 Water (`water`) | 🍲 Bouillabaisse (`bouillabaisse`) | — |
| 🥛 Yogurt (`yogurt`) + 🫚 Roots (`roots`) | 🥣 Tzatziki (`tzatziki`) | — |

## Vertical slice chains

End-to-end paths currently playable:

```
tubers --separate--> potato --smash--> mashed_potato
apple --char--> charred_apple
seeds + water --combine--> sprouted_seeds
mashed_potato + charred_apple --combine--> hearth_mash (recipe)
strawberry + spring_water --combine--> berry_brew (recipe)
```
