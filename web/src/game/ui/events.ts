import { getCtx } from "../context";
import { renderCabinet } from "../cabinet";
import { buildCabinetFilterButtons, toggleCabinetStateFilter, toggleCabinetTypeFilter, syncCabinetFilterButtons } from "../ingredients";
import { loadProgress, updateStats } from "../persistence";
import { isPlayerActionUnlocked } from "../progression/skills";
import { updateSkillsUI } from "./skills-panel";
import { setToolbarMode } from "../actions/toolbar";
import { openDialog, renderRecipeBook, setupDialogFallbacks } from "./dialogs";
import { setupDiscoveryDialog } from "./discovery";
import { switchMainView, switchSidebarTab } from "./views";
import { clearWorkspace } from "../canvas/workspace";
import {
  loadSoundPreference,
  loadAmbiencePreference,
  setSoundEnabled,
  isSoundEnabled,
  unlockAudioOnGesture,
  syncSoundUi,
  playSound
} from "../feedback/sounds";
import { applyUndo, refreshUndoButton } from "../feedback/undo";
import { setupKeyboardShortcuts } from "./keyboard-shortcuts";
import { loadSettings } from "../settings";
import { setupSettingsPanel } from "./settings";
import { loadAchievements, checkAchievements } from "../progression/achievements";
import { initStartMenu } from "./start-menu";

let cabinetSearchTimer: ReturnType<typeof setTimeout> | null = null;

export function setupEventListeners() {
  const { state, dom } = getCtx();
  const {
    sidebarTabButtons,
    ingredientStatesContainer,
    ingredientTypesContainer,
    cabinetSearch,
    btnClearWorkspace,
    btnUndoWorkspace,
    btnHelp,
    btnSound,
    btnRecipeBook,
    btnProgressGraph
  } = dom;

  sidebarTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchSidebarTab(btn.dataset.sidebarTab);
    });
  });

  ingredientStatesContainer?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest(".subtab-btn[data-state]") as HTMLElement | null;
    if (!btn) return;

    const mode = e.shiftKey ? "exclude" : "include";
    toggleCabinetStateFilter(btn.dataset.state, mode);
    syncCabinetFilterButtons();
    renderCabinet();
  });

  ingredientTypesContainer?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest(".subtab-btn[data-type]") as HTMLElement | null;
    if (!btn) return;

    const mode = e.shiftKey ? "exclude" : "include";
    toggleCabinetTypeFilter(btn.dataset.type, mode);
    syncCabinetFilterButtons();
    renderCabinet();
  });

  cabinetSearch?.addEventListener("input", (e) => {
    state.searchTerm = (e.target as HTMLInputElement).value;
    if (cabinetSearchTimer) clearTimeout(cabinetSearchTimer);
    cabinetSearchTimer = setTimeout(() => renderCabinet(), 150);
  });

  btnClearWorkspace?.addEventListener("click", () => {
    clearWorkspace();
  });

  btnUndoWorkspace?.addEventListener("click", () => {
    applyUndo();
  });

  btnSound?.addEventListener("click", () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    syncSoundUi(next);
    if (next) playSound("ui_click");
  });

  btnHelp?.addEventListener("click", () => openDialog(dom.helpModal));

  btnRecipeBook?.addEventListener("click", () => {
    renderRecipeBook();
    openDialog(dom.recipeBookModal);
  });

  btnProgressGraph?.addEventListener("click", () => {
    switchMainView(state.activeMainView === "map" ? "cook" : "map");
  });

  setupKeyboardShortcuts();
  setupSettingsPanel();
}

export function initGame() {
  const ctx = getCtx();
  const { state, dom } = ctx;

  loadSoundPreference();
  loadAmbiencePreference();
  loadSettings();
  syncSoundUi();
  unlockAudioOnGesture();
  refreshUndoButton();

  setupEventListeners();
  setupDiscoveryDialog();
  setupDialogFallbacks();
  document.body.dataset.mainView = state.activeMainView;

  // Initialize and display the start menu overlay
  initStartMenu();

  if (!localStorage.getItem("culinary_seen_help")) {
    localStorage.setItem("culinary_seen_help", "true");
    openDialog(dom.helpModal);
  }
}
