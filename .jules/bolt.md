## 2024-05-23 - Throttling Raycasting in Animation Loops
**Learning:** Moving expensive operations (like Raycasting) out of the animation loop to event handlers (like `mousemove`) is a common optimization, but it breaks interactivity for moving objects when the mouse is stationary.
**Action:** When objects in the scene are animated (e.g., orbiting), use **throttling** inside the animation loop (e.g., run every 3rd frame) instead of moving logic entirely to event handlers. This balances performance with correctness.

## 2024-05-24 - Batching Database Operations in Loops
**Learning:** Sequential `await` calls inside loops (N+1 problem) are a major bottleneck in backend logic, especially when multiple distinct operations (Insert, Update, Notification, Tracking) occur for each iteration.
**Action:** Collect data in the loop first, then execute operations in parallel using `Promise.all` or batch inserts. For operations like XP awarding that trigger side effects (leveling up), aggregate the value (sum XP) and execute a single update call.
