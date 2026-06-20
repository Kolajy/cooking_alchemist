mod app;
mod game;

use culinary_core::GameBundle;
use eframe::egui;
use std::path::PathBuf;

fn assets_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("core")
        .join("assets")
}

fn main() -> eframe::Result<()> {
    let bundle = GameBundle::load(&assets_dir()).expect("load game assets from core/assets");
    let native_options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1100.0, 760.0])
            .with_title("Culinary Alchemy"),
        ..Default::default()
    };
    eframe::run_native(
        "Culinary Alchemy",
        native_options,
        Box::new(|_cc| Ok(Box::new(app::App::new(bundle)))),
    )
}
