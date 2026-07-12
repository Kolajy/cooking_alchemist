import { getCtx } from "./context";
import { showCustomConfirm, showCustomAlert } from "./ui/dialogs";
import { renderCabinet } from "./cabinet";
import { clearWorkspace } from "./canvas/workspace";
import { resetToStarters, updateStats } from "./save/persistence";
import { resetAchievements } from "./progression/achievements";
import { setToolbarMode } from "./actions/toolbar";
import { updateSkillsUI } from "./ui/skills-panel";


export async function resetGameProgress(): Promise<boolean> {
  const confirmed = await showCustomConfirm(
    "Reset Progress",
    "Are you sure you want to delete all unlocked recipes and progress? This cannot be undone!",
    true
  );
  if (!confirmed) {
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
  await showCustomAlert("Reset Complete", "Game reset successfully!");
  return true;
}

