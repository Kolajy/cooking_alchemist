import { getCtx } from "./context";
import { invalidateIngredientCatalog } from "./ingredients";
import { emitGameplayEvent } from "./events";
import { isValidSaveId, SAVE_MAX_DISCOVERED, SAVE_MAX_LOG_ENTRIES } from "./security/save-validation";
import type { DiscoveryLogEntry, DiscoverySaveData } from "../types";
import { getActiveSlot, getSlotKeys } from "./slots";

export const MAX_RECENT_DISCOVERIES = 5;

function sanitizeStoredIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === "string" && isValidSaveId(id))
    .slice(0, SAVE_MAX_DISCOVERED);
}

function isLoggableDiscoveryId(id: string): boolean {
  const { data } = getCtx();
  if (!id || data.PRIMITIVE_INGREDIENT_IDS.has(id)) return false;
  return Boolean(data.DISCOVERABLE_ITEMS[id]);
}

function sortDiscoveryLog(entries: DiscoveryLogEntry[]): DiscoveryLogEntry[] {
  return [...entries].sort((a, b) => {
    if (a.discoveredAt !== b.discoveredAt) {
      return b.discoveredAt - a.discoveredAt;
    }
    return a.id.localeCompare(b.id);
  });
}

function sanitizeDiscoveryLog(): void {
  const { state } = getCtx();
  const seen = new Set<string>();
  const next: DiscoveryLogEntry[] = [];

  for (const entry of state.discoveryLog) {
    if (!entry?.id || seen.has(entry.id)) continue;
    if (!isLoggableDiscoveryId(entry.id)) continue;
    if (!state.discoveredIds.has(entry.id)) continue;

    seen.add(entry.id);
    next.push({
      id: entry.id,
      discoveredAt: typeof entry.discoveredAt === "number" ? entry.discoveredAt : 0
    });
  }

  state.discoveryLog = sortDiscoveryLog(next);
}

function migrateDiscoveryLog(): void {
  const { state } = getCtx();
  const logged = new Set<string>();
  for (let i = 0; i < state.discoveryLog.length; i++) {
    logged.add(state.discoveryLog[i].id);
  }
  let changed = false;

  for (const id of state.discoveredIds) {
    if (logged.has(id) || !isLoggableDiscoveryId(id)) continue;
    state.discoveryLog.push({ id, discoveredAt: 0 });
    logged.add(id);
    changed = true;
  }

  if (changed) {
    state.discoveryLog = sortDiscoveryLog(state.discoveryLog);
  }
}

export function recordDiscoveryTimestamps(ids: string[]): void {
  const { state } = getCtx();
  if (!ids.length) return;

  const logged = new Set<string>();
  for (let i = 0; i < state.discoveryLog.length; i++) {
    logged.add(state.discoveryLog[i].id);
  }
  const now = Date.now();
  let changed = false;

  ids.forEach(id => {
    if (!id || !state.discoveredIds.has(id)) return;
    if (logged.has(id) || !isLoggableDiscoveryId(id)) return;

    state.discoveryLog.push({ id, discoveredAt: now });
    logged.add(id);
    changed = true;
  });

  if (changed) {
    state.discoveryLog = sortDiscoveryLog(state.discoveryLog);
    emitGameplayEvent("discoveryChanged", { ids });
  }
}

export function sanitizeDiscoveredIds() {
  const { state, data } = getCtx();
  const valid = new Set([
    ...data.PRIMITIVE_INGREDIENT_IDS,
    ...Object.keys(data.DISCOVERABLE_ITEMS)
  ]);
  let changed = false;
  for (const id of state.discoveredIds) {
    if (!valid.has(id)) {
      state.discoveredIds.delete(id);
      changed = true;
    }
  }
  if (changed) saveProgress();
  sanitizeRecentDiscoveries();
  sanitizeDiscoveryLog();
}

function sanitizeRecentDiscoveries() {
  const { state } = getCtx();
  const next = state.recentlyDiscoveredIds.filter(id => state.discoveredIds.has(id));
  if (next.length !== state.recentlyDiscoveredIds.length) {
    state.recentlyDiscoveredIds = next;
  }
}

export function recordRecentDiscoveries(ids: string[]) {
  const { state } = getCtx();
  const incoming = ids.filter(id => id && state.discoveredIds.has(id));
  if (incoming.length === 0) return;

  const next = [
    ...incoming,
    ...state.recentlyDiscoveredIds.filter(id => !incoming.includes(id))
  ];
  state.recentlyDiscoveredIds = next.slice(0, MAX_RECENT_DISCOVERIES);
  incoming.forEach(id => state.recentHighlightIds.add(id));
  recordDiscoveryTimestamps(incoming);
}

export function loadProgress() {
  const { state } = getCtx();
  try {
    const keys = getSlotKeys(getActiveSlot());
    const saved = localStorage.getItem(keys.discovered);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.discoveredIds = new Set(sanitizeStoredIds(parsed));
        state.recentlyDiscoveredIds = [];
        state.discoveryLog = [];
      } else if (parsed && Array.isArray(parsed.discovered)) {
        state.discoveredIds = new Set(sanitizeStoredIds(parsed.discovered));
        state.recentlyDiscoveredIds = sanitizeStoredIds(parsed.recent).slice(0, MAX_RECENT_DISCOVERIES);
        state.discoveryLog = Array.isArray(parsed.discoveryLog)
          ? parsed.discoveryLog
              .filter((entry: DiscoveryLogEntry) => entry && typeof entry.id === "string" && isValidSaveId(entry.id))
              .slice(0, SAVE_MAX_LOG_ENTRIES)
              .map((entry: DiscoveryLogEntry) => ({
                id: entry.id,
                discoveredAt: typeof entry.discoveredAt === "number" ? entry.discoveredAt : 0
              }))
          : [];
        if (Array.isArray(parsed.highlights)) {
          parsed.highlights
            .filter((id: unknown) => typeof id === "string" && isValidSaveId(id))
            .forEach((id: string) => state.recentHighlightIds.add(id));
        }
      } else {
        resetToStarters();
        return;
      }
      sanitizeDiscoveredIds();
      migrateDiscoveryLog();
      ensureStarterIngredientsDiscovered();
      invalidateIngredientCatalog();
    } else {
      resetToStarters();
    }
  } catch (e) {
    console.error("Failed to load progress from localStorage", e);
    resetToStarters();
  }
}

export function ensureStarterIngredientsDiscovered() {
  const { state, data } = getCtx();
  let changed = false;
  data.STARTER_ELEMENTS.forEach(el => {
    if (!state.discoveredIds.has(el.id)) {
      state.discoveredIds.add(el.id);
      changed = true;
    }
  });
  if (changed) saveProgress();
}

export function resetToStarters() {
  const { state, data } = getCtx();
  state.discoveredIds = new Set(data.STARTER_ELEMENTS.map(el => el.id));
  state.recentlyDiscoveredIds = [];
  state.discoveryLog = [];
  invalidateIngredientCatalog();
  saveProgress();
}

export function getDiscoverySaveData(): DiscoverySaveData {
  const { state } = getCtx();
  return {
    discovered: Array.from(state.discoveredIds),
    recent: state.recentlyDiscoveredIds,
    highlights: Array.from(state.recentHighlightIds),
    discoveryLog: state.discoveryLog,
    lastSaved: Date.now()
  };
}

export function applyDiscoverySaveData(data: DiscoverySaveData): void {
  const { state } = getCtx();

  state.discoveredIds = new Set(data.discovered);
  state.recentlyDiscoveredIds = Array.isArray(data.recent)
    ? data.recent.slice(0, MAX_RECENT_DISCOVERIES)
    : [];
  state.recentHighlightIds = new Set(Array.isArray(data.highlights) ? data.highlights : []);
  state.discoveryLog = Array.isArray(data.discoveryLog)
    ? data.discoveryLog
        .filter(entry => entry && typeof entry.id === "string")
        .map(entry => ({
          id: entry.id,
          discoveredAt: typeof entry.discoveredAt === "number" ? entry.discoveredAt : 0
        }))
    : [];

  sanitizeDiscoveredIds();
  migrateDiscoveryLog();
  ensureStarterIngredientsDiscovered();
  invalidateIngredientCatalog();
  saveProgress();
  emitGameplayEvent("discoveryChanged", {});
}

export function saveProgress() {
  const { state } = getCtx();
  try {
    const keys = getSlotKeys(getActiveSlot());
    localStorage.setItem(keys.discovered, JSON.stringify(getDiscoverySaveData()));
    emitGameplayEvent("discoveryChanged", {});
  } catch (e) {
    console.error("Failed to save progress to localStorage", e);
  }
}

export function updateStats() {
  const { state, dom, data } = getCtx();
  const discoverableTotal = Object.keys(data.DISCOVERABLE_ITEMS).length;
  let discoveredCount = 0;
  for (const id of state.discoveredIds) {
    if (data.DISCOVERABLE_ITEMS[id]) discoveredCount++;
  }

  if (dom.unlockedCountEl) {
    const percent = discoverableTotal > 0 ? Math.round((discoveredCount / discoverableTotal) * 100) : 0;
    dom.unlockedCountEl.textContent = `${percent}%`;
  }

  const guideTextEl = document.getElementById("grandma-guide-text");
  if (guideTextEl) {
    let hint = "";
    const hasSmashedBerries = state.discoveredIds.has("smashed_berries");
    const hasPotato = state.discoveredIds.has("potato");
    const hasMashedPotato = state.discoveredIds.has("mashed_potato");
    const hasSproutedSeeds = state.discoveredIds.has("sprouted_seeds");

    if (!hasSmashedBerries) {
      hint = "Separate 🫐 <strong>Berries</strong> on the counter to find fresh fruit and smashable pulp!";
    } else if (!hasPotato) {
      hint = "Separate 🥔 <strong>Tubers</strong> on the counter to find a fresh Potato!";
    } else if (!hasMashedPotato) {
      hint = "Use your new ✊ <strong>Force</strong> action to smash the 🥔 <strong>Potato</strong> into a fluffy mash!";
    } else if (discoveredCount < 15) {
      hint = `Keep exploring and separating! Restore <strong>15 recipes</strong> in your Ledger to unlock the 🥣 <strong>Combine</strong> action (Current: <strong>${discoveredCount}</strong>/15).`;
    } else if (!hasSproutedSeeds) {
      hint = "Combine 🌻 <strong>Seeds</strong> and 💧 <strong>Water</strong> on the counter using the 🥣 <strong>Combine</strong> action to grow sprouted greens!";
    } else if (discoveredCount < 40) {
      hint = `Excellent! Continue combining and discovering dishes. Reach <strong>40 recipes</strong> to unlock 🍳 <strong>Heat</strong> (Current: <strong>${discoveredCount}</strong>/40).`;
    } else if (discoveredCount < 200 || !state.discoveredIds.has("berry_pulp")) {
      hint = `You're a true alchemist. Work towards restoring <strong>200 recipes</strong> and finding <strong>Berry Pulp</strong> to master ⏳ <strong>Time</strong> (Current: <strong>${discoveredCount}</strong>/200).`;
    } else {
      hint = "Grandmother's ledger is nearly restored! Search for remaining rare secrets in the Progress Map.";
    }

    guideTextEl.innerHTML = hint;
  }
}
