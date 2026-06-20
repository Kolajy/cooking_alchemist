import { recordRecentDiscoveries, saveProgress } from "../persistence";
import { checkMilestones } from "../progression/milestones";
import { recordDiscoveryAchievements, checkAchievements } from "../progression/achievements";
import { refreshAfterGameplay } from "../ui/refresh";
import { queueDiscovery } from "../ui/discovery";
import { refreshProgressGraphIfOpen } from "../ui/views";
import {
  checkPlayerActionUnlocks,
  triggerLevelUpNotification
} from "../progression/notifications";
import { refreshDiscoveryJournalIfOpen } from "../ui/journal";
import { onGameplayEvent, emitGameplayEvent } from "./gameplay-events";
import { trackAnalyticsEvent } from "../analytics";

let registered = false;

/** Wire gameplay side-effects (persistence, UI, achievements) to domain events. */
export function registerGameplayEffects(): void {
  if (registered) return;
  registered = true;

  onGameplayEvent("discovery", event => {
    recordRecentDiscoveries(event.discoveredIds);
    saveProgress();
    checkMilestones();
    recordDiscoveryAchievements(event.discoveredIds);
    refreshAfterGameplay({ stats: true, cabinet: true });
    queueDiscovery(event.recipe, event.discoveredResults, event.actionContext);
    refreshProgressGraphIfOpen();
    checkPlayerActionUnlocks();

    // GA discovery tracking
    const itemNames = (event.discoveredResults || []).map(item => item.name);
    trackAnalyticsEvent("discovery", {
      recipe_id: event.recipe.id,
      recipe_name: event.recipe.name || event.recipe.result.name,
      discovered_items: itemNames,
      technique: event.actionContext?.trackId
    });
  });

  onGameplayEvent("xp", event => {
    trackAnalyticsEvent("xp_gain", {
      track_id: event.trackId,
      amount: event.amount
    });

    if (event.leveledUp) {
      event.newlyUnlockedSkills.forEach(skillId => {
        triggerLevelUpNotification(skillId);
        trackAnalyticsEvent("level_up", {
          track_id: event.trackId,
          unlocked_skill: skillId
        });
      });
    }
    emitGameplayEvent("achievementCheck", { silent: false });
  });

  onGameplayEvent("achievementCheck", event => {
    checkAchievements(event);
  });

  onGameplayEvent("discoveryChanged", () => {
    refreshDiscoveryJournalIfOpen();
  });
}
