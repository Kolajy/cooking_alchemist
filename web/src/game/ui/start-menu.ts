import { getCtx } from "../context";
import { getActiveSlot, setActiveSlot, getSlotInfo, deleteSlot, migrateLegacySave, getSlotKeys } from "../slots";
import { loadProgress, resetToStarters, updateStats } from "../persistence";
import { loadAchievements } from "../progression/achievements";
import { openDialog } from "./dialogs";
import { refreshGameSessionUi } from "../save-repository";
import { playSound } from "../feedback/sounds";

let menuMode: "new" | "load" = "load";

export function initStartMenu(): void {
  // Ensure legacy saves are migrated to Slot 1 if they exist
  migrateLegacySave();

  const overlay = document.getElementById("start-menu-overlay") as HTMLElement | null;
  const btnContinue = document.getElementById("menu-btn-continue") as HTMLButtonElement | null;
  const btnNewGame = document.getElementById("menu-btn-new-game") as HTMLButtonElement | null;
  const btnLoadGame = document.getElementById("menu-btn-load-game") as HTMLButtonElement | null;
  const btnSettings = document.getElementById("menu-btn-settings") as HTMLButtonElement | null;
  const btnBack = document.getElementById("menu-btn-back") as HTMLButtonElement | null;
  const viewMain = document.getElementById("start-menu-main") as HTMLElement | null;
  const viewSlots = document.getElementById("start-menu-slots") as HTMLElement | null;
  const btnSettingsToMenu = document.getElementById("settings-to-menu") as HTMLButtonElement | null;

  if (!overlay) return;

  // Find the most recently played slot to use for "Continue"
  const slots = ["slot1", "slot2", "slot3"];
  let mostRecentSlot: string | null = null;
  let maxTime = -1;
  let hasAnySave = false;

  slots.forEach(slotId => {
    const info = getSlotInfo(slotId);
    if (!info.isEmpty) {
      hasAnySave = true;
      if (info.lastSaved && info.lastSaved > maxTime) {
        maxTime = info.lastSaved;
        mostRecentSlot = slotId;
      }
    }
  });

  // Enable/disable Continue button
  if (btnContinue) {
    if (mostRecentSlot) {
      btnContinue.disabled = false;
      const recentInfo = getSlotInfo(mostRecentSlot);
      btnContinue.textContent = `Continue`;
      btnContinue.className = "btn btn-primary btn-lg";
      if (btnNewGame) btnNewGame.className = "btn btn-secondary btn-lg";
    } else {
      btnContinue.disabled = true;
      btnContinue.textContent = "Continue";
      btnContinue.className = "btn btn-secondary btn-lg";
      if (btnNewGame) btnNewGame.className = "btn btn-primary btn-lg";
    }
  }

  // Show/hide Load Game button
  if (btnLoadGame) {
    btnLoadGame.hidden = !hasAnySave;
  }

  // Bind Continue button
  btnContinue?.replaceWith(btnContinue.cloneNode(true));
  const newBtnContinue = document.getElementById("menu-btn-continue") as HTMLButtonElement | null;
  newBtnContinue?.addEventListener("click", () => {
    if (mostRecentSlot) {
      playSound("ui_click");
      setActiveSlot(mostRecentSlot);
      bootActiveSlot();
    }
  });

  // Bind New Game button
  btnNewGame?.replaceWith(btnNewGame.cloneNode(true));
  const newBtnNewGame = document.getElementById("menu-btn-new-game") as HTMLButtonElement | null;
  newBtnNewGame?.addEventListener("click", () => {
    playSound("ui_click");
    menuMode = "new";
    if (viewMain && viewSlots) {
      viewMain.hidden = true;
      viewSlots.hidden = false;
      renderSlotsGrid();
    }
  });

  // Bind Load Game button
  btnLoadGame?.replaceWith(btnLoadGame.cloneNode(true));
  const newBtnLoadGame = document.getElementById("menu-btn-load-game") as HTMLButtonElement | null;
  newBtnLoadGame?.addEventListener("click", () => {
    playSound("ui_click");
    menuMode = "load";
    if (viewMain && viewSlots) {
      viewMain.hidden = true;
      viewSlots.hidden = false;
      renderSlotsGrid();
    }
  });

  // Bind Back button
  btnBack?.replaceWith(btnBack.cloneNode(true));
  const newBtnBack = document.getElementById("menu-btn-back") as HTMLButtonElement | null;
  newBtnBack?.addEventListener("click", () => {
    playSound("ui_click");
    if (viewMain && viewSlots) {
      viewMain.hidden = false;
      viewSlots.hidden = true;
      // Refresh state
      initStartMenu();
    }
  });

  // Bind Settings button
  btnSettings?.replaceWith(btnSettings.cloneNode(true));
  const newBtnSettings = document.getElementById("menu-btn-settings") as HTMLButtonElement | null;
  newBtnSettings?.addEventListener("click", () => {
    playSound("ui_click");
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      openDialog(settingsModal);
    }
  });

  // Bind Return to Menu button from Settings dialog
  btnSettingsToMenu?.replaceWith(btnSettingsToMenu.cloneNode(true));
  const newBtnSettingsToMenu = document.getElementById("settings-to-menu") as HTMLButtonElement | null;
  newBtnSettingsToMenu?.addEventListener("click", () => {
    playSound("ui_click");
    // Close settings modal
    const settingsModal = document.getElementById("settings-modal") as any;
    if (settingsModal && typeof settingsModal.close === "function") {
      settingsModal.close();
    }
    
    // Show start menu
    overlay.removeAttribute("hidden");
    if (viewMain && viewSlots) {
      viewMain.hidden = false;
      viewSlots.hidden = true;
    }
    
    initStartMenu();
  });
}

function renderSlotsGrid(): void {
  const slots = ["slot1", "slot2", "slot3"];
  const viewTitle = document.querySelector(".start-menu__view-title") as HTMLElement | null;

  if (viewTitle) {
    viewTitle.textContent = menuMode === "new" ? "Start a New Game" : "Load Save Slot";
  }

  slots.forEach(slotId => {
    const card = document.querySelector(`.slot-card[data-slot="${slotId}"]`) as HTMLElement | null;
    if (!card) return;

    const info = getSlotInfo(slotId);
    const statusEl = card.querySelector(".slot-card__status") as HTMLElement | null;
    const playBtn = card.querySelector(".slot-btn-play") as HTMLButtonElement | null;
    const deleteBtn = card.querySelector(".slot-btn-delete") as HTMLButtonElement | null;

    if (info.isEmpty) {
      card.classList.remove("slot-card--active");
      if (statusEl) statusEl.textContent = "Empty Slot";
      if (playBtn) {
        playBtn.textContent = "Start New";
        playBtn.className = "btn btn-primary slot-btn-play";
      }
      if (deleteBtn) deleteBtn.hidden = true;
    } else {
      const activeSlot = getActiveSlot();
      if (slotId === activeSlot && menuMode === "load") {
        card.classList.add("slot-card--active");
      } else {
        card.classList.remove("slot-card--active");
      }

      if (statusEl) {
        const dateStr = info.lastSaved
          ? new Date(info.lastSaved).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Unknown";
        statusEl.innerHTML = `<strong>${info.percent}%</strong> Ledger • ${info.achievementsCount}🏆<br><span style="font-size: 0.75rem; opacity: 0.85;">Saved: ${dateStr}</span>`;
      }

      if (playBtn) {
        if (menuMode === "new") {
          playBtn.textContent = "Overwrite";
          playBtn.className = "btn btn-danger slot-btn-play";
        } else {
          playBtn.textContent = "Load Slot";
          playBtn.className = "btn btn-secondary slot-btn-play";
        }
      }
      if (deleteBtn) deleteBtn.hidden = false;
    }

    // Rebind action buttons
    playBtn?.replaceWith(playBtn.cloneNode(true));
    const newPlayBtn = card.querySelector(".slot-btn-play") as HTMLButtonElement | null;
    newPlayBtn?.addEventListener("click", () => {
      playSound("ui_click");
      setActiveSlot(slotId);
      if (menuMode === "new") {
        if (info.isEmpty || confirm(`Are you sure you want to overwrite Save Slot ${slotId.replace("slot", "")}? Your existing save will be lost forever.`)) {
          bootNewSlot();
        }
      } else {
        if (info.isEmpty) {
          bootNewSlot();
        } else {
          bootActiveSlot();
        }
      }
    });

    deleteBtn?.replaceWith(deleteBtn.cloneNode(true));
    const newDeleteBtn = card.querySelector(".slot-btn-delete") as HTMLButtonElement | null;
    newDeleteBtn?.addEventListener("click", () => {
      playSound("ui_click");
      if (confirm(`Are you sure you want to permanently delete Save Slot ${slotId.replace("slot", "")}? All progress will be lost.`)) {
        deleteSlot(slotId);
        renderSlotsGrid();
      }
    });
  });
}

function bootActiveSlot(): void {
  const overlay = document.getElementById("start-menu-overlay");
  if (overlay) {
    overlay.setAttribute("hidden", "true");
  }

  const { data } = getCtx();
  // Hydrate states
  data.Progression.load();
  loadProgress();
  loadAchievements();

  // Refresh GUI elements
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: false });
}

function bootNewSlot(): void {
  const overlay = document.getElementById("start-menu-overlay");
  if (overlay) {
    overlay.setAttribute("hidden", "true");
  }

  const { data } = getCtx();
  // Reset engine states
  data.Progression.reset();
  resetToStarters();
  localStorage.setItem(getSlotKeys(getActiveSlot()).achievements, JSON.stringify({ unlocked: [], flags: [] }));
  loadAchievements();

  // Refresh UI
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: true });
}
