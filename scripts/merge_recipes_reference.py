#!/usr/bin/env python3
"""Merge Part I + Part II into docs/RECIPES_REFERENCE.md"""

from pathlib import Path

ROOT = Path(__file__).parent.parent
PART1_END = "#### Japanese Kaiseki"
APPENDIX_A = """## Appendix A: Era Timeline Summary

| Era | Defining shift | Representative techniques |
|-----|----------------|---------------------------|
| Stone Age | Foraging, fire, stone tools | heat, smash, dry, thresh |
| Ancient | Agriculture, cities, trade | ferment, mill, boil, press |
| Medieval | Feudal kitchens, fasting laws, spices | layer, wrap, bind, smoke |
| Industrial | Canning, milling, rail, standardization | mill, can (heat seal), dry |
| Modern | Global fusion, refrigeration, craft revival | steam, ferment (controlled), coat |

---

## Appendix B: Primal Ingredient → Category Map

| Game primal | Separated examples | Primary recipe categories |
|-------------|-------------------|---------------------------|
| grasses | wheat, barley, rice, rye, oats | Grain, Fermented, Combined |
| fruits | apple, grape, mango, lemon | Fruit, Fermented, Combined |
| berries | strawberry, blueberry, raspberry | Fruit, Fermented |
| tubers | potato, yam, cassava, taro | Tuber, Combined |
| roots | carrot, ginger, beet, radish | Tuber/Root, Fermented, Combined |
| nuts | almond, walnut, pistachio | Nut, Combined |
| seeds | sesame, sunflower, chia, flax | Nut/Seed, Fermented, Combined |
| shellfish | shrimp, oyster, clam, mussel | Seafood, Combined |
| mushrooms | shiitake, portobello, chanterelle | Mushroom, Combined |
| shoots | asparagus, bamboo, watercress | Leaf/Shoot, Combined |
| water | spring, mineral, seawater | All (medium), Combined |

---

## Appendix C: Cuisine Index (Quick Lookup)

| Culture | Dishes | Representative dishes |
|---------|--------|----------------------|
| **Chinese** | 12 | Congee, jiaozi, Peking duck, mapo tofu, fried rice, hot pot, mooncake, wonton soup, dan dan noodles, char siu, xiaolongbao, kung pao chicken |
| **Japanese** | 10 | Ramen, tempura, miso soup, onigiri, okonomiyaki, tonkatsu, yakitori, wagashi, udon, takoyaki |
| **Korean** | 8 | Bibimbap, kimchi jjigae, galbi, japchae, tteokbokki, sundubu, samgyeopsal, haemul pajeon |
| **Vietnamese** | 6 | Phở, bánh mì, bún chả, gỏi cuốn, cà phê sữa đá, bún bò Huế |
| **Thai** | 6 | Pad thai, tom yum, green curry, som tam, mango sticky rice, massaman |
| **Indian (North)** | 8 | Naan, dal tadka, butter chicken, samosa, chole bhature, paratha, rogan josh, tandoori chicken |
| **Indian (South)** | 7 | Dosa, idli, sambar, Hyderabadi biryani, rasam, uttapam, fish curry |
| **Pakistani** | 3 | Nihari, seekh kebab, Sindhi biryani |
| **Bengali** | 4 | Macher jhol, roshogolla, shorshe ilish, luchi with aloor dom |
| **Nepalese** | 3 | Dal bhat, momo, sel roti |
| **Sri Lankan** | 5 | Hoppers, kottu roti, string hoppers, lamprais, pol sambol |
| **Indonesian** | 5 | Nasi goreng, rendang, satay, gado-gado, gudeg |
| **Malaysian** | 3 | Nasi lemak, laksa, char kway teow |
| **Filipino** | 5 | Adobo, sinigang, lumpia, lechon, kare-kare |
| **Cambodian** | 3 | Fish amok, lok lak, nom banh chok |
| **Burmese** | 3 | Mohinga, laphet thoke, ohn no khao swe |
| **Levantine** | 6 | Falafel, hummus, tabbouleh, kibbeh, shawarma, manakish |
| **Turkish** | 5 | Döner, lahmacun, börek, menemen, baklava |
| **Persian** | 4 | Chelow kabab, tahdig, fesenjan, ash reshteh |
| **Moroccan** | 4 | Couscous, tagine, harira, pastilla |
| **Egyptian** | 4 | Koshari, ful medames, mahshi, molokhia |
| **French** | 7 | Coq au vin, ratatouille, croissant, bouillabaisse, crème brûlée, cassoulet, quiche |
| **Italian** | 8 | Pizza, carbonara, risotto, lasagna, osso buco, pesto, tiramisu, gelato |
| **Spanish** | 5 | Paella, gazpacho, tortilla española, jamón, churros |
| **Portuguese** | 3 | Bacalhau à brás, pastel de nata, caldo verde |
| **Greek** | 4 | Moussaka, souvlaki, spanakopita, tzatziki |
| **German** | 4 | Bratwurst, sauerkraut, pretzel, sauerbraten |
| **British** | 4 | Fish and chips, shepherd's pie, Yorkshire pudding, full English |
| **Irish** | 4 | Irish stew, soda bread, colcannon, boxty |
| **Scandinavian** | 4 | Gravlax, Swedish meatballs, smørrebrød, lutefisk |
| **Eastern European** | 5 | Pierogi, borscht, goulash, blini, pelmeni |
| **Austrian** | 3 | Wiener schnitzel, apfelstrudel, tafelspitz |
| **Swiss** | 3 | Fondue, rösti, zürcher geschnetzeltes |
| **Belgian** | 3 | Moules-frites, Belgian waffles, waterzooi |
| **Dutch** | 3 | Stroopwafel, bitterballen, erwtensoep |
| **Icelandic** | 3 | Plokkfiskur, skyr, kjötsúpa |
| **West African** | 5 | Jollof rice, egusi soup, suya, thieboudienne, fufu |
| **Ethiopian** | 3 | Injera, doro wat, shiro wat |
| **North African** | 2 | Shakshuka, méchoui |
| **Southern African** | 5 | Bobotie, pap, boerewors, bunny chow, potjiekos |
| **Mexican** | 7 | Tacos al pastor, tamales, mole poblano, pozole, guacamole, enchiladas, chiles rellenos |
| **Peruvian** | 4 | Ceviche, lomo saltado, anticuchos, causa |
| **Brazilian** | 4 | Feijoada, pão de queijo, moqueca, brigadeiro |
| **Argentinian** | 3 | Asado, empanadas, dulce de leche |
| **Colombian** | 3 | Bandeja paisa, arepas, ajiaco |
| **Chilean** | 3 | Empanada de pino, pastel de choclo, cazuela |
| **Venezuelan** | 2 | Pabellón criollo, hallacas |
| **Caribbean** | 4 | Jerk chicken, rice and peas, callaloo, roti |
| **Central American** | 5 | Pupusas, gallo pinto, street tacos, ceviche, riguas |
| **Cuban** | 3 | Ropa vieja, Cuban sandwich, moros y cristianos |
| **USA** | 6 | Clam chowder, BBQ brisket, gumbo, jambalaya, mac and cheese, hamburger |
| **Polynesian** | 4 | Poke, hangi, poi, lomi lomi salmon |
| **Mongolian** | 3 | Buuz, khorkhog, boodog |
| **Tibetan** | 3 | Momo, tsampa, thenthuk |

Part I (sections 1–11) adds ~110 era-organized dishes by ingredient category. Part II adds culture-organized flagship dishes. See Appendix D for per-culture counts.

---

"""


def main():
    main_path = ROOT / "docs" / "RECIPES_REFERENCE.md"
    part2_path = ROOT / "scripts" / "recipes_part2_output.md"

    text = main_path.read_text(encoding="utf-8")

    # Extract Part I only (through Kaiseki entry)
    idx = text.find(PART1_END)
    if idx == -1:
        raise SystemExit(f"Could not find Part I end marker: {PART1_END}")
    # Include full Kaiseki section through its closing ---
    kaiseki_end = text.find("\n---\n", idx)
    part1 = text[: kaiseki_end + len("\n---\n")]

    part2_full = part2_path.read_text(encoding="utf-8")
    part2 = part2_full.split("## Appendix D:")[0].strip()
    idx = part2_full.index("## Appendix D:")
    appendix_d = part2_full[idx:].strip()

    total_part2 = appendix_d.split("**Total Part II dishes:**")[1].split("\n")[0].strip()
    total = 110 + int(total_part2)

    footer = (
        f"\n---\n\n*Document version: 2.0 · ~{total} dishes across 54+ cultures · "
        "Part I (ingredient categories) + Part II (regional compendium) · "
        "aligned with Culinary Alchemy data primitives and technique verb set · "
        "for game content authoring and educational reference.*\n"
    )

    merged = part1 + "\n" + part2 + "\n\n" + APPENDIX_A + appendix_d + footer
    main_path.write_text(merged, encoding="utf-8")
    print(f"Merged: {len(merged.splitlines())} lines, ~{total} dishes")


if __name__ == "__main__":
    main()
