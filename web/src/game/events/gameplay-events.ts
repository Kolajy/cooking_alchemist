import type {
  DiscoveryActionContext,
  IngredientItem,
  MatchedRecipe,
  TechniqueTier
} from "../../types";

export type GameplayDiscoveryEvent = {
  recipe: MatchedRecipe;
  discoveredResults: IngredientItem[];
  actionContext: DiscoveryActionContext | null;
  discoveredIds: string[];
};

export type GameplayXpEvent = {
  trackId: string;
  amount: number;
  leveledUp: boolean;
  newlyUnlockedSkills: Array<TechniqueTier & { id: string }>;
};

export type GameplayAchievementCheckEvent = {
  silent?: boolean;
};

export type GameplayDiscoveryChangedEvent = {
  ids?: string[];
};

export type GameplayAutoSaveEvent = {
  timestamp: number;
};

type GameplayEventMap = {
  discovery: GameplayDiscoveryEvent;
  xp: GameplayXpEvent;
  achievementCheck: GameplayAchievementCheckEvent;
  discoveryChanged: GameplayDiscoveryChangedEvent;
  autoSaved: GameplayAutoSaveEvent;
};

type Listener<K extends keyof GameplayEventMap> = (payload: GameplayEventMap[K]) => void;

const listeners = new Map<keyof GameplayEventMap, Set<Listener<keyof GameplayEventMap>>>();

export function onGameplayEvent<K extends keyof GameplayEventMap>(
  event: K,
  listener: Listener<K>
): () => void {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  const bucket = listeners.get(event)!;
  bucket.add(listener as Listener<keyof GameplayEventMap>);
  return () => bucket.delete(listener as Listener<keyof GameplayEventMap>);
}

export function emitGameplayEvent<K extends keyof GameplayEventMap>(
  event: K,
  payload: GameplayEventMap[K]
): void {
  const bucket = listeners.get(event);
  if (!bucket) return;
  bucket.forEach(listener => {
    (listener as Listener<K>)(payload);
  });
}

/** Clear all listeners — for tests. */
export function resetGameplayEvents(): void {
  listeners.clear();
}
