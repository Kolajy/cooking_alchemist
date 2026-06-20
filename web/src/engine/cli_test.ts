/**
 * Culinary Alchemy - CLI Test Runner
 * Validates combinations, practice exp, and skill unlocks in Node.js.
 */

import "../data/index";
import "../progression_config";
import { ProgressionEngine } from "./progression_engine";
import { CombinationEngine } from "./combination_engine";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function runTests(): void {
  console.log("=== STARTING CULINARY ENGINE TESTS ===");

  const progression = new ProgressionEngine(globalThis.PROGRESSION_CONFIG);
  const combination = new CombinationEngine(
    globalThis.DISCOVERABLE_ITEMS,
    globalThis.TRANSITION_INDEX
  );

  const itemsCount = Object.keys(globalThis.DISCOVERABLE_ITEMS).length;
  assert(itemsCount === 224, `Discoverable items count is ${itemsCount} (expected 224)`);

  const techniqueMap = globalThis.TRANSITION_INDEX.getTechniqueItemMap();
  assert(
    Array.isArray(techniqueMap.separate) && techniqueMap.separate.includes("berries"),
    "Transition index maps separate → affectable items including berries."
  );
  assert(
    globalThis.TRANSITION_INDEX.getTechniqueTransition("separate", "berries")?.input === "berries",
    "Indexed lookup resolves separate + berries without scanning all items."
  );
  assert(progression.getXP("smash") === 0, "Smash starts at 0 exp.");
  assert(progression.isUnlocked("smash") === true, "Smash is unlocked at start.");
  assert(progression.isUnlocked("pound") === false, "Pound starts locked.");
  assert(progression.getXP("combine") === 0, "Combine exp starts at 0.");
  assert(progression.isUnlocked("hand_mix") === false, "Hand Mix starts locked (needs combine exp).");
  assert(progression.getXP("separate") === 0, "Separate exp starts at 0.");
  assert(progression.isUnlocked("peel") === false, "Peel starts locked (needs separate exp).");
  assert(progression.isUnlocked("tear") === false, "Tear starts locked (needs separate exp).");

  const noSmashOnPrimal = combination.matchToolRecipe("tubers", "force", progression);
  assert(noSmashOnPrimal.success === false, "Force does not work on unsorted primal tubers.");

  const smashPotato = combination.matchToolRecipe("potato", "force", progression);
  assert(smashPotato.success === true, "Force turns potato into mashed potato.");
  assert(smashPotato.recipe?.result.id === "mashed_potato", "Force output is mashed potato.");

  const charApple = combination.matchToolRecipe("apple", "char", progression);
  assert(charApple.success === true, "Char turns apple into charred apple.");
  assert(charApple.recipe?.result.id === "charred_apple", "Char output is charred apple.");

  let xpNotif1 = progression.addXP("smash", 1);
  assert(progression.getXP("smash") === 1, "Smash exp is now 1.");
  assert(xpNotif1.leveledUp === false, "Pound is still locked (needs 3 exp).");

  let xpNotif2 = progression.addXP("smash", 2);
  assert(progression.getXP("smash") === 3, "Smash exp reached 3.");
  assert(xpNotif2.leveledUp === true, "Smash practicing triggers skill unlock.");
  assert(xpNotif2.newlyUnlockedSkills[0].id === "pound", "Pound is newly unlocked!");
  assert(progression.isUnlocked("pound") === true, "Pound is now fully unlocked.");

  const activeSmashTier = progression.getActiveTier("smash");
  assert(activeSmashTier?.id === "pound", "Active smash-path skill is now Pound.");

  const mergeResult = combination.matchCombinationRecipe(["seeds", "water"]);
  assert(mergeResult.success === true, "Seeds and water combine into sprouted seeds.");
  assert(mergeResult.recipe?.result.id === "sprouted_seeds", "Combine output is sprouted seeds.");

  const berryBrew = combination.matchCombinationRecipe(["strawberry", "spring_water"]);
  assert(berryBrew.success === true, "Strawberry and spring water combine into berry brew.");
  assert(berryBrew.recipe?.result.type === "recipe", "Berry brew is a finalized recipe.");

  progression.addXP("combine", 3);
  assert(progression.isUnlocked("hand_mix") === true, "Hand Mix unlocks at 3 combine exp.");

  progression.addXP("separate", 2);
  assert(progression.isUnlocked("peel") === true, "Peel unlocks at 2 separate exp.");

  const berryMatch = combination.matchToolRecipe("berries", "separate", progression, {
    discoveredIds: new Set()
  });
  assert(berryMatch.success === true, "Berries separate into the first undiscovered fruit.");
  assert(berryMatch.recipe?.results?.length === 1, "Berry separation yields one output per action.");
  assert(berryMatch.recipe?.result.id === "strawberry", "First separation yields strawberry.");

  const berryMatch2 = combination.matchToolRecipe("berries", "separate", progression, {
    discoveredIds: new Set(["strawberry"])
  });
  assert(berryMatch2.recipe?.result.id === "raspberry", "Second separation yields raspberry.");

  const berryExhausted = combination.matchToolRecipe("berries", "separate", progression, {
    discoveredIds: new Set(["strawberry", "raspberry", "blueberry", "blackberry", "smashed_berries"])
  });
  assert(berryExhausted.success === false, "Separation fails when all berry types are discovered.");

  const fruitMatch = combination.matchToolRecipe("fruits", "separate", progression, {
    discoveredIds: new Set()
  });
  assert(fruitMatch.success === true, "Fruits separate into the first undiscovered fruit.");
  assert(fruitMatch.recipe?.results?.length === 1, "Fruit separation yields one output per action.");
  assert(fruitMatch.recipe?.result.id === "apple", "First fruit separation yields apple.");

  const fruitMatch2 = combination.matchToolRecipe("fruits", "separate", progression, {
    discoveredIds: new Set(["apple"])
  });
  assert(fruitMatch2.recipe?.result.id === "banana", "Second fruit separation yields banana.");

  const fruitExhausted = combination.matchToolRecipe("fruits", "separate", progression, {
    discoveredIds: new Set([
      "apple", "banana", "orange", "grape", "pear",
      "watermelon", "mango", "pineapple", "lemon", "peach"
    ])
  });
  assert(fruitExhausted.success === false, "Separation fails when all fruit types are discovered.");

  const waterMatch = combination.matchToolRecipe("water", "separate", progression, {
    discoveredIds: new Set()
  });
  assert(waterMatch.success === true, "Water separates into the first undiscovered type.");
  assert(waterMatch.recipe?.result.id === "spring_water", "First water separation yields spring water.");

  const rootsMatch = combination.matchToolRecipe("roots", "separate", progression, {
    discoveredIds: new Set()
  });
  assert(rootsMatch.success === true, "Roots separate one at a time.");
  assert(rootsMatch.recipe?.result.id === "carrot", "First root separation yields carrot.");

  const milestones = progression.checkMilestoneUnlocks(4);
  assert(milestones.length === 1, "First milestone unlocks at 3 discoveries.");
  assert(milestones[0].unlocks.includes("seeds"), "First milestone unlocks seeds.");

  console.log("=== ALL CULINARY ENGINE TESTS PASSED SUCCESSFULLY ===");
}

runTests();
