import { getCtx } from "../context";
import { getProcessedDiscoveryCount } from "../ingredients";
import { getMaxSkillExp } from "../constants";

export function isPlayerActionUnlocked(actionId: string): boolean {
  const { data, state } = getCtx();
  const config = data.PLAYER_ACTIONS[actionId];
  if (!config || !config.unlockCriteria) return true;

  const criteria = config.unlockCriteria;
  if (criteria.requiredIngredients) {
    const hasAll = criteria.requiredIngredients.every(ingId => state.discoveredIds.has(ingId));
    if (!hasAll) return false;
  }

  if (criteria.discoveredRecipes !== undefined) {
    if (getProcessedDiscoveryCount() < criteria.discoveredRecipes) return false;
  }

  return true;
}

export function getSkillCategories(): string[] {
  const { data } = getCtx();
  const seen = new Set<string>();
  const ordered: string[] = [];

  Object.values(data.PROGRESSION_TIERS).forEach(skill => {
    if (!seen.has(skill.category)) {
      seen.add(skill.category);
      ordered.push(skill.category);
    }
  });

  return ordered;
}

export function getUnlockedSkills(skills: Array<{ id: string }>) {
  const { data } = getCtx();
  return skills.filter(skill => data.Progression.isUnlocked(skill.id));
}

export function getSkillsInCategory(category: string) {
  const { data } = getCtx();
  const skills = Object.keys(data.PROGRESSION_TIERS)
    .map(id => ({ id, ...data.PROGRESSION_TIERS[id] }))
    .filter(skill => skill.category === category);

  const roots = skills.filter(skill => !skill.dependsOn || skill.dependsOn.length === 0);
  if (roots.length === 0) return skills;

  const ordered: typeof skills = [];
  let current = roots[0];
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    ordered.push(current);
    visited.add(current.id);
    const nextId = current.leadsTo && current.leadsTo[0];
    current = nextId ? skills.find(skill => skill.id === nextId) : undefined;
  }

  skills.forEach(skill => {
    if (!visited.has(skill.id)) ordered.push(skill);
  });

  return ordered;
}

export function getSkillsForMethod(methodId: string) {
  const { data } = getCtx();
  const cfg = data.PLAYER_ACTIONS[methodId];
  if (!cfg) return [];

  const skills: Array<{ id: string } & (typeof data.PROGRESSION_TIERS)[string]> = [];
  (cfg.categories || []).forEach(category => {
    getSkillsInCategory(category).forEach(skill => skills.push(skill));
  });
  return skills;
}

export function getUnlockedSkillsForMethod(methodId: string) {
  return getUnlockedSkills(getSkillsForMethod(methodId));
}

function getNextSkillInChain(skillId: string) {
  const { data } = getCtx();
  return Object.keys(data.PROGRESSION_TIERS)
    .map(id => ({ id, ...data.PROGRESSION_TIERS[id] }))
    .find(skill => skill.dependsOn && skill.dependsOn.includes(skillId));
}

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

function getNextLockedSkillForTrack(trackId: string, methodId: string) {
  const { data } = getCtx();
  return getSkillsForMethod(methodId).find(skill => {
    if (data.Progression.isUnlocked(skill.id)) return false;
    const prereqs = skill.unlockCriteria?.prerequisites;
    return prereqs && Object.prototype.hasOwnProperty.call(prereqs, trackId);
  });
}

/** Exp summary for a progression track (mode or skill), for discovery popups and similar UI. */
export function getTrackExpSummary(trackId: string, overrideExp?: number) {
  if (!trackId) return null;

  const { data } = getCtx();
  const maxExp = getMaxSkillExp(data);
  const currentExp = overrideExp !== undefined ? Math.min(overrideExp, maxExp) : getCappedExp(trackId);
  const percent = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));
  const label = getTrackLabel(trackId);
  let detailText = `${currentExp} / ${maxExp} exp`;

  const tier = data.PROGRESSION_TIERS[trackId];
  if (tier) {
    const nextSkill = getNextSkillInChain(trackId);
    const required = nextSkill?.unlockCriteria?.prerequisites?.[trackId];
    if (nextSkill && required !== undefined && currentExp < required) {
      detailText += ` · ${nextSkill.emoji} ${nextSkill.name} at ${required}`;
    }
  } else {
    const methodId = Object.keys(data.PLAYER_ACTIONS).find(id => data.PLAYER_ACTIONS[id]?.mode === trackId);
    if (methodId) {
      const nextLocked = getNextLockedSkillForTrack(trackId, methodId);
      const needed = nextLocked?.unlockCriteria?.prerequisites?.[trackId];
      if (nextLocked && needed !== undefined) {
        detailText += ` · ${nextLocked.emoji} ${nextLocked.name} at ${needed}`;
      }
    }
  }

  return {
    trackId,
    label,
    currentExp,
    maxExp,
    percent,
    detailText
  };
}
