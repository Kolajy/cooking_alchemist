use serde::{Deserialize, Serialize};

use crate::types::{DiscoveryLogEntry, ProgressionState};

pub const SAVE_VERSION: u32 = 1;
pub const SAVE_GAME_ID: &str = "culinary-alchemy";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoverySaveData {
    pub discovered: Vec<String>,
    pub recent: Vec<String>,
    pub highlights: Vec<String>,
    #[serde(rename = "discoveryLog")]
    pub discovery_log: Vec<DiscoveryLogEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveSettings {
    #[serde(rename = "soundEnabled", default = "default_sound")]
    pub sound_enabled: bool,
}

fn default_sound() -> bool {
    true
}

/// Portable save file — shared across web, desktop, iOS, and Android.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameSaveFile {
    pub version: u32,
    pub game: String,
    #[serde(rename = "exportedAt")]
    pub exported_at: u64,
    pub discovery: DiscoverySaveData,
    pub progression: ProgressionState,
    #[serde(default)]
    pub achievements: AchievementsSaveData,
    pub settings: SaveSettings,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AchievementsSaveData {
    #[serde(default)]
    pub unlocked: Vec<AchievementUnlock>,
    #[serde(default)]
    pub flags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AchievementUnlock {
    pub id: String,
    #[serde(rename = "unlockedAt")]
    pub unlocked_at: u64,
}

impl GameSaveFile {
    pub fn from_json(json: &str) -> Result<Self, String> {
        serde_json::from_str(json).map_err(|e| e.to_string())
    }

    pub fn to_json(&self) -> Result<String, String> {
        serde_json::to_string_pretty(self).map_err(|e| e.to_string())
    }
}
