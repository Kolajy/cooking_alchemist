with open("web/src/game/canvas/workspace.ts", "r") as f:
    content = f.read()

# I did add focusNextCanvasElement in python string format, but let's double check if it was appended correctly
import re

if "export function focusNextCanvasElement" not in content:
    content += '''
export function focusNextCanvasElement(currentEl, dir) {
  const { state } = getCtx();
  const els = state.activeElements;
  if (!els || els.length === 0) return;

  const idx = els.indexOf(currentEl);
  if (idx === -1) return;

  let nextIdx = idx + dir;
  if (nextIdx >= els.length) nextIdx = 0;
  if (nextIdx < 0) nextIdx = els.length - 1;

  els[nextIdx].focus();
}
'''
    with open("web/src/game/canvas/workspace.ts", "w") as f:
        f.write(content)
    print("Fixed workspace arrow keys - function was missing.")
else:
    print("Function focusNextCanvasElement is already there, maybe the reviewer missed it or it wasn't exported correctly?")
