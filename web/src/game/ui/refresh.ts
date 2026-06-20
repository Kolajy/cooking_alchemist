import { renderCabinet } from "../cabinet";
import { invalidateIngredientCatalog } from "../ingredients";
import { updateSkillsUI } from "./skills-panel";
import { renderCookingToolbar, updateBodyToolAttribute } from "../actions/toolbar";
import { updateStats } from "../persistence";

export interface GameplayRefreshOptions {
  skills?: boolean;
  toolbar?: boolean;
  cabinet?: boolean;
  stats?: boolean;
}

/** Coalesce UI updates after gameplay — avoids redundant full rebuilds per action. */
export function refreshAfterGameplay(options: GameplayRefreshOptions = {}): void {
  const {
    skills = true,
    toolbar = true,
    cabinet = false,
    stats = false
  } = options;

  if (stats) updateStats();
  if (skills) updateSkillsUI();
  if (toolbar) {
    renderCookingToolbar();
    updateBodyToolAttribute();
  }
  if (cabinet) {
    invalidateIngredientCatalog();
    renderCabinet();
  }
}
