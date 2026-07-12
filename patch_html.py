with open("web/src/index.html", "r") as f:
    content = f.read()

high_contrast_html = '''            <label class="settings-row" for="setting-high-contrast">
              <span class="settings-row__text">
                <span class="settings-row__label">High contrast</span>
                <span class="settings-row__hint">Increase contrast and visibility of text and elements</span>
              </span>
              <input
                id="setting-high-contrast"
                class="settings-toggle"
                type="checkbox"
                role="switch"
                aria-checked="false"
              >
            </label>
'''

if "setting-high-contrast" not in content:
    content = content.replace('''            <label class="settings-row" for="setting-reduced-motion">''', high_contrast_html + '''            <label class="settings-row" for="setting-reduced-motion">''')

with open("web/src/index.html", "w") as f:
    f.write(content)

print("html patched")
