/**
 * Culinary Alchemy - Progression Engine (Pure Logic)
 * Decoupled from DOM, browser window, and persistence mechanisms.
 */

import type { ProgressionConfig, ProgressionState, TechniqueTier, XpResult } from "../types";

export class ProgressionEngine {
  config: ProgressionConfig;
  tiers: Record<string, TechniqueTier>;
  state: ProgressionState;
  private unlockCache = new Map<string, boolean>();
  private actionModes: Set<string>;

  constructor(config: ProgressionConfig, initialState: ProgressionState | null = null) {
    this.config = config;
    this.tiers = config.techniques;
    this.state = initialState || {
      xp: {},
      milestonesReached: []
    };

    this.actionModes = new Set(
      Object.values(this.config.playerActions || {})
        .map(action => action.mode)
        .filter((mode): mode is string => Boolean(mode))
    );

    for (const key in this.tiers) {
      if (this.state.xp[key] === undefined) {
        this.state.xp[key] = 0;
      }
    }

    for (const mode of this.actionModes) {
      if (this.state.xp[mode] === undefined) {
        this.state.xp[mode] = 0;
      }
    }
  }

  private clearUnlockCache(): void {
    this.unlockCache.clear();
  }

  getState(): ProgressionState {
    return this.state;
  }

  getXP(skillId: string): number {
    return this.state.xp[skillId] || 0;
  }

  isUnlocked(skillId: string): boolean {
    const cached = this.unlockCache.get(skillId);
    if (cached !== undefined) return cached;

    const skill = this.tiers[skillId];
    if (!skill) {
      this.unlockCache.set(skillId, false);
      return false;
    }

    if (skill.unlockCriteria?.prerequisites) {
      for (const parentId in skill.unlockCriteria.prerequisites) {
        const requiredExp = skill.unlockCriteria.prerequisites[parentId];
        if (this.getXP(parentId) < requiredExp) {
          this.unlockCache.set(skillId, false);
          return false;
        }
      }
    }

    const unlocked = !skill.dependsOn?.length
      || skill.dependsOn.every(parentId => this.isUnlocked(parentId));
    this.unlockCache.set(skillId, unlocked);
    return unlocked;
  }

  getActiveTier(category: string): (TechniqueTier & { id: string }) | null {
    // ⚡ Bolt: Use for...in loop instead of Object.keys().map().filter() to avoid intermediate array allocations
    const unlocked = [];
    for (const id in this.tiers) {
      const skill = this.tiers[id];
      if (skill.category === category && this.isUnlocked(id)) {
        unlocked.push({ id, ...skill });
      }
    }

    if (unlocked.length === 0) return null;

    let active = unlocked[0];
    let maxAncestors = -1;

    unlocked.forEach(skill => {
      const ancestors = this.countUnlockedAncestors(skill.id);
      if (ancestors > maxAncestors) {
        maxAncestors = ancestors;
        active = skill;
      }
    });

    return active;
  }

  countUnlockedAncestors(skillId: string): number {
    const skill = this.tiers[skillId];
    if (!skill?.dependsOn) return 0;

    let count = 0;
    skill.dependsOn.forEach(parentId => {
      if (this.isUnlocked(parentId)) {
        count += 1 + this.countUnlockedAncestors(parentId);
      }
    });
    return count;
  }

  getToolCategory(toolId: string): string | null {
    const skill = this.tiers[toolId];
    return skill ? skill.category : null;
  }

  isActionMode(skillId: string): boolean {
    return skillId in this.config.playerActions;
  }

  addXP(skillId: string, amount: number): XpResult {
    if (this.state.xp[skillId] === undefined) {
      this.state.xp[skillId] = 0;
    }

    const maxExp = this.config.maxSkillExp ?? 99;
    // ⚡ Bolt: Use for...in loop to avoid intermediate array allocations from Object.keys().filter()
    const previouslyLocked: string[] = [];
    for (const id in this.tiers) {
      if (!this.isUnlocked(id)) {
        previouslyLocked.push(id);
      }
    }

    this.state.xp[skillId] = Math.min(this.state.xp[skillId] + amount, maxExp);
    this.clearUnlockCache();

    const newlyUnlockedSkills = [];
    for (const id of previouslyLocked) {
      if (this.isUnlocked(id)) {
        newlyUnlockedSkills.push({ id, ...this.tiers[id] });
      }
    }

    return {
      leveledUp: newlyUnlockedSkills.length > 0,
      newlyUnlockedSkills
    };
  }

  checkMilestoneUnlocks(discoveredCount: number) {
    const newlyUnlocked = [];

    this.config.milestones.forEach((milestone, index) => {
      if (discoveredCount >= milestone.recipesCount) {
        if (!this.state.milestonesReached.includes(index)) {
          this.state.milestonesReached.push(index);
          newlyUnlocked.push(milestone);
        }
      }
    });

    return newlyUnlocked;
  }

  getUnlockedIngredients(): string[] {
    const unlocked = new Set<string>();

    this.config.milestones.forEach((milestone, index) => {
      if (this.state.milestonesReached.includes(index)) {
        milestone.unlocks.forEach(ing => unlocked.add(ing));
      }
    });

    return Array.from(unlocked);
  }
}

globalThis.ProgressionEngine = ProgressionEngine;
