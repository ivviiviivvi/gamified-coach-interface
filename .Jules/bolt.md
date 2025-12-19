## 2024-05-23 - Duplicate Geometry Instantiation
**Learning:** Three.js applications should reuse Geometry (and Material) instances when possible. Instantiating a new `SphereGeometry` inside a loop for identical objects increases memory usage and setup time.
**Action:** Always verify if a geometry can be shared across multiple meshes before creating it. Use `clone()` or just pass the reference if the geometry is static.
