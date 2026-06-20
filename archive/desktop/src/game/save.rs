pub use culinary_core::GameSaveFile;

pub fn save_path() -> Option<std::path::PathBuf> {
    directories::ProjectDirs::from("", "", "culinary-alchemy")
        .map(|d| d.data_dir().join("save.json"))
}

pub fn load_save_file(path: &std::path::Path) -> Result<GameSaveFile, String> {
    let text = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    GameSaveFile::from_json(&text)
}

pub fn write_save_file(path: &std::path::Path, save: &GameSaveFile) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = save.to_json()?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}
