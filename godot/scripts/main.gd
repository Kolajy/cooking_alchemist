extends Node

func _ready():
	print("--- Culinary Alchemist: Launching Native Client ---")
	# Ensure Database is fully loaded
	if Database.discoverable_items.size() > 0:
		print("✅ Database verification passed.")
		print("   Total Discoverables: ", Database.discoverable_items.size())
		print("   Total Starters: ", Database.starters.size())
		print("   Total Transitions: ", Database.transitions.size())
		print("   Player Ledger Progress: ", GameState.get_restored_percentage(), "%")
	else:
		print("❌ Database verification failed. No items loaded.")
