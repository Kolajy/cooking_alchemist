import { sortDiscoveryLog } from "./persistence";
import { DiscoveryLogEntry } from "../../types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// 1. Sort by discoveredAt descending
const entries1: DiscoveryLogEntry[] = [
  { id: "a", discoveredAt: 100 },
  { id: "b", discoveredAt: 200 },
  { id: "c", discoveredAt: 50 }
];
const sorted1 = sortDiscoveryLog(entries1);
assert(sorted1[0].id === "b", "Highest timestamp should be first");
assert(sorted1[1].id === "a", "Middle timestamp should be second");
assert(sorted1[2].id === "c", "Lowest timestamp should be last");

// 2. Sort by id alphabetically when discoveredAt is identical
const entries2: DiscoveryLogEntry[] = [
  { id: "c", discoveredAt: 100 },
  { id: "a", discoveredAt: 100 },
  { id: "b", discoveredAt: 100 }
];
const sorted2 = sortDiscoveryLog(entries2);
assert(sorted2[0].id === "a", "Alphabetical sort applies when timestamp is tied (1)");
assert(sorted2[1].id === "b", "Alphabetical sort applies when timestamp is tied (2)");
assert(sorted2[2].id === "c", "Alphabetical sort applies when timestamp is tied (3)");

// 3. Combined sorting
const entries3: DiscoveryLogEntry[] = [
  { id: "d", discoveredAt: 100 },
  { id: "a", discoveredAt: 200 },
  { id: "c", discoveredAt: 100 },
  { id: "b", discoveredAt: 200 }
];
const sorted3 = sortDiscoveryLog(entries3);
assert(sorted3[0].id === "a", "Highest timestamp, alphabetical first");
assert(sorted3[1].id === "b", "Highest timestamp, alphabetical second");
assert(sorted3[2].id === "c", "Lowest timestamp, alphabetical first");
assert(sorted3[3].id === "d", "Lowest timestamp, alphabetical second");

// 4. Handling empty arrays
const entries4: DiscoveryLogEntry[] = [];
const sorted4 = sortDiscoveryLog(entries4);
assert(sorted4.length === 0, "Empty array should return empty array");

// 5. Verifying function is pure
const originalEntries: DiscoveryLogEntry[] = [
  { id: "b", discoveredAt: 100 },
  { id: "a", discoveredAt: 200 }
];
const originalEntriesCopy = [...originalEntries];
sortDiscoveryLog(originalEntries);
assert(originalEntries[0].id === originalEntriesCopy[0].id, "Original array id should not be mutated");
assert(originalEntries[0].discoveredAt === originalEntriesCopy[0].discoveredAt, "Original array timestamp should not be mutated");

console.log("=== DISCOVERY LOG SORTING TESTS PASSED ===");
