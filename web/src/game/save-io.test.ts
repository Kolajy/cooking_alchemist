import { formatExportDate } from "./save-io";

function assert(condition: boolean, message: string) { if (!condition) throw new Error(message); }

const d = new Date("2023-04-05T12:00:00Z");
assert(/^\d{4}-\d{2}-\d{2}$/.test(formatExportDate(d)), "format date should match YYYY-MM-DD pattern");

console.log("=== SAVE IO TESTS PASSED ===");
