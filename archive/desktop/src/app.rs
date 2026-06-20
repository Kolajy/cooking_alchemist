use crate::game::session::{GameSession, METHOD_ORDER, SidebarTab};
use culinary_core::GameBundle;
use eframe::egui;

pub struct App {
    session: GameSession,
}

impl App {
    pub fn new(bundle: GameBundle) -> Self {
        Self {
            session: GameSession::new(bundle),
        }
    }
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        if !self.session.toast.is_empty() {
            let toast = self.session.toast.clone();
            egui::TopBottomPanel::top("toast").show(ctx, |ui| {
                ui.colored_label(egui::Color32::LIGHT_GREEN, &toast);
            });
            if ctx.input(|i| i.pointer.any_click()) {
                self.session.toast.clear();
            }
        }

        self.render_discovery_modal(ctx);
        self.render_toolbar(ctx);
        self.render_sidebar(ctx);
        self.render_counter(ctx);
    }
}

impl App {
    fn render_discovery_modal(&mut self, ctx: &egui::Context) {
        let Some(discovery) = self.session.pending_discovery.clone() else {
            return;
        };
        let mut open = true;
        egui::Window::new("New Ingredient Discovered")
            .open(&mut open)
            .collapsible(false)
            .resizable(false)
            .anchor(egui::Align2::CENTER_CENTER, [0.0, 0.0])
            .show(ctx, |ui| {
                let title = if discovery.remaining > 0 {
                    format!("New Ingredient Discovered ({} more)", discovery.remaining)
                } else {
                    "Congratulations!".to_string()
                };
                ui.heading(&title);
                ui.separator();
                ui.horizontal(|ui| {
                    ui.label(egui::RichText::new(&discovery.emoji).size(48.0));
                    ui.vertical(|ui| {
                        ui.heading(&discovery.name);
                        if !discovery.description.is_empty() {
                            ui.label(&discovery.description);
                        }
                        ui.add_space(4.0);
                        ui.label(egui::RichText::new(&discovery.blurb).italics());
                    });
                });
                if let Some((label, cur, max, pct)) = {
                    let (l, c, m, p) = self.session.track_exp_summary(&discovery.track_id);
                    Some((l, c, m, p))
                } {
                    ui.add_space(8.0);
                    ui.label(format!("{} +{} exp", label, discovery.exp_awarded));
                    ui.add(egui::ProgressBar::new(pct / 100.0).text(format!("{cur} / {max} exp")));
                }
                ui.add_space(8.0);
                if ui.button("Continue").clicked() {
                    self.session.dismiss_discovery();
                }
            });
        if !open {
            self.session.dismiss_discovery();
        }
    }

    fn render_toolbar(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::bottom("methods").show(ctx, |ui| {
            ui.horizontal_wrapped(|ui| {
                let move_sel = self.session.active_action == "move";
                if ui.selectable_label(move_sel, "✋ Move").clicked() {
                    self.session.set_move_mode();
                }
                ui.separator();
                for method_id in METHOD_ORDER {
                    let action = self.session.bundle().progression.player_actions.get(method_id);
                    let label = action
                        .map(|a| format!("{} {}", a.emoji, a.name))
                        .unwrap_or_else(|| method_id.to_string());
                    let unlocked = self.session.is_player_action_unlocked(method_id);
                    let selected = self.session.active_action == method_id
                        || (method_id == "force" && self.session.active_action == "smash")
                        || (method_id == "change" && self.session.active_action == "thermal");
                    ui.add_enabled_ui(unlocked, |ui| {
                        if ui.selectable_label(selected, label).clicked() {
                            self.session.select_method(method_id, true);
                        }
                    });
                    if !unlocked {
                        ui.label("🔒");
                    }
                }
            });

            let active_method = if self.session.active_action == "smash" {
                "force".to_string()
            } else if self.session.active_action == "thermal" {
                "change".to_string()
            } else if self.session.active_action == "move" {
                String::new()
            } else {
                self.session.active_action.clone()
            };

            if !active_method.is_empty() && active_method != "combine" && active_method != "separate" {
                ui.separator();
                let options = self.session.method_skill_options(&active_method);
                ui.horizontal_wrapped(|ui| {
                    for opt in options {
                        let selected = self.session.active_skill_id.as_deref() == Some(opt.id.as_str());
                        if ui.selectable_label(selected, format!("{} {}", opt.emoji, opt.name)).clicked() {
                            self.session.active_skill_id = Some(opt.id.clone());
                            self.session.active_action = opt.category.clone();
                        }
                    }
                });
            }

            ui.horizontal(|ui| {
                if ui.button("Apply to counter").clicked() {
                    self.session.apply_action_to_counter();
                }
                if ui.button("Clear counter").clicked() {
                    self.session.clear_counter();
                }
                ui.separator();
                ui.label(&self.session.message);
            });
        });
    }

    fn render_sidebar(&mut self, ctx: &egui::Context) {
        egui::SidePanel::left("sidebar")
            .resizable(true)
            .default_width(280.0)
            .show(ctx, |ui| {
                ui.horizontal(|ui| {
                    if ui.selectable_label(self.session.sidebar_tab == SidebarTab::Cabinet, "Pantry").clicked() {
                        self.session.sidebar_tab = SidebarTab::Cabinet;
                    }
                    if ui.selectable_label(self.session.sidebar_tab == SidebarTab::Skills, "Skills").clicked() {
                        self.session.sidebar_tab = SidebarTab::Skills;
                    }
                    if ui.selectable_label(self.session.sidebar_tab == SidebarTab::Journal, "Journal").clicked() {
                        self.session.sidebar_tab = SidebarTab::Journal;
                    }
                });
                ui.separator();
                ui.label(self.session.stats_text());
                ui.separator();

                match self.session.sidebar_tab {
                    SidebarTab::Cabinet => self.render_cabinet(ui),
                    SidebarTab::Skills => self.render_skills(ui),
                    SidebarTab::Journal => self.render_journal(ui),
                }

                ui.separator();
                ui.horizontal_wrapped(|ui| {
                    if ui.button("Export").clicked() {
                        self.session.export_save_dialog();
                    }
                    if ui.button("Import").clicked() {
                        self.session.import_save_dialog();
                    }
                    if ui.button("Reset").clicked() {
                        self.session.reset_to_starters();
                    }
                    let sound_label = if self.session.sound_enabled() { "🔊" } else { "🔇" };
                    if ui.button(sound_label).clicked() {
                        self.session.set_sound_enabled(!self.session.sound_enabled());
                        self.session.persist();
                    }
                });
            });
    }

    fn render_cabinet(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            ui.label("Search:");
            ui.text_edit_singleline(&mut self.session.search_term);
        });
        ui.horizontal_wrapped(|ui| {
            for state in ["primal", "raw", "prepared", "recipe", "recent"] {
                let on = self.session.state_filter_includes.contains(state);
                if ui.selectable_label(on, state).clicked() {
                    if on {
                        self.session.state_filter_includes.remove(state);
                    } else {
                        self.session.state_filter_includes.insert(state.to_string());
                    }
                }
            }
        });
        ui.horizontal_wrapped(|ui| {
            for cat in self.session.ingredient_types() {
                let on = self.session.type_filter_includes.contains(&cat);
                if ui.selectable_label(on, &cat).clicked() {
                    if on {
                        self.session.type_filter_includes.remove(&cat);
                    } else {
                        self.session.type_filter_includes.insert(cat);
                    }
                }
            }
        });
        ui.separator();
        egui::ScrollArea::vertical().show(ui, |ui| {
            for item in self.session.cabinet_catalog() {
                let label = format!("{} {} [{}]", item.emoji, item.name, item.state_key);
                let mut rich = egui::RichText::new(label);
                if item.is_recent {
                    rich = rich.strong();
                }
                if ui.button(rich).clicked() {
                    self.session.add_to_counter(&item.id);
                }
                if !item.description.is_empty() {
                    ui.label(egui::RichText::new(&item.description).small().weak());
                }
            }
        });
    }

    fn render_skills(&mut self, ui: &mut egui::Ui) {
        egui::ScrollArea::vertical().show(ui, |ui| {
            for (_id, title, cards) in self.session.skill_groups() {
                ui.heading(&title);
                for card in cards {
                    ui.group(|ui| {
                        ui.label(&card.title);
                        ui.label(&card.detail);
                        ui.add(egui::ProgressBar::new(card.percent / 100.0));
                    });
                }
                ui.add_space(8.0);
            }
        });
    }

    fn render_journal(&mut self, ui: &mut egui::Ui) {
        ui.label(format!("{} entries", self.session.discovery_log().len()));
        egui::ScrollArea::vertical().show(ui, |ui| {
            if self.session.discovery_log().is_empty() {
                ui.label("Your hearth journal is blank. Discover ingredients to fill it.");
                return;
            }
            for entry in self.session.discovery_log() {
                if let Some(item) = self.session.item(&entry.id) {
                    ui.horizontal(|ui| {
                        ui.label(&item.emoji);
                        ui.vertical(|ui| {
                            ui.label(&item.name);
                            if entry.discovered_at > 0 {
                                let secs = entry.discovered_at / 1000;
                                ui.label(
                                    egui::RichText::new(format!("discovered @ {secs}"))
                                        .small()
                                        .weak(),
                                );
                            }
                        });
                    });
                    ui.separator();
                }
            }
        });
    }

    fn render_counter(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Counter");
            ui.label("Move: select items. Combine: pick two. Techniques: tap an item.");
            ui.separator();
            let counter: Vec<String> = self.session.counter.clone();
            ui.horizontal_wrapped(|ui| {
                for (index, id) in counter.iter().enumerate() {
                    let selected = self.session.selected_counter == Some(index);
                    ui.horizontal(|ui| {
                        if ui.selectable_label(selected, self.session.label(id)).clicked() {
                            self.session.on_counter_click(index);
                        }
                        if ui.small_button("×").clicked() {
                            self.session.remove_from_counter(index);
                        }
                    });
                }
            });
        });
    }
}
