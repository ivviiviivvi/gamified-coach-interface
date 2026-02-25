## 2024-05-23 - Throttling Raycasting in Animation Loops
**Learning:** Moving expensive operations (like Raycasting) out of the animation loop to event handlers (like `mousemove`) is a common optimization, but it breaks interactivity for moving objects when the mouse is stationary.
**Action:** When objects in the scene are animated (e.g., orbiting), use **throttling** inside the animation loop (e.g., run every 3rd frame) instead of moving logic entirely to event handlers. This balances performance with correctness.

## 2024-05-24 - Allocation-Free Animation Loops
**Learning:** `forEach` and arrow functions in `requestAnimationFrame` create new closures every frame (60fps), causing unnecessary Garbage Collection (GC) pauses.
**Action:** Use standard `for` loops for iterating arrays in `update()` methods, and bind `animate` methods in the constructor to reuse the same function reference. This eliminates per-frame allocation overhead.
