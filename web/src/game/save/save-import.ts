import { hydrateGameSession, refreshGameSessionUi } from "./save-repository";
import { SAVE_FILE_VERSION, SAVE_GAME_ID, showSaveToast } from "./save-io";
import {
  isValidSaveId,
  parseBoundedStringArray,
  parseBoundedXpMap,
  SAVE_MAX_DISCOVERED,
  SAVE_MAX_FILE_BYTES,
  SAVE_MAX_LOG_ENTRIES,
  SAVE_MAX_RECENT,
  SAVE_MAX_HIGHLIGHTS,
  SAVE_MAX_ACHIEVEMENTS,
  SAVE_MAX_FLAGS
} from "../security/save-validation";
import type {
  DiscoveryLogEntry,
  DiscoverySaveData,
  GameSaveFile,
  ProgressionState,
  AchievementsSaveData
} from "../../types";

export type ParseSaveResult =
  | { ok: true; save: GameSaveFile }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStringArray(value: unknown, maxItems: number): string[] | null {
  return parseBoundedStringArray(value, maxItems);
}

function parseDiscoveryLog(value: unknown): DiscoveryLogEntry[] {
  if (!Array.isArray(value)) return [];
  if (value.length > SAVE_MAX_LOG_ENTRIES) return [];

  const entries: DiscoveryLogEntry[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.id !== "string" || !isValidSaveId(entry.id)) continue;
    entries.push({
      id: entry.id,
      discoveredAt: typeof entry.discoveredAt === "number" && !Number.isNaN(entry.discoveredAt)
        ? entry.discoveredAt
        : 0
    });
  }
  return entries;
}

function parseDiscoverySaveData(value: unknown): DiscoverySaveData | null {
  if (!isRecord(value)) return null;

  const discovered = parseStringArray(value.discovered, SAVE_MAX_DISCOVERED);
  if (!discovered) return null;

  const recent = parseStringArray(value.recent, SAVE_MAX_RECENT);
  if (!recent) return null;

  const highlights = parseStringArray(value.highlights, SAVE_MAX_HIGHLIGHTS);
  if (!highlights) return null;

  return {
    discovered,
    recent,
    highlights,
    discoveryLog: parseDiscoveryLog(value.discoveryLog)
  };
}

function parseProgressionState(value: unknown): ProgressionState | null {
  if (!isRecord(value)) return null;

  const xp = parseBoundedXpMap(value.xp);
  if (!xp) return null;

  const milestonesReached = Array.isArray(value.milestonesReached)
    ? value.milestonesReached.filter(item => typeof item === "number" && Number.isInteger(item) && item >= 0)
    : [];

  return { xp, milestonesReached };
}

function parseAchievementsSaveData(value: unknown): AchievementsSaveData | null {
  if (value === undefined) {
    return { unlocked: [], flags: [] };
  }
  if (!isRecord(value)) return null;

  if (Array.isArray(value.unlocked) && value.unlocked.length > SAVE_MAX_ACHIEVEMENTS) {
    return null;
  }

  const unlocked = Array.isArray(value.unlocked)
    ? value.unlocked
        .filter(isRecord)
        .filter(entry =>
          typeof entry.id === "string"
          && isValidSaveId(entry.id)
          && typeof entry.unlockedAt === "number"
          && !Number.isNaN(entry.unlockedAt)
        )
        .map(entry => ({
          id: entry.id as string,
          unlockedAt: entry.unlockedAt as number
        }))
    : [];

  if (Array.isArray(value.flags) && value.flags.length > SAVE_MAX_FLAGS) {
    return null;
  }

  const flags = Array.isArray(value.flags)
    ? value.flags.filter((item): item is string => typeof item === "string" && isValidSaveId(item))
    : [];

  return { unlocked, flags };
}

/** Validate parsed JSON matches the portable save file schema. */
export function parseGameSaveFile(raw: unknown): ParseSaveResult {
  if (!isRecord(raw)) {
    return { ok: false, error: "Save file must be a JSON object." };
  }

  if (raw.version !== SAVE_FILE_VERSION) {
    return { ok: false, error: `Unsupported save version (expected ${SAVE_FILE_VERSION}).` };
  }

  if (raw.game !== SAVE_GAME_ID) {
    return { ok: false, error: "This file is not a Culinary Alchemy save." };
  }

  if (typeof raw.exportedAt !== "number" || Number.isNaN(raw.exportedAt)) {
    return { ok: false, error: "Save file is missing a valid export timestamp." };
  }

  const discovery = parseDiscoverySaveData(raw.discovery);
  if (!discovery) {
    return { ok: false, error: "Save file has invalid discovery data." };
  }

  const progression = parseProgressionState(raw.progression);
  if (!progression) {
    return { ok: false, error: "Save file has invalid progression data." };
  }

  const achievements = parseAchievementsSaveData(raw.achievements);
  if (!achievements) {
    return { ok: false, error: "Save file has invalid achievements data." };
  }

  const settings = isRecord(raw.settings)
    ? {
        soundEnabled: typeof raw.settings.soundEnabled === "boolean" ? raw.settings.soundEnabled : true,
        reducedMotion: typeof raw.settings.reducedMotion === "boolean" ? raw.settings.reducedMotion : false
      }
    : { soundEnabled: true, reducedMotion: false };

  return {
    ok: true,
    save: {
      version: SAVE_FILE_VERSION,
      game: SAVE_GAME_ID,
      exportedAt: raw.exportedAt,
      discovery,
      progression,
      achievements,
      settings
    }
  };
}

export function formatSaveImportSummary(save: GameSaveFile): string {
  const date = new Date(save.exportedAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? "unknown date"
    : date.toLocaleString();
  const count = save.discovery.discovered.length;
  return `${count} discoveries · exported ${dateLabel}`;
}

/** Replace in-memory and persisted game state from a validated save file. */
export function applyGameSave(save: GameSaveFile): void {
  hydrateGameSession(save);
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: true });
}

export async function readGameSaveFile(file: File): Promise<ParseSaveResult> {
  if (file.size > SAVE_MAX_FILE_BYTES) {
    return { ok: false, error: `Save file is too large (max ${Math.round(SAVE_MAX_FILE_BYTES / 1024)} KB).` };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "Could not read the selected file." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "Save file is not valid JSON." };
  }

  return parseGameSaveFile(parsed);
}

export async function importGameSaveFromFile(file: File): Promise<ParseSaveResult> {
  const parsed = await readGameSaveFile(file);
  if (!parsed.ok) return parsed;

  const summary = formatSaveImportSummary(parsed.save);
  const confirmed = confirm(
    `Import this save?\n\n${summary}\n\nThis replaces your current discoveries, skills, and journal on this device.`
  );
  if (!confirmed) {
    return { ok: false, error: "Import cancelled." };
  }

  try {
    applyGameSave(parsed.save);
    showSaveToast(`Save imported (${parsed.save.discovery.discovered.length} discoveries)`);
    return parsed;
  } catch (error) {
    console.error("Failed to apply imported save", error);
    return { ok: false, error: "Could not apply the save file." };
  }
}
