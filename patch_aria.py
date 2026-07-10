with open("web/src/index.html", "r") as f:
    content = f.read()

# Add aria-live to workspace hint
if 'id="workspace-hint"' not in content:
   content = content.replace('<div class="workspace-hint">', '<div id="workspace-hint" class="workspace-hint" aria-live="polite">')

# Action bar screen reader adjustments
# The action bar is dynamic, so let's make sure the container announces changes if needed,
# or just ensure roles are correct. The toolbar role was added in index.html already.

with open("web/src/index.html", "w") as f:
    f.write(content)

with open("web/src/game/canvas/workspace.ts", "r") as f:
    content = f.read()

# Add a live region update or just make sure workspace changes are somewhat announced if possible.
# Actually, visually hidden region for announcements is best.
if "aria-live" not in content:
    pass # we added it to the workspace-hint which is updated occasionally

with open("web/src/game/canvas/workspace.ts", "w") as f:
    f.write(content)

print("aria patched")
