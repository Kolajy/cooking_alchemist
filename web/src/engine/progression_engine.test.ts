import { ProgressionEngine } from "./progression_engine";
import { ProgressionConfig } from "../types";

function assert(condition: boolean, message: string) { if (!condition) throw new Error(message); }

const mockConfig: ProgressionConfig = {
  techniques: {
    chop: { id: "chop", name: "Chop", order: 1, baseExpForNextTier: 10, category: "prep" },
    dice: { id: "dice", name: "Dice", order: 2, baseExpForNextTier: 20, category: "prep", dependsOn: ["chop"], unlockCriteria: { prerequisites: { chop: 10 } } },
    mince: { id: "mince", name: "Mince", order: 3, baseExpForNextTier: 30, category: "prep", dependsOn: ["dice"], unlockCriteria: { prerequisites: { dice: 20 } } },
    boil: { id: "boil", name: "Boil", order: 1, baseExpForNextTier: 10, category: "cook" }
  },
  playerActions: {
    prep_mode: { name: "Prep Mode", mode: "chop", categories: ["prep"] }
  },
  techniqueCategories: {
    prep: { name: "Preparation", description: "Prep stuff", type: "tool" },
    cook: { name: "Cooking", description: "Cook stuff", type: "tool" }
  },
  milestones: [
    { recipesCount: 5, unlocks: ["secret_spice"], message: "Milestone 1", description: "Desc 1" }
  ]
};

const engine = new ProgressionEngine(mockConfig);

// Test initial XP state
assert(engine.getXP("chop") === 0, "XP should default to 0");
assert(engine.getXP("dice") === 0, "XP should default to 0");
assert(engine.getXP("prep_mode") === 0, "Action mode XP should default to 0");

// Test isUnlocked
assert(engine.isUnlocked("chop") === true, "Chop should be unlocked initially");
assert(engine.isUnlocked("dice") === false, "Dice should be locked initially");

// Test addXP and unlock triggers
const result1 = engine.addXP("chop", 5);
assert(engine.getXP("chop") === 5, "XP should be added");
assert(result1.leveledUp === false, "Should not level up yet");
assert(engine.isUnlocked("dice") === false, "Dice should still be locked");

const result2 = engine.addXP("chop", 5);
assert(engine.getXP("chop") === 10, "XP should be 10");
assert(result2.leveledUp === true, "Should level up");
assert(result2.newlyUnlockedSkills.length === 1 && result2.newlyUnlockedSkills[0].id === "dice", "Dice should be newly unlocked");
assert(engine.isUnlocked("dice") === true, "Dice should now be unlocked");

// Test getActiveTier
const activePrep = engine.getActiveTier("prep");
assert(activePrep !== null && activePrep.id === "dice", "Active tier for prep should be dice");

const activeCook = engine.getActiveTier("cook");
assert(activeCook !== null && activeCook.id === "boil", "Active tier for cook should be boil");

const activeUnknown = engine.getActiveTier("unknown");
assert(activeUnknown === null, "Active tier for unknown category should be null");

// Test getToolCategory
assert(engine.getToolCategory("chop") === "prep", "Tool category for chop should be prep");
assert(engine.getToolCategory("unknown") === null, "Tool category for unknown tool should be null");

// Test isActionMode
assert(engine.isActionMode("prep_mode") === true, "prep_mode should be an action mode");
assert(engine.isActionMode("chop") === false, "chop should not be an action mode");

// Test checkMilestoneUnlocks and getUnlockedIngredients
const milestones0 = engine.checkMilestoneUnlocks(4);
assert(milestones0.length === 0, "No milestones should be unlocked at 4 discoveries");
assert(engine.getUnlockedIngredients().length === 0, "No unlocked ingredients yet");

const milestones1 = engine.checkMilestoneUnlocks(5);
assert(milestones1.length === 1, "Milestone 1 should be unlocked at 5 discoveries");
assert(milestones1[0].unlocks.includes("secret_spice"), "Milestone 1 should unlock secret_spice");

const unlockedIngs = engine.getUnlockedIngredients();
assert(unlockedIngs.length === 1 && unlockedIngs[0] === "secret_spice", "secret_spice should be in unlocked ingredients");

const milestones2 = engine.checkMilestoneUnlocks(6);
assert(milestones2.length === 0, "Milestone 1 shouldn't trigger again");

console.log("=== PROGRESSION ENGINE TESTS PASSED ===");
