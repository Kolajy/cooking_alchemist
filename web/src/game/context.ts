import { createInitialState } from "./state";
import { createDataLayer } from "./data";
import { queryDom } from "./dom";
import type { GameActions, GameContext } from "../types";

/** Shared runtime context — avoids prop-drilling across game modules. */
let ctx: GameContext | null = null;

export function createContext(): GameContext {
  ctx = {
    state: createInitialState(),
    dom: queryDom(),
    data: createDataLayer(),
    actions: {} as GameActions
  };
  return ctx;
}

export function getCtx(): GameContext {
  if (!ctx) {
    throw new Error("Game context not initialized — call createContext() first.");
  }
  return ctx;
}
