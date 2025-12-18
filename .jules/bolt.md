## 2024-05-23 - [Frontend] Geometry Instantiation in Loops
**Learning:** Instantiating new Geometries (like `THREE.SphereGeometry`) inside a loop for identical objects creates unnecessary GPU memory allocation and overhead.
**Action:** Always instantiate shared geometries and materials outside of loops and reuse them for multiple meshes, or use `InstancedMesh` for large numbers of objects.
