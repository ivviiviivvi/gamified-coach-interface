## 2024-05-23 - Throttling Raycasting in Animation Loops
**Learning:** Moving expensive operations (like Raycasting) out of the animation loop to event handlers (like `mousemove`) is a common optimization, but it breaks interactivity for moving objects when the mouse is stationary.
**Action:** When objects in the scene are animated (e.g., orbiting), use **throttling** inside the animation loop (e.g., run every 3rd frame) instead of moving logic entirely to event handlers. This balances performance with correctness.
