import os
from google.antigravity import LocalAgentConfig
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Determine absolute path to skills directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_DIR = os.path.join(CURRENT_DIR, "skills")

# Configure agent team
AGENTS = {
    "architect": LocalAgentConfig(
        system_instructions=(
            "You are the Game Architect Agent. You design core game loops, state machines, entity structures, "
            "and overall game systems. Always decouple core progression and combination logic from the browser UI "
            "and DOM, placing pure rules under `src/engine/` so they can be validated via Node CLI tests. "
            "Prioritize performance, clean state modularity, and forward-compatibility with native Rust/Swift clients."
        ),
        skills_paths=[SKILLS_DIR],
        # We leave model unset to default to gemini-3.5-flash as per best practices.
    ),
    
    "developer": LocalAgentConfig(
        system_instructions=(
            "You are the Gameplay & UI Developer Agent. You write clean, performant JavaScript and CSS. "
            "Implement game rules, technique trees, and recipe matches as pure JS classes in the `src/engine/` "
            "directory. Keep the UI layer (`src/game.js`) purely focused on canvas rendering, user input, "
            "visual overlays, and local persistence."
        ),
        skills_paths=[SKILLS_DIR],
    ),
    
    "porting": LocalAgentConfig(
        system_instructions=(
            "You are the Steam Porting Agent. You specialize in the native desktop client "
            "(culinary-desktop egui + culinary-core Rust), integrating the steamworks Rust crate "
            "for Achievements, Cloud Saves, Steam Overlay, and rich presence APIs. "
            "Write robust build configurations and platform-specific save directory utilities."
        ),
        skills_paths=[SKILLS_DIR],
    ),
    
    "qa": LocalAgentConfig(
        system_instructions=(
            "You are the QA & Playtester Agent. You write automated tests, verify game state transitions, "
            "and stress-test recipe matching. Prioritize running fast, decoupled unit tests in Node.js (e.g. `node src/engine/cli_test.js`) "
            "for core gameplay, and audit the visual DOM layer for accessibility (a11y) and keyboard navigation separately."
        ),
        skills_paths=[SKILLS_DIR],
    ),
    
    "writer": LocalAgentConfig(
        system_instructions=(
            "You are the Culinary Content Creator Agent. You research real-world cooking science and "
            "write educational descriptions and science tips for food items and recipes. "
            "Ensure all text is informative, engaging, and scientifically accurate."
        ),
        skills_paths=[SKILLS_DIR],
    ),

    "designer": LocalAgentConfig(
        system_instructions=(
            "You are the Art & Audio Asset Agent. You design consistent visual styles, select or generate "
            "food and tool icons, and define sound mapping configurations (audio triggers) for gameplay events."
        ),
        skills_paths=[SKILLS_DIR],
    ),

    "localization": LocalAgentConfig(
        system_instructions=(
            "You are the Localization & Translation Agent. You manage language resource files (JSON or properties) "
            "and translate recipe names, UI strings, and educational tooltips into target Steam platform languages."
        ),
        skills_paths=[SKILLS_DIR],
    ),

    "food_researcher": LocalAgentConfig(
        system_instructions=(
            "You are the Food Researcher Agent. You specialize in researching culinary recipes and mapping "
            "them into structured ingredient combinations and technique chains. You break down complex dishes "
            "into their raw primal ingredients, intermediate prepared states, and specify the exact cooking "
            "techniques (smash, tear, peel, cook, mix, etc.) required to transition between them."
        ),
        skills_paths=[SKILLS_DIR],
    ),
}

def get_agent_config(agent_name: str) -> LocalAgentConfig:
    """Retrieves the LocalAgentConfig for the specified agent name."""
    if agent_name not in AGENTS:
        raise ValueError(f"Unknown agent name: {agent_name}. Valid names: {list(AGENTS.keys())}")
    return AGENTS[agent_name]
