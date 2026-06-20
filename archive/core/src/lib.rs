mod achievements;
mod bundle;
mod combination;
mod ffi;
mod progression;
mod runtime;
mod save;
mod types;

pub use achievements::AchievementEngine;
pub use types::GameBundle;
pub use types::DiscoveryLogEntry;
pub use types::IngredientItem;
pub use types::ProgressionState;
pub use types::MatchResult;
pub use combination::CombinationEngine;
pub use progression::ProgressionEngine;
pub use runtime::{ActionResult, GameRuntime, MAX_RECENT_DISCOVERIES};
pub use save::{AchievementUnlock, AchievementsSaveData, DiscoverySaveData, GameSaveFile, SaveSettings, SAVE_GAME_ID, SAVE_VERSION};

use std::path::Path;
use std::sync::OnceLock;

static GAME: OnceLock<GameBundle> = OnceLock::new();

/// Load game data from a directory containing `game_bundle.json` and `transitions.json`.
pub fn load_from_dir(dir: &Path) -> Result<GameBundle, String> {
    let bundle = GameBundle::load(dir)?;
    GAME.set(bundle.clone()).ok();
    Ok(bundle)
}

/// Global instance after `load_from_dir` (for FFI).
pub fn game() -> &'static GameBundle {
    GAME.get().expect("culinary-core not initialized — call load_from_dir first")
}
