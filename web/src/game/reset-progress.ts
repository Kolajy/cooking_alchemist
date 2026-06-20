import { getCtx } from "./context";
import { renderCabinet } from "./cabinet";
import { clearWorkspace } from "./canvas/workspace";
import { resetToStarters } from "./persistence";
import { resetAchievements } from "./progression/achievements";
import { setToolbarMode } from "./actions/toolbar";
import { updateSkillsUI } from "./ui/skills-panel";
import { updateStats } from "./persistence";

export function resetGameProgress(): boolean {
  if (!confirm("Are you sure you want to delete all unlocked recipes and progress? This cannot be undone!")) {
    return false;
  }

  const { state, data } = getCtx();

  resetToStarters();
  resetAchievements();
  data.Progression.reset();
  state.notifiedForceUnlock = false;
  state.notifiedCombineUnlock = false;
  state.notifiedChangeUnlock = false;
  state.notifiedTimeUnlock = false;
  updateStats();
  setToolbarMode("separate");
  updateSkillsUI();
  renderCabinet();
  clearWorkspace();
  alert("Game reset successfully!");
  return true;
}
