import { getCtx } from "../context";
import { getSkillCategories } from "../progression/skills";

export function isTechniqueCategory(mode: string): boolean {
  return getSkillCategories().includes(mode);
}

export function getActiveToolId(): string {
  const { state } = getCtx();
  if (state.activeAction === "move") return "select";
  if (state.activeAction === "combine") return "combine";
  if (state.activeAction === "separate") return "separate";
  return state.activeSkillId || "select";
}
