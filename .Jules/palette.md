## 2024-05-23 - [Accessibility & Feedback]
**Learning:** Dynamic content injection often misses basic accessibility associations (labels) and interaction feedback (loading states).
**Action:** Always verify that injected form elements have associated labels and that async actions provide immediate visual feedback (disabled state + text change).

## 2024-05-24 - [Keyboard Accessibility for Custom Controls]
**Learning:** `div` elements used as interactive controls are invisible to keyboard users and screen readers unless explicitly marked with `role="button"`, `tabindex="0"`, and keyboard event handlers.
**Action:** Always add semantic roles, tabindex, and `keydown` listeners (Enter/Space) when creating custom interactive elements from non-semantic tags.
