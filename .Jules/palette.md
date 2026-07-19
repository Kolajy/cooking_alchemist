## 2023-10-27 - Hiding Emojis in Buttons
**Learning:** Decorative emojis placed next to textual labels in buttons or lists will be read aloud by screen readers (e.g. "smiling face with open mouth"). This creates unnecessary cognitive load when the textual label is sufficient.
**Action:** Always add `aria-hidden="true"` to wrapper elements (like spans) that contain purely decorative or illustrative emojis when placed directly next to their textual counterparts.
## 2024-03-24 - Accessibility for Decorative Icons
**Learning:** Decorative emojis used in buttons or dynamically generated skill/recipe lists are aggressively read out by screen readers (e.g. reading "frying pan" instead of just "Start New"), severely degrading the experience.
**Action:** Always wrap decorative emojis in a `span` with `aria-hidden="true"`, ensuring `textContent` updates explicitly target adjacent text nodes to preserve XSS safety while hiding the visual embellishments.
