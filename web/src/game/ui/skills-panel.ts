import { getCtx } from "../context";
import { METHOD_ORDER, getMaxSkillExp } from "../constants";
import {
  getSkillsForMethod,
  getUnlockedSkillsForMethod,
  isPlayerActionUnlocked
} from "../progression/skills";

function getTrackLabel(trackId: string): string {
  const { data } = getCtx();
  const tier = data.PROGRESSION_TIERS[trackId];
  if (tier) return `${tier.emoji} ${tier.name}`;

  const actionByMode = Object.values(data.PLAYER_ACTIONS).find(action => action.mode === trackId);
  if (actionByMode) return `${actionByMode.emoji} ${actionByMode.name}`;

  const directAction = data.PLAYER_ACTIONS[trackId];
  if (directAction) return `${directAction.emoji} ${directAction.name}`;

  return trackId;
}

function getCappedExp(trackId: string): number {
  const { data } = getCtx();
  const maxExp = getMaxSkillExp(data);
  return Math.min(data.Progression.getXP(trackId), maxExp);
}

function getMaxExpBarPercent(trackId: string): number {
  const { data } = getCtx();
  const maxExp = getMaxSkillExp(data);
  return Math.min(100, Math.max(0, (getCappedExp(trackId) / maxExp) * 100));
}

function getNextSkillInChain(skillId: string) {
  const { data } = getCtx();
  for (const id in data.PROGRESSION_TIERS) {
    const tier = data.PROGRESSION_TIERS[id];
    if (tier.dependsOn && tier.dependsOn.includes(skillId)) {
      return { id, ...tier };
    }
  }
  return undefined;
}

function getNextLockedSkillForTrack(trackId: string, methodId: string) {
  const { data } = getCtx();
  return getSkillsForMethod(methodId).find(skill => {
    if (data.Progression.isUnlocked(skill.id)) return false;
    const prereqs = skill.unlockCriteria?.prerequisites;
    return prereqs && Object.prototype.hasOwnProperty.call(prereqs, trackId);
  });
}

function getSkillProgressText(skillId: string): string {
  const { data } = getCtx();
  const maxExp = getMaxSkillExp(data);
  const skill = data.PROGRESSION_TIERS[skillId];

  if (!data.Progression.isUnlocked(skillId)) {
    if (skill?.unlockCriteria?.prerequisites) {
      const parts = Object.entries(skill.unlockCriteria.prerequisites).map(([parentId, needed]) => {
        const label = getTrackLabel(parentId);
        return `${label}: ${data.Progression.getXP(parentId)}/${needed} exp`;
      });
      return `Requires ${parts.join(", ")}`;
    }
    return "Locked";
  }

  const exp = getCappedExp(skillId);
  let text = `${exp} / ${maxExp} exp`;
  const nextSkill = getNextSkillInChain(skillId);

  if (nextSkill?.unlockCriteria?.prerequisites?.[skillId]) {
    const required = nextSkill.unlockCriteria.prerequisites[skillId];
    if (exp < required) {
      text += ` · ${nextSkill.emoji} ${nextSkill.name} at ${required}`;
    }
  }

  return text;
}

function getSkillProgressPercent(skillId: string): number {
  const { data } = getCtx();
  if (!data.Progression.isUnlocked(skillId)) return 0;
  return getMaxExpBarPercent(skillId);
}

function appendExpBar(card: HTMLElement, percent: number): void {
  const barContainer = document.createElement("div");
  barContainer.className = "xp-bar-container";
  const barFill = document.createElement("div");
  barFill.className = "xp-bar-fill";
  barFill.style.width = `${percent}%`;
  barContainer.appendChild(barFill);
  card.appendChild(barContainer);
}

function createModeExpCard(methodId: string, cfg: { mode: string; emoji: string; name: string; desc?: string }) {
  const { data } = getCtx();
  const trackId = cfg.mode;
  const maxExp = getMaxSkillExp(data);
  const nextLocked = getNextLockedSkillForTrack(trackId, methodId);
  const needed = nextLocked?.unlockCriteria?.prerequisites?.[trackId];

  const card = document.createElement("article");
  card.className = "skill-card skill-action unlocked skill-card--mode";
  card.dataset.skillId = trackId;

  const header = document.createElement("div");
  header.className = "skill-card-header";

  const name = document.createElement("span");
  name.className = "skill-card-name";
  name.textContent = `${cfg.emoji} ${cfg.name} Practice`;

  const status = document.createElement("span");
  status.className = "skill-card-status";
  status.textContent = "Training";

  header.append(name, status);
  card.appendChild(header);

  if (cfg.desc) {
    const desc = document.createElement("p");
    desc.className = "skill-card-desc";
    desc.textContent = cfg.desc;
    card.appendChild(desc);
  }

  appendExpBar(card, getMaxExpBarPercent(trackId));

  const progressText = document.createElement("span");
  progressText.className = "xp-text";
  let label = `${getCappedExp(trackId)} / ${maxExp} exp`;
  if (nextLocked && needed !== undefined) {
    label += ` · ${nextLocked.emoji} ${nextLocked.name} at ${needed}`;
  }
  progressText.textContent = label;
  card.appendChild(progressText);

  return card;
}

function createLockedSkillCard(skill: { id: string; emoji: string; name: string; unlockCriteria?: { prerequisites?: Record<string, number> } }) {
  const { data } = getCtx();
  const prereqs = skill.unlockCriteria?.prerequisites || {};
  const [parentId, neededRaw] = Object.entries(prereqs)[0] || [];
  const needed = typeof neededRaw === "number" ? neededRaw : 0;
  const parentExp = parentId ? data.Progression.getXP(parentId) : 0;
  const percent = needed
    ? Math.min(100, Math.max(0, (parentExp / needed) * 100))
    : 0;

  const card = document.createElement("article");
  card.className = "skill-card skill-action locked";
  card.dataset.skillId = skill.id;

  const header = document.createElement("div");
  header.className = "skill-card-header";

  const name = document.createElement("span");
  name.className = "skill-card-name";
  name.textContent = `${skill.emoji} ${skill.name}`;

  const status = document.createElement("span");
  status.className = "skill-card-status";
  status.textContent = "Locked";

  header.append(name, status);
  card.appendChild(header);

  appendExpBar(card, percent);

  const progressText = document.createElement("span");
  progressText.className = "xp-text xp-text--locked";
  if (parentId && needed !== undefined) {
    progressText.textContent = `Requires ${getTrackLabel(parentId)}: ${parentExp}/${needed} exp`;
  } else {
    progressText.textContent = "Locked";
  }
  card.appendChild(progressText);

  return card;
}

function createSkillActionCard(skill: { id: string; emoji: string; name: string; desc?: string; category: string }) {
  const { data } = getCtx();
  const activeTier = data.Progression.getActiveTier(skill.category);
  const isActive = activeTier && activeTier.id === skill.id;

  const card = document.createElement("article");
  card.className = "skill-card skill-action unlocked";
  card.dataset.skillId = skill.id;
  if (isActive) card.classList.add("active-tier");

  const header = document.createElement("div");
  header.className = "skill-card-header";

  const name = document.createElement("span");
  name.className = "skill-card-name";
  name.textContent = `${skill.emoji} ${skill.name}`;

  const status = document.createElement("span");
  status.className = "skill-card-status";
  status.textContent = isActive ? "Active" : "Unlocked";

  header.append(name, status);
  card.appendChild(header);

  if (skill.desc) {
    const desc = document.createElement("p");
    desc.className = "skill-card-desc";
    desc.textContent = skill.desc;
    card.appendChild(desc);
  }

  appendExpBar(card, getSkillProgressPercent(skill.id));

  const progressText = document.createElement("span");
  progressText.className = "xp-text";
  progressText.textContent = getSkillProgressText(skill.id);
  card.appendChild(progressText);

  return card;
}

export function updateSkillsUI(): void {
  const { dom, data } = getCtx();
  const { skillsList } = dom;
  if (!skillsList) return;

  skillsList.innerHTML = "";

  METHOD_ORDER.forEach(methodId => {
    const cfg = data.PLAYER_ACTIONS[methodId];
    if (!cfg || !isPlayerActionUnlocked(methodId)) return;

    const actionsList = document.createElement("div");
    actionsList.className = "skill-actions-list";
    const shownSkillIds = new Set<string>();

    if (cfg.mode) {
      actionsList.appendChild(createModeExpCard(methodId, cfg));
      shownSkillIds.add(cfg.mode);
    }

    if (cfg.starterSkill && data.PROGRESSION_TIERS[cfg.starterSkill]) {
      const starter = { id: cfg.starterSkill, ...data.PROGRESSION_TIERS[cfg.starterSkill] };
      if (data.Progression.isUnlocked(cfg.starterSkill)) {
        actionsList.appendChild(createSkillActionCard(starter));
        shownSkillIds.add(cfg.starterSkill);
      }
    }

    getUnlockedSkillsForMethod(methodId).forEach(skill => {
      if (shownSkillIds.has(skill.id)) return;
      actionsList.appendChild(createSkillActionCard(skill));
      shownSkillIds.add(skill.id);
    });

    const nextLocked = getSkillsForMethod(methodId).find(skill => !data.Progression.isUnlocked(skill.id));
    if (nextLocked && !shownSkillIds.has(nextLocked.id)) {
      actionsList.appendChild(createLockedSkillCard(nextLocked));
    }

    if (actionsList.children.length === 0) return;

    const group = document.createElement("section");
    group.className = "skill-method-group";
    group.dataset.method = methodId;

    const title = document.createElement("h3");
    title.className = "skill-method-title";
    title.textContent = `${cfg.emoji} ${cfg.name}`;
    group.appendChild(title);

    if (cfg.desc) {
      const desc = document.createElement("p");
      desc.className = "skill-method-desc";
      desc.textContent = cfg.desc;
      group.appendChild(desc);
    }

    group.appendChild(actionsList);
    skillsList.appendChild(group);
  });
}
