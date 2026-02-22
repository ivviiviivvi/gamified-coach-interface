## 2024-05-23 - [Accessibility & Feedback]
**Learning:** Dynamic content injection often misses basic accessibility associations (labels) and interaction feedback (loading states).
**Action:** Always verify that injected form elements have associated labels and that async actions provide immediate visual feedback (disabled state + text change).

## 2024-05-24 - [Keyboard Accessibility for Custom Controls]
**Learning:** `div` elements used as interactive controls are invisible to keyboard users and screen readers unless explicitly marked with `role="button"`, `tabindex="0"`, and keyboard event handlers.
**Action:** Always add semantic roles, tabindex, and `keydown` listeners (Enter/Space) when creating custom interactive elements from non-semantic tags.

## 2024-05-25 - [Modal Focus Management]
**Learning:** Modals triggered by buttons must manage focus explicitly: move focus into the modal on open, and restore it to the trigger on close, or the keyboard navigation flow is broken.
**Action:** Store `document.activeElement` before opening a modal, focus a close button/first input inside, and restore focus on close.

## 2026-01-16 - [Dynamic Accessibility & Fallbacks]
**Learning:** Dynamic content updates (like progress bars) need ARIA attributes (`aria-valuenow`) updated in real-time to be accessible. Also, core UI interactions should not depend on non-essential 3D components (SceneManager) initializing successfully.
**Action:** Use `role="progressbar"` with dynamic `aria-valuenow` updates. Wrap fragile 3D/graphics initialization in try-catch blocks to ensure the core UI remains usable if they fail (e.g. in headless environments).
