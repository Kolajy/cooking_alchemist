#!/usr/bin/env python3
import asyncio
import argparse
import sys
import os
from google.antigravity import Agent
from agents_config import get_agent_config

def check_api_key():
    """Verify GEMINI_API_KEY exists, otherwise prompt user with a setup URL."""
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        print("Please configure your API key in a .env file or export it directly.", file=sys.stderr)
        print("To generate a Gemini API key, visit: https://aistudio.google.com/app/api-keys\n", file=sys.stderr)
        sys.exit(1)

async def run_single_prompt(agent_name: str, prompt: str):
    """Initializes the specified agent and runs a single chat prompt."""
    config = get_agent_config(agent_name)
    
    print(f"[{agent_name.upper()} AGENT] Initializing session...")
    async with Agent(config) as agent:
        print(f"[{agent_name.upper()} AGENT] Processing your request...\n")
        response = await agent.chat(prompt)
        
        async for chunk in response:
            print(chunk, end="", flush=True)
        print("\n")

async def run_interactive(agent_name: str):
    """Initializes the specified agent and launches the terminal interactive loop."""
    config = get_agent_config(agent_name)
    
    print(f"[{agent_name.upper()} AGENT] Starting interactive loop. Type 'exit' or 'quit' to end.")
    async with Agent(config) as agent:
        await agent.run_interactive_loop()

def main():
    parser = argparse.ArgumentParser(description="Run Google Antigravity SDK Agents for Cooking Web Game Development.")
    parser.add_argument(
        "--agent", 
        choices=["architect", "developer", "porting", "qa"], 
        required=True,
        help="The specialized agent to run."
    )
    parser.add_argument(
        "--prompt", 
        type=str, 
        help="A single prompt to send to the agent. If omitted, starts an interactive loop."
    )
    
    args = parser.parse_args()
    
    # Verify API key is available
    check_api_key()
    
    if args.prompt:
        asyncio.run(run_single_prompt(args.agent, args.prompt))
    else:
        asyncio.run(run_interactive(args.agent))

if __name__ == "__main__":
    main()
