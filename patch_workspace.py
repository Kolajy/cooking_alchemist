with open("web/src/game/canvas/workspace.ts", "r") as f:
    content = f.read()

# Let's fix up the simulated click since pointer events can be tricky with capture logic in this codebase.
content = content.replace('''      // Simulate click
      const fakeEvent = new PointerEvent("pointerdown", { bubbles: true });
      el.dispatchEvent(fakeEvent);
      // And we might want to also trigger pointerup for simple tap, but pointerdown already selects it or applies technique if it's the active element?
      // Actually pointerdown starts drag, we want a full click lifecycle.
      const fakeUpEvent = new PointerEvent("pointerup", { bubbles: true });
      el.dispatchEvent(fakeUpEvent);''', '''      // Use the actual apply technique if we hit enter, as that is the standard action
      import("../actions/toolbar").then(toolbar => {
        const wasApplied = toolbar.applyActiveTechniqueToCounter();
        if (!wasApplied) {
           // If we didn't apply technique, toggle selection maybe? The game relies on dragging,
           // but `applyActiveTechniqueToCounter` acts on ALL elements.
           // To keep it simple, space/enter applies the technique just like the global shortcut.
        }
      });''')

with open("web/src/game/canvas/workspace.ts", "w") as f:
    f.write(content)

print("workspace keyboard click patched")
