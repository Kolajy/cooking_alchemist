## 2023-10-27 - Hiding Emojis in Buttons
**Learning:** Decorative emojis placed next to textual labels in buttons or lists will be read aloud by screen readers (e.g. "smiling face with open mouth"). This creates unnecessary cognitive load when the textual label is sufficient.
**Action:** Always add `aria-hidden="true"` to wrapper elements (like spans) that contain purely decorative or illustrative emojis when placed directly next to their textual counterparts.
