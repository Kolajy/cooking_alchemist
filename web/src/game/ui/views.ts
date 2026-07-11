import { getCtx } from "../context";
import { resolvePlayableIngredient } from "../ingredients";
import { spawnElementOnCanvas } from "../canvas/workspace";
import { updateSkillsUI } from "./skills-panel";
import { renderDiscoveryJournal } from "./journal";
import { renderAchievementsPanel } from "./achievements";
import { playSound } from "../feedback/sounds";
import { setAchievementFlag } from "../progression/achievements";

export function switchMainView(viewName) {
  const { state, dom } = getCtx();
  if (state.activeMainView !== viewName) {
    playSound("ui_tab");
  }
  if (viewName === "map") {
    setAchievementFlag("map_opened");
  }
  state.activeMainView = viewName;
  const isMap = viewName === "map";

  if (dom.workspace) dom.workspace.hidden = isMap;
  if (dom.progressMapView) dom.progressMapView.hidden = !isMap;

  document.body.dataset.mainView = viewName;

  if (dom.btnProgressGraph) {
    dom.btnProgressGraph.classList.toggle("active", isMap);
    dom.btnProgressGraph.setAttribute("aria-pressed", isMap ? "true" : "false");
    dom.btnProgressGraph.textContent = isMap ? "🍳 Back to Kitchen" : "🌳 Progress Map";
  }

  if (dom.btnClearWorkspace) dom.btnClearWorkspace.hidden = isMap;

  if (isMap) {
    renderProgressGraph();
  }
}

export function switchSidebarTab(tabName) {
  const { state, dom } = getCtx();
  if (state.activeSidebarTab !== tabName) {
    playSound("ui_tab");
  }
  state.activeSidebarTab = tabName;

  dom.sidebarTabButtons.forEach(btn => {
    const isActive = btn.dataset.sidebarTab === tabName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  if (dom.cabinetPanel) {
    dom.cabinetPanel.classList.toggle("active", tabName === "cabinet");
    dom.cabinetPanel.hidden = tabName !== "cabinet";
  }

  if (dom.skillsPanel) {
    dom.skillsPanel.classList.toggle("active", tabName === "skills");
    dom.skillsPanel.hidden = tabName !== "skills";
    if (tabName === "skills") updateSkillsUI();
  }

  if (dom.journalPanel) {
    dom.journalPanel.classList.toggle("active", tabName === "journal");
    dom.journalPanel.hidden = tabName !== "journal";
    if (tabName === "journal") renderDiscoveryJournal();
  }

  if (dom.achievementsPanel) {
    dom.achievementsPanel.classList.toggle("active", tabName === "achievements");
    dom.achievementsPanel.hidden = tabName !== "achievements";
    if (tabName === "achievements") renderAchievementsPanel();
  }
}

export function placeIngredientFromGraph(itemId) {
  const { state } = getCtx();
  const item = resolvePlayableIngredient(itemId);
  if (!item) return;

  state.graphFocusIngredientId = itemId;
  switchMainView("cook");
  spawnElementOnCanvas(item);
  playSound("ui_place");
}

export function renderProgressGraph() {
  const { state, dom, data } = getCtx();
  const { ingredientGraphContainer } = dom;

  if (!ingredientGraphContainer) {
    console.error("Progress map container not found");
    return;
  }

  if (!window.IngredientGraph) {
    ingredientGraphContainer.textContent = "";
    const p = document.createElement("p");
    p.className = "progress-map-intro";
    p.textContent = "Progress map failed to load. Refresh the page.";
    ingredientGraphContainer.appendChild(p);
    return;
  }

  const draw = () => {
    try {
      window.IngredientGraph.render(ingredientGraphContainer, {
        discoveredIds: state.discoveredIds,
        milestoneIngredientIds: data.Progression.getUnlockedIngredients(),
        showLocked: true,
        focusIngredientId: state.graphFocusIngredientId,
        focusDepth: state.graphFocusDepth,
        searchTerm: state.graphSearchTerm,
        onFocusChange: (id) => { state.graphFocusIngredientId = id; },
        onDepthChange: (depth) => { state.graphFocusDepth = depth; },
        onSearchChange: (term) => { state.graphSearchTerm = term; },
        onIngredientActivate: placeIngredientFromGraph
      });
    } catch (error) {
      console.error("Failed to render progress map", error);
      ingredientGraphContainer.textContent = "";
      const p = document.createElement("p");
      p.className = "progress-map-intro";
      p.textContent = "Could not draw the progress map. Try refreshing.";
      ingredientGraphContainer.appendChild(p);
    }
  };

  requestAnimationFrame(() => requestAnimationFrame(draw));
}

export function refreshProgressGraphIfOpen() {
  const { state } = getCtx();
  if (state.activeMainView === "map") {
    renderProgressGraph();
  }
}
