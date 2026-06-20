/** Top-level cooking methods and shared interaction thresholds. */

export const METHOD_ORDER = ["separate", "force", "combine", "change", "time"];

/** Methods that are their own canvas action — sub-skills are opt-in. All 5 are standalone main actions now. */
export const METHODS_WITH_OWN_ACTION = new Set(["separate", "force", "combine", "change", "time"]);

export const DRAG_THRESHOLD = 3;

export function getMaxSkillExp(data) {
  return data?.PROGRESSION_CONFIG?.maxSkillExp ?? 99;
}
