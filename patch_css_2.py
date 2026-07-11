css_focus = '''
/* General accessible focus styles */
:focus-visible {
  outline: 3px solid var(--accent-amber);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 170, 0, 0.3);
}

/* For specific elements that might override it */
.alchemy-element:focus-visible {
  outline: 3px solid var(--accent-amber);
  outline-offset: 2px;
}
'''
with open("web/src/styles/base.css", "a") as f:
    f.write(css_focus)

print("base css patched")
