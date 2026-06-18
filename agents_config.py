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
            "and overall game systems for a web-based game. Your designs must support saving state to JSON "
            "and packaging into native desktop wrappers. Always prioritize performance, cleanliness, and scalability."
        ),
        skills_paths=[SKILLS_DIR],
        # We leave model unset to default to gemini-3.5-flash as per best practices.
    ),
    
    "developer": LocalAgentConfig(
        system_instructions=(
            "You are the Gameplay & UI Developer Agent. You write clean, performant JavaScript, HTML5 Canvas render code, "
            "and premium responsive UI with custom CSS. Focus on a smooth 60fps frame rate, efficient asset handling, "
            "keyboard and gamepad navigation, and stunning visual layouts like glassmorphism. "
            "Use the game-design skill to review best practices for game loops."
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
            "You are the QA & Playtester Agent. You write automated playtesting scripts, design test cases, "
            "stress-test game state machines, check for memory leaks on the HTML5 Canvas, monitor frame-rate drops, "
            "and audit accessibility (a11y) and keyboard navigation."
        ),
        skills_paths=[SKILLS_DIR],
    ),
}

def get_agent_config(agent_name: str) -> LocalAgentConfig:
    """Retrieves the LocalAgentConfig for the specified agent name."""
    if agent_name not in AGENTS:
        raise ValueError(f"Unknown agent name: {agent_name}. Valid names: {list(AGENTS.keys())}")
    return AGENTS[agent_name]
