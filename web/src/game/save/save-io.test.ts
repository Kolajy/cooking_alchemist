import { formatExportDate, SAVE_FILE_VERSION, SAVE_GAME_ID } from "./save-io";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function testFormatExportDate() {
  const date1 = new Date(2023, 4, 5); // May is 4 (0-indexed)
  assert(formatExportDate(date1) === "2023-05-05", "Date should format to YYYY-MM-DD with padding");

  const date2 = new Date(2024, 11, 25); // December is 11
  assert(formatExportDate(date2) === "2024-12-25", "Date should format correctly for double digit months and days");

  const date3 = new Date(2025, 0, 1); // January is 0
  assert(formatExportDate(date3) === "2025-01-01", "Date should format correctly for Jan 1st");
}

function testConstants() {
  assert(SAVE_FILE_VERSION === 1, "SAVE_FILE_VERSION should be 1");
  assert(SAVE_GAME_ID === "culinary-alchemy", "SAVE_GAME_ID should be 'culinary-alchemy'");
}

testFormatExportDate();
testConstants();

console.log("=== SAVE-IO TESTS PASSED ===");
