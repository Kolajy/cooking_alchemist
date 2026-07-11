import { getCtx } from "../context";
import { METHOD_ORDER, METHODS_WITH_OWN_ACTION } from "../constants";
import {
  isPlayerActionUnlocked,
  getUnlockedSkills,
  getSkillsInCategory
} from "../progression/skills";
import { getProcessedDiscoveryCount } from "../ingredients";
import { flashWorkspace } from "../feedback/workspace-effects";
import {
  playSound,
  playActionSelectSound,
  playTechniqueSound
} from "../feedback/sounds";
import { showWorkspaceHint } from "../progression/notifications";
import { escapeHtml } from "../security/html";
import { getToolbarFailureHint } from "../feedback/hints";
import { updateTechniqueTargetHighlights } from "../canvas/technique-target";
import { getActiveToolId, isTechniqueCategory } from "./mode";

export { getActiveToolId, isTechniqueCategory };

export function getActiveMethod() {
  const { state } = getCtx();
  if (METHODS_WITH_OWN_ACTION.has(state.activeAction)) {
    return state.activeAction;
  }
  return getMethodForAction(state.activeAction);
}

export function getMethodForAction(action) {
  const { data } = getCtx();
  if (action === "combine") return "combine";
  if (action === "separate") return "separate";
  if (action === "move") return null;
  return METHOD_ORDER.find(methodId => {
    const cfg = data.PLAYER_ACTIONS[methodId];
    return cfg && Array.isArray(cfg.categories) && cfg.categories.includes(action);
  }) || null;
}

function isMethodLocked(methodId) {
  const { data } = getCtx();
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!cfg?.unlockCriteria) return false;
  return !isPlayerActionUnlocked(methodId);
}

function getMethodLockHint(methodId) {
  const { data } = getCtx();
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!cfg?.unlockCriteria?.discoveredRecipes) {
    return "Locked — keep discovering to unlock this action.";
  }
  const needed = cfg.unlockCriteria.discoveredRecipes;
  const discovered = getProcessedDiscoveryCount();
  const remaining = Math.max(0, needed - discovered);
  if (remaining === 0) {
    return `Discover ${needed} finalized recipes to unlock ${cfg.name}.`;
  }
  return `${cfg.name} unlocks after ${remaining} more finalized recipe${remaining === 1 ? "" : "s"} (${discovered}/${needed}).`;
}

function methodHasPlayableContent(methodId) {
  const { data } = getCtx();
  const index = data.transitionIndex;
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!index || !cfg) return true;

  if (cfg.mode === "combine") {
    return index.combineTransitions.length > 0;
  }
  if (cfg.mode === "separate") {
    return index.getAffectableInputs("separate").length > 0;
  }

  const toolIds = new Set<string>();
  (cfg.categories || []).forEach(category => {
    getSkillsInCategory(category).forEach(skill => {
      (skill.actions || []).forEach(actionId => toolIds.add(actionId));
    });
  });

  if (cfg.starterSkill) {
    const starter = data.PROGRESSION_TIERS[cfg.starterSkill];
    (starter?.actions || []).forEach(actionId => toolIds.add(actionId));
  }

  return [...toolIds].some(toolId => index.getAffectableInputs(toolId).length > 0);
}

/** All switchable techniques for a method, including each category's default starter. */
export function getMethodSkillOptions(methodId) {
  const { data } = getCtx();
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!cfg) return [];

  const options = [];

  if (METHODS_WITH_OWN_ACTION.has(methodId)) {
    options.push({
      kind: "action",
      id: methodId,
      category: methodId,
      name: cfg.name,
      emoji: cfg.emoji
    });
  }

  (cfg.categories || []).forEach(category => {
    getUnlockedSkills(getSkillsInCategory(category)).forEach(skill => {
      options.push({
        kind: "skill",
        id: skill.id,
        category,
        name: skill.name,
        emoji: skill.emoji
      });
    });
  });

  return options;
}

function getDefaultSkillForMethod(methodId) {
  const { data } = getCtx();
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!cfg) return null;

  if (METHODS_WITH_OWN_ACTION.has(methodId)) {
    return { kind: "action", id: methodId, category: methodId };
  }

  if (cfg.starterSkill && data.Progression.isUnlocked(cfg.starterSkill)) {
    const skill = data.PROGRESSION_TIERS[cfg.starterSkill];
    return {
      kind: "skill",
      id: cfg.starterSkill,
      category: skill.category,
      name: skill.name,
      emoji: skill.emoji
    };
  }

  const firstSkill = getMethodSkillOptions(methodId)[0];
  return firstSkill || null;
}

function isSkillOptionActive(option) {
  const { state } = getCtx();
  if (option.kind === "action") {
    return state.activeAction === option.id && !state.activeSkillId;
  }
  return state.activeAction === option.category && state.activeSkillId === option.id;
}

function selectMethod(methodId, options = {}) {
  const { state } = getCtx();
  if (isMethodLocked(methodId)) return;

  if (getActiveMethod() === methodId) {
    if (METHODS_WITH_OWN_ACTION.has(methodId) && state.activeAction !== methodId) {
      setToolbarMode(methodId, null, options);
    }
    return;
  }

  if (METHODS_WITH_OWN_ACTION.has(methodId)) {
    setToolbarMode(methodId, null, options);
    return;
  }

  const defaultSkill = getDefaultSkillForMethod(methodId);
  if (!defaultSkill) return;

  if (defaultSkill.kind === "action") {
    setToolbarMode(defaultSkill.id, null, options);
  } else {
    setToolbarMode(defaultSkill.category, defaultSkill.id, options);
  }
}

function selectSkillOption(option, options: { skipRender?: boolean } = {}) {
  if (option.kind === "action") {
    setToolbarMode(option.id, null, options);
    return;
  }
  setToolbarMode(option.category, option.id, options);
}

export function setToolbarMode(mode, skillId = null, options: { skipRender?: boolean } = {}) {
  const { state, data } = getCtx();
  if (mode !== "move" && !METHODS_WITH_OWN_ACTION.has(mode)) {
    if (!isTechniqueCategory(mode)) return;
    const owningMethod = getMethodForAction(mode);
    if (owningMethod && isMethodLocked(owningMethod)) return;
  }

  state.activeAction = mode;

  if (mode === "move" || METHODS_WITH_OWN_ACTION.has(mode)) {
    state.activeSkillId = skillId;
  } else {
    const unlocked = getUnlockedSkills(getSkillsInCategory(mode));
    if (skillId && unlocked.some(skill => skill.id === skillId)) {
      state.activeSkillId = skillId;
    } else {
      state.activeSkillId = unlocked[0]?.id || null;
    }
  }

  if (!options.skipRender) {
    renderCookingToolbar();
  }
  updateBodyToolAttribute();
  updateTechniqueTargetHighlights();
}

export function renderCookingToolbar() {
  const { state, dom, data } = getCtx();
  const { cookingToolbar } = dom;
  if (!cookingToolbar) return;

  cookingToolbar.innerHTML = "";
  cookingToolbar.className = "cooking-toolbar";

  const appendBtn = ({
    label,
    emoji,
    isActive,
    onClick,
    extraClass = "",
    disabled = false,
    title = ""
  }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `toolbar-btn ${extraClass}`.trim();
    if (isActive) btn.classList.add("active");
    if (disabled) btn.disabled = true;
    if (title) btn.title = title;

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "tool-emoji";
    emojiSpan.textContent = emoji;

    const nameSpan = document.createElement("span");
    nameSpan.className = "tool-name";
    nameSpan.textContent = label;

    btn.append(emojiSpan, nameSpan);
    btn.addEventListener("click", onClick);
    return btn;
  };

  const activeMethod = getActiveMethod()
    || METHOD_ORDER.find(id => methodHasPlayableContent(id))
    || "separate";

  const methodsRow = document.createElement("div");
  methodsRow.className = "cooking-toolbar__row cooking-toolbar__row--methods";
  methodsRow.setAttribute("role", "group");
  methodsRow.setAttribute("aria-label", "Cooking methods");

  METHOD_ORDER.forEach(methodId => {
    const cfg = data.PLAYER_ACTIONS[methodId];
    if (!cfg) return;

    if (!isMethodLocked(methodId) && !methodHasPlayableContent(methodId)) {
      return;
    }

    if (isMethodLocked(methodId)) {
      const btn = appendBtn({
        label: cfg.name,
        emoji: cfg.emoji,
        isActive: false,
        title: getMethodLockHint(methodId),
        extraClass: "toolbar-btn--method toolbar-btn--locked toolbar-btn--veiled",
        onClick: (event) => {
          playSound("ui_locked");
          flashToolbarButton(event.currentTarget, "fail");
        }
      });
      methodsRow.appendChild(btn);
      return;
    }

    const btn = appendBtn({
      label: cfg.name,
      emoji: cfg.emoji,
      isActive: activeMethod === methodId,
      title: cfg.desc || cfg.name,
      extraClass: "toolbar-btn--method",
      onClick: () => {
        handleMethodClick(methodId);
      }
    });
    methodsRow.appendChild(btn);
  });

  cookingToolbar.appendChild(methodsRow);
}

export function updateBodyToolAttribute() {
  const { state } = getCtx();
  document.body.dataset.activeTool = getActiveToolId();
  document.body.dataset.activeAction = state.activeAction;
}

const TOOLBAR_FEEDBACK_CLASSES = [
  "toolbar-btn--pulse",
  "toolbar-btn--success",
  "toolbar-btn--fail"
];

export function flashToolbarButton(btn, outcome = "press") {
  if (!btn) return;

  btn.classList.remove(...TOOLBAR_FEEDBACK_CLASSES);
  void btn.offsetWidth;

  if (outcome === "success") {
    btn.classList.add("toolbar-btn--success");
  } else if (outcome === "fail") {
    btn.classList.add("toolbar-btn--fail");
  } else {
    btn.classList.add("toolbar-btn--pulse");
  }

  const className = outcome === "success"
    ? "toolbar-btn--success"
    : outcome === "fail"
      ? "toolbar-btn--fail"
      : "toolbar-btn--pulse";

  setTimeout(() => btn.classList.remove(className), 480);
}function handleMethodClick(methodId) {
  selectMethodById(methodId);
}

function handleSkillClick(btn, onSelect) {
  const { state, dom } = getCtx();
  onSelect({ skipRender: true });

  const hadElements = state.activeElements.length > 0;
  const didWork = hadElements ? getCtx().actions.applyActionToCanvas?.() : null;

  renderCookingToolbar();

  const activeBtn = dom.cookingToolbar?.querySelector(".toolbar-btn--skill.active");
  if (!activeBtn) return;

  flashToolbarButton(activeBtn, "press");
  flashWorkspace(dom.workspace, hadElements ? didWork : null);

  if (!hadElements) {
    playTechniqueSound(state.activeSkillId, state.activeAction);
    return;
  }

  if (didWork === false) {
    setTimeout(() => {
      const currentActive = dom.cookingToolbar?.querySelector(".toolbar-btn--skill.active");
      flashToolbarButton(currentActive, "fail");
      const hint = getToolbarFailureHint();
      if (hint) showWorkspaceHint(hint);
    }, 140);
  } else if (didWork) {
    setTimeout(() => {
      const currentActive = dom.cookingToolbar?.querySelector(".toolbar-btn--skill.active");
      flashToolbarButton(currentActive, "success");
    }, 140);
  }
}

/** Select a top-level cooking method (keyboard / API) and immediately apply it to counter items if present. */
export function selectMethodById(methodId: string) {
  const { state, dom } = getCtx();
  selectMethod(methodId);
  playActionSelectSound(methodId);

  const hadElements = state.activeElements.length > 0;
  const didWork = hadElements ? getCtx().actions.applyActionToCanvas?.() : null;

  renderCookingToolbar();

  const activeMethodBtn = dom.cookingToolbar?.querySelector(".toolbar-btn--method.active");
  if (activeMethodBtn) {
    flashToolbarButton(activeMethodBtn, hadElements ? (didWork ? "success" : "fail") : "press");
  }

  if (hadElements) {
    flashWorkspace(dom.workspace, didWork);
    if (didWork === false) {
      const hint = getToolbarFailureHint();
      if (hint) showWorkspaceHint(hint);
    }
  }
}

/** Cycle sub-techniques for the active method. Returns false if nothing to cycle. */
export function cycleActiveSkill(delta: 1 | -1): boolean {
  const activeMethod = getActiveMethod();
  if (!activeMethod || isMethodLocked(activeMethod)) return false;

  const options = getMethodSkillOptions(activeMethod);
  if (options.length === 0) return false;

  let index = options.findIndex(option => isSkillOptionActive(option));
  if (index < 0) index = 0;

  const nextIndex = (index + delta + options.length) % options.length;
  selectSkillOption(options[nextIndex]);
  const { state } = getCtx();
  playTechniqueSound(state.activeSkillId, state.activeAction);
  return true;
}

/** Apply the active technique to counter items. Returns null if counter is empty. */
export function applyActiveTechniqueToCounter(): boolean | null {
  const { state, dom, actions } = getCtx();
  if (state.activeElements.length === 0) return null;

  const didWork = Boolean(actions.applyActionToCanvas?.());
  flashWorkspace(dom.workspace, didWork);
  if (!didWork) {
    const hint = getToolbarFailureHint();
    if (hint) showWorkspaceHint(hint);
  }
  return didWork;
}
