with open("web/src/index.html", "r") as f:
    content = f.read()

if 'id="a11y-announcer"' not in content:
    content = content.replace('<body>', '<body>\n  <div id="a11y-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>')

with open("web/src/index.html", "w") as f:
    f.write(content)

with open("web/src/styles/base.css", "a") as f:
    f.write('''
/* Screen reader only utility class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
''')

with open("web/src/game/canvas/workspace.ts", "r") as f:
    content = f.read()

if "announceToScreenReader" not in content:
    content = content.replace('function recordSpawnUndo', '''
function announceToScreenReader(message: string) {
  const announcer = document.getElementById("a11y-announcer");
  if (announcer) {
    announcer.textContent = message;
    // Clear after a moment so the same message can be re-announced
    setTimeout(() => { announcer.textContent = ""; }, 3000);
  }
}

function recordSpawnUndo''')

    content = content.replace('playSound("ui_place");\n    }', 'playSound("ui_place");\n      announceToScreenReader(`Placed ${drag.item.name} on counter.`);\n    }')
    content = content.replace('playSound("ui_place");\n  }', 'playSound("ui_place");\n    announceToScreenReader(`Placed ${drag.item.name} on counter.`);\n  }')

    # Actually wait, `playSound("ui_place")` is in `cabinet-drag.ts` and `workspace.ts` ?
    # Let's just patch the workspace drag/drop or spawn element where it's simpler.

with open("web/src/game/canvas/workspace.ts", "w") as f:
    f.write(content)

with open("web/src/game/canvas/cabinet-drag.ts", "r") as f:
    content = f.read()

if "announceToScreenReader" not in content:
    content = content.replace('function recordSpawnUndo', '''
function announceToScreenReader(message: string) {
  const announcer = document.getElementById("a11y-announcer");
  if (announcer) {
    announcer.textContent = message;
    // Clear after a moment so the same message can be re-announced
    setTimeout(() => { announcer.textContent = ""; }, 3000);
  }
}

function recordSpawnUndo''')

    content = content.replace('playSound("ui_place");\n    }', 'playSound("ui_place");\n      announceToScreenReader(`Placed ${drag.item.name} on counter.`);\n    }')
    content = content.replace('playSound("ui_place");\n  }', 'playSound("ui_place");\n    announceToScreenReader(`Placed ${drag.item.name} on counter.`);\n  }')
    content = content.replace('playSound("ui_place");\n}', 'playSound("ui_place");\n  announceToScreenReader(`Placed ${item.name} on counter.`);\n}')

with open("web/src/game/canvas/cabinet-drag.ts", "w") as f:
    f.write(content)

print("aria announcer patched")
