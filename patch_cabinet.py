with open("web/src/game/cabinet.ts", "r") as f:
    content = f.read()

# Make cabinet item focusable
if 'el.setAttribute("tabindex", "0");' not in content:
    content = content.replace('el.setAttribute("role", "listitem");', 'el.setAttribute("role", "listitem");\n    el.setAttribute("tabindex", "0");')

# Let's fix the keyboard handling to not use fake pointer events
content = content.replace('''el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCabinetItemKeyboardSpawn(item);
      }
    });''', '')

if "handleCabinetItemKeyboardSpawn" not in content:
   content = content.replace('import { onCabinetPointerDown, handleCabinetItemKeyboardSpawn } from "./canvas/cabinet-drag";', 'import { onCabinetPointerDown, handleCabinetItemKeyboardSpawn } from "./canvas/cabinet-drag";')

content = content.replace('el.addEventListener("pointerdown", onCabinetPointerDown);', '''el.addEventListener("pointerdown", onCabinetPointerDown);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCabinetItemKeyboardSpawn(item);
      }
    });''')

with open("web/src/game/cabinet.ts", "w") as f:
    f.write(content)

with open("web/src/game/canvas/cabinet-drag.ts", "r") as f:
    content = f.read()

if "export function handleCabinetItemKeyboardSpawn" not in content:
    content += '''
export function handleCabinetItemKeyboardSpawn(item: any) {
  const { state } = getCtx();
  if (state.activeMainView === "map") switchMainView("cook");

  const element = spawnElementOnCanvas(item);
  recordSpawnUndo(item, element);
  playSound("ui_place");
}
'''
with open("web/src/game/canvas/cabinet-drag.ts", "w") as f:
    f.write(content)
