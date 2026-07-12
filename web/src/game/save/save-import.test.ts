import { parseGameSaveFile } from "./save-import";
import { SAVE_FILE_VERSION, SAVE_GAME_ID } from "./save-io";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const validSave = {
  version: SAVE_FILE_VERSION,
  game: SAVE_GAME_ID,
  exportedAt: 1_700_000_000_000,
  discovery: {
    discovered: ["water", "berries", "strawberry"],
    recent: ["strawberry"],
    highlights: ["berries"],
    discoveryLog: [{ id: "strawberry", discoveredAt: 1_700_000_000_000 }]
  },
  progression: {
    xp: { smash: 2, separate: 1 },
    milestonesReached: [0, 1]
  },
  settings: {
    soundEnabled: false,
    reducedMotion: true
  },
  achievements: {
    unlocked: [{ id: "first_separation", unlockedAt: 1_700_000_000_000 }],
    flags: ["combine_success"]
  }
};

const parsed = parseGameSaveFile(validSave);
assert(parsed.ok, "Valid save should parse");
if (parsed.ok) {
  assert(parsed.save.discovery.discovered.length === 3, "Discovery count preserved");
  assert(parsed.save.discovery.highlights.length === 1, "Highlights preserved");
  assert(parsed.save.progression.milestonesReached.length === 2, "Milestones preserved");
  assert(parsed.save.settings.soundEnabled === false, "Sound setting preserved");
  assert(parsed.save.settings.reducedMotion === true, "Reduced motion setting preserved");
  assert(parsed.save.achievements?.unlocked.length === 1, "Achievements preserved");
  assert(parsed.save.achievements?.flags.includes("combine_success"), "Achievement flags preserved");
}

const wrongGame = parseGameSaveFile({ ...validSave, game: "other-game" });
assert(!wrongGame.ok, "Wrong game id should fail");

const wrongVersion = parseGameSaveFile({ ...validSave, version: 999 });
assert(!wrongVersion.ok, "Wrong version should fail");

const badDiscovery = parseGameSaveFile({
  ...validSave,
  discovery: { discovered: "nope" }
});
assert(!badDiscovery.ok, "Invalid discovery should fail");

const badJsonShape = parseGameSaveFile(null);
assert(!badJsonShape.ok, "Non-object save should fail");

const stringSave = parseGameSaveFile("not json object");
assert(!stringSave.ok, "String should fail");

console.log("=== SAVE IMPORT TESTS PASSED ===");
