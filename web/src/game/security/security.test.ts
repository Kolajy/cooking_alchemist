import { escapeHtml } from "./html";
import {
  SAVE_MAX_FILE_BYTES,
  parseBoundedStringArray,
  parseBoundedXpMap,
  isValidSaveId,
  SAVE_MAX_DISCOVERED,
  SAVE_MAX_ACHIEVEMENTS,
  SAVE_MAX_FLAGS
} from "./save-validation";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

assert(
  escapeHtml("<img onerror=alert(1)>") === "&lt;img onerror=alert(1)&gt;",
  "escapeHtml should encode angle brackets"
);
assert(escapeHtml(`"quoted"`) === "&quot;quoted&quot;", "escapeHtml should encode quotes");

assert(isValidSaveId("strawberry"), "valid id rejected");
assert(!isValidSaveId("<script>"), "invalid id accepted");
assert(!isValidSaveId("__proto__"), "prototype key accepted as id");

const ids = parseBoundedStringArray(["water", "berries"], SAVE_MAX_DISCOVERED);
assert(Boolean(ids && ids.length === 2), "bounded string array parse failed");
assert(parseBoundedStringArray(["bad id"], SAVE_MAX_DISCOVERED) === null, "invalid ids should be rejected");

const xp = parseBoundedXpMap({ smash: 3, combine: 1 });
assert(Boolean(xp && xp.smash === 3), "xp map parse failed");
assert(parseBoundedXpMap(JSON.parse('{"__proto__": 1}')) === null, "prototype pollution in xp map should be rejected");

assert(SAVE_MAX_FILE_BYTES >= 10_000, "SAVE_MAX_FILE_BYTES unreasonably small");

console.log("=== SECURITY TESTS PASSED ===");
