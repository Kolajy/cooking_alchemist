css_addition = '''
/* High Contrast Mode Adjustments */
html.high-contrast, html[data-contrast="high"] {
  --wood-700: #2a1f1a;
  --wood-800: #1a1310;
  --wood-900: #0d0a08;
  --stone-800: #1c1c1c;
  --stone-900: #0a0a0a;
  --text-primary: #ffffff;
  --text-muted: #e0e0e0;
  --primary-500: #ffaa00;
  --accent-amber: #ffcc00;
  --danger-500: #ff3333;
}

html.high-contrast body,
html.high-contrast .sidebar-cabinet,
html.high-contrast .dialog-content {
  background-color: var(--wood-900);
  border-color: #ffffff;
}

html.high-contrast * {
  text-shadow: none !important;
  box-shadow: none !important;
}

html.high-contrast .btn-primary {
  background: var(--primary-500);
  color: #000;
  border: 2px solid #fff;
}

html.high-contrast .btn-secondary {
  background: var(--stone-800);
  color: #fff;
  border: 2px solid #fff;
}

html.high-contrast .alchemy-element {
  border: 2px solid #fff;
  background: #000;
}

html.high-contrast :focus-visible {
  outline: 4px solid var(--accent-amber) !important;
  outline-offset: 2px !important;
}
'''

with open("web/src/styles/tokens.css", "a") as f:
    f.write(css_addition)

print("css patched")
