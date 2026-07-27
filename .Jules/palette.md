## 2023-10-27 - Hiding Emojis in Buttons
**Learning:** Decorative emojis placed next to textual labels in buttons or lists will be read aloud by screen readers (e.g. "smiling face with open mouth"). This creates unnecessary cognitive load when the textual label is sufficient.
**Action:** Always add `aria-hidden="true"` to wrapper elements (like spans) that contain purely decorative or illustrative emojis when placed directly next to their textual counterparts.
## 2024-03-24 - Accessibility for Decorative Icons
**Learning:** Decorative emojis used in buttons or dynamically generated skill/recipe lists are aggressively read out by screen readers (e.g. reading "frying pan" instead of just "Start New"), severely degrading the experience.
**Action:** Always wrap decorative emojis in a `span` with `aria-hidden="true"`, ensuring `textContent` updates explicitly target adjacent text nodes to preserve XSS safety while hiding the visual embellishments.
## 2026-07-20 - Dynamic Text Replacement Destroying ARIA Tags
**Learning:** Dynamically updating text content using `element.textContent = '...'` on a parent element will destroy any internal child nodes, including spans carrying critical accessibility attributes like `aria-hidden='true'`.
**Action:** When updating text on elements containing decorative emojis, use `replaceChildren(emojiSpan, document.createTextNode(...))` or similar safe DOM manipulation methods to ensure the textual content is updated while preserving the `aria-hidden` span around the emoji.

## 2026-07-27 - Autocomplete Interaction Prevention
**Learning:** When implementing search suggestions, a user clicking a suggestion will trigger the input's `blur` event before the suggestion's `click` event. If the `blur` event destroys the suggestion nodes, the click is lost.
**Action:** Always use `mousedown` and `e.preventDefault()` on clickable suggestion elements to prevent the input from losing focus prematurely.
