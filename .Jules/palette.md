## 2024-08-08 - Icon-Only Button Tooltips
**Learning:** Icon-only buttons with `aria-label` are accessible to screen readers, but sighted users lack context on hover. Browsers don't display `aria-label` as tooltips.
**Action:** Always pair `aria-label` with `title` on icon-only buttons unless a custom HTML tooltip is implemented.

## 2024-08-08 - Icon-Only Button Tooltips
**Learning:** Icon-only buttons with `aria-label` are accessible to screen readers, but sighted users lack context on hover. Browsers don't display `aria-label` as tooltips.
**Action:** Always pair `aria-label` with `title` on icon-only buttons unless a custom HTML tooltip is implemented.

## 2024-08-08 - Icon-Only Button Tooltips
**Learning:** Icon-only buttons with `aria-label` are accessible to screen readers, but sighted users lack context on hover. Browsers don't display `aria-label` as tooltips.
**Action:** Always pair `aria-label` with `title` on icon-only buttons unless a custom HTML tooltip is implemented.

## 2023-10-25 - [Accessible Tri-State Buttons]
**Learning:** For tri-state filter buttons (e.g., neutral, include, exclude), relying solely on `aria-pressed="true"` does not sufficiently distinguish between modes. The screen reader will just announce "pressed" without context on what the press signifies. Also, dynamically changing `aria-label`s on icon-only buttons can destroy their accessible names when returning to neutral state if you don't preserve the original name.
**Action:** Dynamically update the `aria-label` and `title` to explicitly describe the state (e.g., 'Include [Name]', 'Exclude [Name]') and preserve existing accessible labels when the button lacks text content.
## 2024-12-04 - [Custom Dialogs over Native Alerts]
**Learning:** Avoid using native browser `alert()` or `confirm()` calls for displaying errors or feedback as they block the main thread, break immersion, and are generally poor for accessibility/UX.
**Action:** Prefer the application's custom UI dialogs (like `showCustomAlert()` from `web/src/game/ui/dialogs.ts`) for user feedback.
## 2026-10-18 - Accessible Locked Buttons
**Learning:** Locked game actions that provide hints on click cannot use the native `disabled` attribute, as it prevents focus and click events. This causes screen readers to miss the locked context completely.
**Action:** Use `aria-disabled="true"` for locked buttons that still need to receive pointer/keyboard events to show hints or play sounds.
