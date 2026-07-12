import { getCtx } from "../context";
import { renderCabinet } from "../cabinet";
import { toggleCabinetStateFilter, toggleCabinetTypeFilter, syncCabinetFilterButtons } from "../ingredients";
import { gameStorage } from "../save/storage";
import { isPlayerActionUnlocked } from "../progression/skills";
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
import { addSearchHistory } from "../search-suggestions";

import { setupSettingsPanel } from "./settings";
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

  cabinetSearch?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value;
      if (val) addSearchHistory(val);
    }
  });

  cabinetSearch?.addEventListener("blur", (e) => {
    const val = (e.target as HTMLInputElement).value;
    if (val) addSearchHistory(val);
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

  if (!gameStorage.getItem("culinary_seen_help")) {
    gameStorage.setItem("culinary_seen_help", "true");
    openDialog(dom.helpModal);
  }
}
