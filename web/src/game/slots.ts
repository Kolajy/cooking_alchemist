import { getCtx } from "./context";
import { isValidSaveId } from "./security/save-validation";

export type SlotInfo = {
  id: string;
  name: string;
  isEmpty: boolean;
  percent: number;
  lastSaved: number | null;
  achievementsCount: number;
};

const LEGACY_DISCOVERED_KEY = "culinary_discovered";
const LEGACY_PROGRESSION_KEY = "culinary_progression";
const LEGACY_ACHIEVEMENTS_KEY = "culinary_achievements";

export function getActiveSlot(): string {
  try {
    return localStorage.getItem("culinary_active_slot") || "slot1";
  } catch {
    return "slot1";
  }
}

export function setActiveSlot(slotId: string): void {
  try {
    localStorage.setItem("culinary_active_slot", slotId);
  } catch (e) {
    console.error("Failed to set active slot", e);
  }
}

export function getSlotKeys(slotId: string) {
  return {
    discovered: `culinary_${slotId}_discovered`,
    progression: `culinary_${slotId}_progression`,
    achievements: `culinary_${slotId}_achievements`
  };
}

export function migrateLegacySave(): void {
  try {
    const legacyDiscovered = localStorage.getItem(LEGACY_DISCOVERED_KEY);
    const slot1Keys = getSlotKeys("slot1");
    const slot1Exists = localStorage.getItem(slot1Keys.discovered);

    if (legacyDiscovered && !slot1Exists) {
      console.log("[Culinary Alchemy] Migrating legacy save to Slot 1");
      // Copy to Slot 1
      localStorage.setItem(slot1Keys.discovered, legacyDiscovered);
      
      const legacyProg = localStorage.getItem(LEGACY_PROGRESSION_KEY);
      if (legacyProg) localStorage.setItem(slot1Keys.progression, legacyProg);

      const legacyAch = localStorage.getItem(LEGACY_ACHIEVEMENTS_KEY);
      if (legacyAch) localStorage.setItem(slot1Keys.achievements, legacyAch);
    }
  } catch (e) {
    console.error("Failed to migrate legacy save", e);
  }
}

export function getSlotInfo(slotId: string): SlotInfo {
  const keys = getSlotKeys(slotId);
  const info: SlotInfo = {
    id: slotId,
    name: slotId === "slot1" ? "Save Slot 1" : slotId === "slot2" ? "Save Slot 2" : "Save Slot 3",
    isEmpty: true,
    percent: 0,
    lastSaved: null,
    achievementsCount: 0
  };

  try {
    const discoveredRaw = localStorage.getItem(keys.discovered);
    if (discoveredRaw) {
      const parsed = JSON.parse(discoveredRaw);
      const discoveredArr: string[] = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.discovered)
        ? parsed.discovered
        : [];

      if (discoveredArr.length > 0) {
        info.isEmpty = false;
        
        // Calculate ledger completion percentage
        const discoverableMap = (globalThis as any).DISCOVERABLE_ITEMS || {};
        const discoverableTotal = Object.keys(discoverableMap).length;
        const discoveredRecipesCount = discoveredArr.filter(id => discoverableMap[id]).length;
        info.percent = discoverableTotal > 0 ? Math.round((discoveredRecipesCount / discoverableTotal) * 100) : 0;

        // Try getting last saved timestamp (we will add this when saving)
        info.lastSaved = typeof parsed.lastSaved === "number" ? parsed.lastSaved : null;
      }
    }

    const achievementsRaw = localStorage.getItem(keys.achievements);
    if (achievementsRaw) {
      const parsed = JSON.parse(achievementsRaw);
      if (parsed && Array.isArray(parsed.unlocked)) {
        info.achievementsCount = parsed.unlocked.length;
      }
    }
  } catch (e) {
    console.error(`Error reading slot info for ${slotId}`, e);
  }

  return info;
}

export function deleteSlot(slotId: string): void {
  const keys = getSlotKeys(slotId);
  try {
    localStorage.removeItem(keys.discovered);
    localStorage.removeItem(keys.progression);
    localStorage.removeItem(keys.achievements);
    console.log(`[Culinary Alchemy] Deleted ${slotId}`);
  } catch (e) {
    console.error(`Failed to delete slot ${slotId}`, e);
  }
}
