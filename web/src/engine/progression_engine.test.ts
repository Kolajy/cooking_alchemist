import { ProgressionEngine } from "./progression_engine";
import type { ProgressionConfig } from "../types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock ProgressionConfig
const mockConfig: ProgressionConfig = {
  maxSkillExp: 100,
  techniqueCategories: {
    "cutting": {
      label: "Cutting Tools",
      techniques: {} // not needed for this test's scope
    }
  },
  techniques: {
    "chop": {
      name: "Chop",
      emoji: "🔪",
      category: "cutting",
      actions: ["chop_action"],
    },
    "slice": {
      name: "Slice",
      emoji: "🗡️",
      category: "cutting",
      actions: ["slice_action"],
      dependsOn: ["chop"] // Depends on chop
    },
    "dice": {
      name: "Dice",
      emoji: "🎲",
      category: "cutting",
      actions: ["dice_action"],
      dependsOn: ["slice"] // Depends on slice, making chop its grandparent
    },
    "advanced_cut": {
      name: "Advanced Cut",
      emoji: "⚔️",
      category: "cutting",
      actions: ["adv_cut_action"],
      unlockCriteria: {
        prerequisites: {
          "chop": 50 // Requires 50 XP in chop
        }
      }
    }
  },
  playerActions: {
    "action_chop": {
      name: "Action Chop",
      emoji: "🪓",
      mode: "action_mode_chop"
    },
    "action_null_mode": {
      name: "Null Mode Action",
      emoji: "🚫"
      // No mode specified to test filter
    }
  },
  milestones: [
    {
      recipesCount: 5,
      unlocks: ["salt", "pepper"]
    },
    {
      recipesCount: 10,
      unlocks: ["sugar"]
    }
  ]
};

console.log("=== Testing Progression Engine ===");

// --- Initialization Tests ---
console.log("Testing Initialization...");
const engine = new ProgressionEngine(mockConfig);

// Techniques should be initialized to 0 XP
assert(engine.getXP("chop") === 0, "Chop should start with 0 XP");
assert(engine.getXP("slice") === 0, "Slice should start with 0 XP");

// Action modes should be initialized to 0 XP
assert(engine.getXP("action_mode_chop") === 0, "Action mode chop should start with 0 XP");

// --- XP Management Tests ---
console.log("Testing XP Management...");

// addXP should increase XP correctly
let xpResult = engine.addXP("chop", 20);
assert(engine.getXP("chop") === 20, "Chop XP should be 20");
assert(!xpResult.leveledUp, "Should not have leveled up advanced_cut yet");

// Cap at maxSkillExp
engine.addXP("chop", 100);
assert(engine.getXP("chop") === 100, "Chop XP should cap at maxSkillExp (100)");

// Check level up triggering logic
// With 100 XP in chop, advanced_cut prerequisite (50) is now met.
// BUT advanced_cut would have been unlocked when chop hit 50, so let's test a fresh engine for levelUp logic
const engineForLvlUp = new ProgressionEngine(mockConfig);
const lvlUpResult = engineForLvlUp.addXP("chop", 60);
assert(lvlUpResult.leveledUp, "Adding 60 XP to chop should unlock advanced_cut");
assert(lvlUpResult.newlyUnlockedSkills.some(s => s.id === "advanced_cut"), "advanced_cut should be in newlyUnlockedSkills");


// --- Unlocking Logic Tests ---
console.log("Testing Unlocking Logic...");

// Skill with no deps should be unlocked
assert(engine.isUnlocked("chop") === true, "Chop should be unlocked by default");

// advanced_cut should be unlocked now because chop has 100 XP (prerequisite 50)
assert(engine.isUnlocked("advanced_cut") === true, "advanced_cut should be unlocked");

// slice depends on chop. since chop is unlocked, slice should be unlocked
assert(engine.isUnlocked("slice") === true, "Slice should be unlocked");

// dice depends on slice. since slice is unlocked, dice should be unlocked
assert(engine.isUnlocked("dice") === true, "Dice should be unlocked");

// Test with locked prerequisite
const lockedEngine = new ProgressionEngine(mockConfig);
assert(lockedEngine.isUnlocked("advanced_cut") === false, "advanced_cut should be locked initially");


// --- Ancestors and Active Tier Tests ---
console.log("Testing Ancestors and Active Tier...");

// countUnlockedAncestors
assert(engine.countUnlockedAncestors("chop") === 0, "Chop has 0 ancestors");
assert(engine.countUnlockedAncestors("slice") === 1, "Slice has 1 unlocked ancestor (chop)");
assert(engine.countUnlockedAncestors("dice") === 2, "Dice has 2 unlocked ancestors (slice, chop)");

// getActiveTier
const activeTier = engine.getActiveTier("cutting");
assert(activeTier !== null, "Active tier for cutting should not be null");
// Dice has the most ancestors (2), so it should be the active tier
assert(activeTier?.id === "dice", "Dice should be the active tier for cutting");


// --- Tool Category and Action Mode Tests ---
console.log("Testing Helpers...");

// getToolCategory
assert(engine.getToolCategory("chop") === "cutting", "Chop category should be cutting");
assert(engine.getToolCategory("unknown") === null, "Unknown tool should return null category");

// isActionMode
assert(engine.isActionMode("action_chop") === true, "action_chop is an action mode");
assert(engine.isActionMode("chop") === false, "chop is not an action mode");

// getState
const state = engine.getState();
assert(state.xp["chop"] === 100, "State should reflect 100 XP for chop");


// --- Milestones Tests ---
console.log("Testing Milestones...");

// checkMilestoneUnlocks
const unlocked1 = engine.checkMilestoneUnlocks(3); // Less than 5
assert(unlocked1.length === 0, "No milestones should unlock with 3 recipes");

const unlocked2 = engine.checkMilestoneUnlocks(5); // Hits 5
assert(unlocked2.length === 1, "One milestone should unlock with 5 recipes");
assert(unlocked2[0].recipesCount === 5, "Unlocked milestone should be the first one");
assert(engine.getState().milestonesReached.includes(0), "Milestone index 0 should be reached");

const unlocked3 = engine.checkMilestoneUnlocks(12); // Hits 10
assert(unlocked3.length === 1, "Second milestone should unlock with 12 recipes");
assert(engine.getState().milestonesReached.includes(1), "Milestone index 1 should be reached");

// getUnlockedIngredients
const unlockedIngredients = engine.getUnlockedIngredients();
assert(unlockedIngredients.includes("salt"), "salt should be unlocked");
assert(unlockedIngredients.includes("pepper"), "pepper should be unlocked");
assert(unlockedIngredients.includes("sugar"), "sugar should be unlocked");


console.log("=== PROGRESSION ENGINE TESTS COMPLETED SUCCESSFULLY ===");