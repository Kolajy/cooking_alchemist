# Culinary Alchemy — Transitions

> **Auto-generated** from `content/` on 2026-06-18. Do not edit by hand.
> Regenerate with `npm run docs:generate` after content changes.

## Summary

| Kind | Count |
|------|------:|
| Technique | 13 |
| Combine | 6 |

## Technique transitions

Grouped by primary tool. `onePerAction` separation chains yield one undiscovered output per use.

### `char` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🍎 Apple (`apple`) | 🍎 Charred Apple (`charred_apple`) | `char`, `roast` | no | Char fruit over flame to deepen sweetness before finishing a dish. |

### `separate` (11)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🫐 Berries (`berries`) | 🍓 Strawberry (`strawberry`)<br>🍒 Raspberry (`raspberry`)<br>🫐 Blueberry (`blueberry`)<br>🍇 Blackberry (`blackberry`) | `separate`, `peel`, `tear` | yes | Mixed berry patches ripen unevenly — separate them one at a time to sort each fruit. |
| 🍎 Fruits (`fruits`) | 🍎 Apple (`apple`)<br>🍌 Banana (`banana`)<br>🍊 Orange (`orange`)<br>🍇 Grape (`grape`)<br>🍐 Pear (`pear`)<br>🍉 Watermelon (`watermelon`)<br>🥭 Mango (`mango`)<br>🍍 Pineapple (`pineapple`)<br>🍋 Lemon (`lemon`)<br>🍑 Peach (`peach`) | `separate`, `peel`, `tear` | yes | Mixed fruit baskets hide surprises — separate them one at a time to learn what you have. |
| 🌾 Grasses (`grasses`) | 🌾 Wheat (`wheat`)<br>🌾 Barley (`barley`)<br>🥣 Oats (`oats`)<br>🍚 Rice (`rice`)<br>🌾 Rye (`rye`) | `separate`, `peel`, `tear` | yes | A handful of grasses holds many cereals — separate them stalk by stalk. |
| 🍄 Mushrooms (`mushrooms`) | 🍄 Button Mushroom (`button_mushroom`)<br>🍄‍🟫 Shiitake (`shiitake`)<br>🦪 Oyster Mushroom (`oyster_mushroom`)<br>🍄 Portobello (`portobello`)<br>🌼 Chanterelle (`chanterelle`) | `separate`, `peel`, `tear` | yes | Never rush a mushroom basket — separate and identify each find one at a time. |
| 🥜 Nuts (`nuts`) | 🌰 Almond (`almond`)<br>🥜 Walnut (`walnut`)<br>🌰 Pecan (`pecan`)<br>🌰 Hazelnut (`hazelnut`)<br>🟢 Pistachio (`pistachio`) | `separate`, `peel`, `tear` | yes | Mixed nuts rattle together — separate them one shell at a time. |
| 🫚 Roots (`roots`) | 🥕 Carrot (`carrot`)<br>🫚 Ginger (`ginger`)<br>🟣 Beet (`beet`)<br>🔴 Radish (`radish`)<br>🟡 Turnip (`turnip`) | `separate`, `peel`, `tear` | yes | Root patches hide many species — separate them carefully one at a time. |
| 🌻 Seeds (`seeds`) | 🌻 Sunflower Seed (`sunflower_seed`)<br>🎃 Pumpkin Seed (`pumpkin_seed`)<br>⚪ Sesame (`sesame`)<br>🌿 Flax (`flax`)<br>🫘 Chia (`chia`) | `separate`, `peel`, `tear` | yes | Seed sacks hold mixtures — separate them to learn what will sprout or roast. |
| 🦪 Shellfish (`shellfish`) | 🦐 Shrimp (`shrimp`)<br>🦪 Oyster (`oyster`)<br>🐚 Clam (`clam`)<br>🦪 Mussel (`mussel`)<br>🦀 Crab (`crab`) | `separate`, `peel`, `tear` | yes | Mixed shore harvests need sorting — separate each creature carefully. |
| 🌱 Shoots (`shoots`) | 🌿 Asparagus (`asparagus`)<br>🎋 Bamboo Shoot (`bamboo_shoot`)<br>🌱 Pea Shoot (`pea_shoot`)<br>🌱 Alfalfa Sprout (`alfalfa_sprout`)<br>💧 Watercress (`watercress`) | `separate`, `peel`, `tear` | yes | Young shoots look alike at a glance — separate them gently one by one. |
| 🥔 Tubers (`tubers`) | 🥔 Potato (`potato`)<br>🍠 Sweet Potato (`sweet_potato`)<br>🟤 Yam (`yam`)<br>🍠 Taro (`taro`)<br>🌿 Cassava (`cassava`) | `separate`, `peel`, `tear` | yes | Tuber piles look alike underground — separate them to sort each variety. |
| 💧 Water (`water`) | ⛲ Spring Water (`spring_water`)<br>🫧 Mineral Water (`mineral_water`)<br>🌧️ Rainwater (`rainwater`)<br>🌊 Seawater (`seawater`) | `separate`, `peel`, `tear` | yes | Water looks uniform until you separate it — spring, mineral, rain, and sea each behave differently in the pot. |

### `smash` (1)

| Input | Output(s) | All tools | One per action | Tip |
|-------|-----------|-----------|----------------|-----|
| 🥔 Potato (`potato`) | 🥣 Mashed Potato (`mashed_potato`) | `smash`, `pound` | no | Smash starchy tubers to break down fibers before mixing or cooking. |

## Combine transitions

Input order is commutative — keys are sorted ingredient ids.

| Inputs | Output | Description |
|--------|--------|-------------|
| 🥕 Carrot (`carrot`) + ⛲ Spring Water (`spring_water`) | 🥕 Carrot Broth (`carrot_broth`) | Carrot and water simmered into a clear, sweet broth. |
| 🥣 Mashed Potato (`mashed_potato`) + 🍎 Charred Apple (`charred_apple`) | 🔥 Hearth Mash (`hearth_mash`) | Mash and charred fruit came together into a smoky-sweet hearth dish. |
| 🥣 Mashed Potato (`mashed_potato`) + ⛲ Spring Water (`spring_water`) | 🍲 Tuber Stew (`tuber_stew`) | Mash and water loosened into a simple, filling stew. |
| 🌻 Seeds (`seeds`) + 💧 Water (`water`) | 🌱 Sprouted Seeds (`sprouted_seeds`) | The seeds swelled and split, sending out pale shoots. |
| 🌱 Sprouted Seeds (`sprouted_seeds`) + ⛲ Spring Water (`spring_water`) | 🥛 Seed Tonic (`seed_tonic`) | Sprouted seeds broke down into a mellow, drinkable tonic. |
| 🍓 Strawberry (`strawberry`) + ⛲ Spring Water (`spring_water`) | 🍵 Berry Brew (`berry_brew`) | Berries and spring water mingled into a fragrant brew. |

## Vertical slice chains

End-to-end paths currently playable:

```
tubers --separate--> potato --smash--> mashed_potato
apple --char--> charred_apple
seeds + water --combine--> sprouted_seeds
mashed_potato + charred_apple --combine--> hearth_mash (recipe)
strawberry + spring_water --combine--> berry_brew (recipe)
```
