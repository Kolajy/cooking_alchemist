---
name: game-design
description: "Expert skill in drafting web-based game mechanics, game loops, canvas rendering optimizations, and state machines."
---

# Game Design & Architecture Skill

This skill provides guides, best practices, and code patterns for **Culinary Alchemy** — a DOM-based discovery game (not a canvas loop). Content is authored in the shared `content/` package and exported to all platforms via `npm run export-native`.

## Culinary Alchemy specifics

- **Authoring root:** `content/data/` — not `web/src/data/`
- **Engines:** `CombinationEngine`, `ProgressionEngine`, `achievement_engine` — pure logic, no DOM
- **Serializable state:** discovery, progression, achievements, settings (see `content/types.ts`)
- **Validation:** `npm test` + `cargo test -p culinary-core` after content changes
- **Docs:** `docs/GAME_DESIGN.md`, `docs/DATA_SCHEMA.md`, `docs/DATA_LAYER.md`

The patterns below are general web-game guidance; adapt for event-driven DOM UI rather than `requestAnimationFrame` canvas loops where noted.

---

## 1. Core Web Game Loop Pattern

Always structure the main game loop using `requestAnimationFrame` to ensure smooth frame-rate updates that align with the user's monitor refresh rate.

```javascript
class Game {
  constructor() {
    this.lastTime = 0;
    this.accumulator = 0;
    this.timestep = 1000 / 60; // Fixed update rate: 60fps
    
    this.gameState = {
      entities: [],
      score: 0,
      isGameOver: false
    };
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    if (this.gameState.isGameOver) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Avoid spiral of death for large lag spikes
    this.accumulator += Math.min(dt, 250); 

    // Update with fixed timestep for deterministic physics/movement
    while (this.accumulator >= this.timestep) {
      this.update(this.timestep);
      this.accumulator -= this.timestep;
    }

    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Process input, update entity positions, check collisions
    for (const entity of this.gameState.entities) {
      entity.update(dt);
    }
  }

  render() {
    // Clear canvas and draw all active entities
  }
}
```

## 2. Decoupled State & Save System

To ensure a smooth Steam Port (including support for Steam Cloud Saves), the game state should be fully serializable into JSON.

*   **Rule**: Never put raw DOM elements, HTML elements, or circular references inside the game state object.
*   **Structure**: Keep the model (state JSON) strictly separated from the views (Canvas rendering or DOM display).
*   **State Interface Example**:
    ```json
    {
      "version": "1.0.0",
      "saveTimestamp": 1718621900000,
      "player": {
        "position": { "x": 120, "y": 450 },
        "velocity": { "x": 0, "y": 0 },
        "health": 100,
        "inventory": ["rusty_key", "healing_potion"]
      },
      "levelProgress": {
        "currentLevel": 2,
        "unlockedAchievements": ["first_steps", "potion_chugger"]
      }
    }
    ```

## 3. Canvas Rendering & Performance Rules

*   **Double Buffering**: Use off-screen canvases to pre-render static background layers (like maps or gridlines) and draw that canvas in a single operation on the main frame.
*   **Object Pooling**: Avoid instantiating temporary particle or projectile objects inside the update/render cycle. Pre-allocate arrays of entities and toggle an `active` boolean.
*   **Resolution Scaling**: Handle High-DPI screens (Retina displays) by scaling the canvas width/height attributes using `window.devicePixelRatio`, while keeping CSS styling dimensions constant.
