import { getCtx } from "../context";
import { getProcessedDiscoveryCount, invalidateIngredientCatalog } from "../ingredients";
import { refreshProgressGraphIfOpen } from "../ui/views";
import { triggerIngredientUnlockNotification } from "./notifications";

export function checkMilestones(): void {
  const { data } = getCtx();
  const discoveredCount = getProcessedDiscoveryCount();
  const newlyUnlocked = data.Progression.checkMilestoneUnlocks(discoveredCount);

  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(triggerIngredientUnlockNotification);
    invalidateIngredientCatalog();
    refreshProgressGraphIfOpen();
  }
}
