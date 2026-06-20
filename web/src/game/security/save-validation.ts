/** Bounds and shape checks for portable save files (import / localStorage). */

export const SAVE_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const SAVE_MAX_DISCOVERED = 512;
export const SAVE_MAX_LOG_ENTRIES = 512;
export const SAVE_MAX_RECENT = 32;
export const SAVE_MAX_HIGHLIGHTS = 64;
export const SAVE_MAX_ACHIEVEMENTS = 64;
export const SAVE_MAX_FLAGS = 32;
export const SAVE_MAX_XP_TRACKS = 64;
export const SAVE_MAX_ID_LENGTH = 64;

/** Ingredient / achievement ids from game content (lowercase snake_case). */
const SAVE_ID_PATTERN = /^[a-z][a-z0-9_]*$/;

export function isValidSaveId(id: string): boolean {
  return typeof id === "string"
    && id.length > 0
    && id.length <= SAVE_MAX_ID_LENGTH
    && SAVE_ID_PATTERN.test(id);
}

export function parseBoundedStringArray(
  value: unknown,
  maxItems: number
): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !isValidSaveId(item)) return null;
    ids.push(item);
  }
  return ids;
}

export function parseBoundedXpMap(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  const entries = Object.keys(raw);
  if (entries.length > SAVE_MAX_XP_TRACKS) return null;

  const xp: Record<string, number> = {};
  for (const skillId of entries) {
    if (!Object.hasOwn(raw, skillId)) continue;
    if (skillId === "__proto__" || skillId === "constructor" || skillId === "prototype") {
      return null;
    }
    if (!SAVE_ID_PATTERN.test(skillId)) return null;
    const amount = raw[skillId];
    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0 || amount > 1_000_000) {
      return null;
    }
    xp[skillId] = Math.floor(amount);
  }

  return xp;
}
