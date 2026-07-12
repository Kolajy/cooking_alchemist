/**
 * Content completeness report.
 * Scans ingredients for descriptions and science tips.
 * Scans recipes for completion blurbs.
 */

import "../data/index";
import type { DiscoverableMap } from "../../../content/types";

function runReport() {
  const starters = (globalThis as any).STARTER_ELEMENTS || [];
  const unlockables = (globalThis as any).UNLOCKABLE_ELEMENTS || [];
  const discoverable: DiscoverableMap = (globalThis as any).DISCOVERABLE_ITEMS || {};

  const allItems = [
    ...starters,
    ...unlockables,
    ...Object.values(discoverable)
  ];

  let ingredientCount = 0;
  let ingredientDescCount = 0;
  let ingredientTipCount = 0;

  let recipeCount = 0;
  let recipeBlurbCount = 0;

  for (const item of allItems) {
    if (item.type === "recipe") {
      recipeCount++;
      if (item.blurb) {
        recipeBlurbCount++;
      }
    } else {
      ingredientCount++;
      if (item.description) {
        ingredientDescCount++;
      }
      if (item.blurb || item.tip) {
        ingredientTipCount++;
      }
    }
  }

  const descPct = ingredientCount > 0 ? (ingredientDescCount / ingredientCount) * 100 : 100;
  const tipPct = ingredientCount > 0 ? (ingredientTipCount / ingredientCount) * 100 : 100;
  const blurbPct = recipeCount > 0 ? (recipeBlurbCount / recipeCount) * 100 : 100;

  console.log("=========================================");
  console.log("       CONTENT COMPLETENESS REPORT       ");
  console.log("=========================================");
  console.log(`Ingredients:       ${ingredientCount}`);
  console.log(` - Descriptions:   ${ingredientDescCount} (${descPct.toFixed(1)}%)`);
  console.log(` - Science Tips:   ${ingredientTipCount} (${tipPct.toFixed(1)}%)`);
  console.log(`Recipes:           ${recipeCount}`);
  console.log(` - Completion Blurbs: ${recipeBlurbCount} (${blurbPct.toFixed(1)}%)`);
  console.log("=========================================");

  if (descPct < 50 || tipPct < 50 || blurbPct < 50) {
    console.error("Error: Content completeness is below 50%.");
    process.exit(1);
  } else {
    console.log("Content completeness is 50% or above.");
    process.exit(0);
  }
}

runReport();
