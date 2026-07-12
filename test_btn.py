with open("web/src/game/actions/toolbar.ts", "r") as f:
    content = f.read()

# Make sure buttons have aria-pressed when active and proper roles if missing
# They are standard buttons, so focus is native.
# Let's check for aria-pressed
if "btn.setAttribute(\"aria-pressed\", \"true\");" not in content:
   content = content.replace('if (isActive) btn.classList.add("active");', '''if (isActive) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }''')

with open("web/src/game/actions/toolbar.ts", "w") as f:
    f.write(content)
