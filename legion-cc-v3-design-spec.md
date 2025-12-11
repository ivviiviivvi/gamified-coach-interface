# LEGION COMMAND CENTER V3: Design Specification
**[LCC-V3-SPEC-20251106]**

---

## TL;DR: Vision Statement

Legion Command Center V3 transforms from a "retro pixel RPG tool" into a **classified government data analysis system** for fitness entrepreneurs. Drawing aesthetic inspiration from Kanye2049's neo-brutalist, holographic interface, V3 reframes the user as a **Commander accessing strategic intelligence** through a cinematic, 3D experience—while maintaining all the functional AI-powered strategy generation capabilities of V2.

**Core Narrative Shift:**
- **V2:** "I'm using a gamified tool to build my business"
- **V3:** "I'm an operative commanding a high-tech strategic operations center"

---

## [1.0] PROJECT OVERVIEW

### 1.1 Project Evolution Timeline

| Version | Theme | Core Tech | Status |
|---------|-------|-----------|--------|
| **V1** | Minimal research documents | Static HTML reports | ✅ Complete |
| **V2** | Retro pixel RPG (Final Fantasy) | Vanilla JS + Gemini API | ✅ Functional, needs refactor |
| **V3** | Neo-brutalist holographic (Blade Runner 2049) | Three.js + Gemini API + GLSL | 🚧 This Specification |

### 1.2 Design Inspiration: Kanye2049 → Legion CC Translation

| Kanye2049 Element | Legion CC V3 Application |
|-------------------|-------------------------|
| POTUS OS (2049 government interface) | LEGION OS (fitness empire command center) |
| "Artifact" containing leaked album | "Strategy Core" containing business intelligence |
| Audio-reactive 3D distortion | API-reactive 3D morphing (Gemini calls cause glitching) |
| Holographic data packets (climate lore) | Holographic intel briefs (AI-generated strategy) |
| Password: "greatest album of all time" | Password: "greatest transformation" |
| Solution nodes (climate action links) | Strategy nodes (implementation checklists) |

### 1.3 Primary Objectives

1. **Narrative Immersion:** Make the user feel like a Commander accessing classified AI intelligence
2. **Aesthetic Modernization:** Evolve from 2D pixel art to 3D holographic interface
3. **Functional Preservation:** Maintain all 7 AI strategy terminals from V2
4. **Performance:** Ensure 60fps on desktop, graceful degradation on mobile

### 1.4 Target Audience

- **Primary:** Rob (the specific fitness entrepreneur this was built for)
- **Secondary:** Creative developers who appreciate immersive UX design
- **Tertiary:** Future fitness coaches who license the system

---

## [2.0] INFORMATION ARCHITECTURE

### 2.1 Scene-Based Navigation Flow

**Linear Progression (First Visit):**
```
Scene 1: Boot Screen
    ↓
Scene 2: Holographic Login
    ↓
Scene 3: Data Hub (Main Interface)
    ↓
Scene 4: Terminal Analysis (Strategy Generation)
    ↓
Scene 5: Strategy Forged (Success State)
```

**Hub-Based Navigation (Returning User):**
```
Data Hub (Central 3D Strategy Core)
    ├─ NODE 01: Target Analysis (Strategy Forge)
    ├─ NODE 02: Intel Visualization (Intel Map)
    ├─ NODE 03: Field Operations (Dashboard)
    ├─ NODE 04: Training Protocols (Training Sim)
    └─ NODE 05: Data Archive (Field Manual)
```

### 2.2 Module Mapping: V2 → V3

| V2 Module | V3 Designation | 3D Representation |
|-----------|----------------|-------------------|
| Dashboard | **FIELD OPERATIONS** | Green orbital node |
| Strategy Forge | **TARGET ANALYSIS** | Cyan orbital node (primary) |
| Intel Map | **INTEL VISUALIZATION** | Orange orbital node |
| Training Sim | **TRAINING PROTOCOLS** | Blue orbital node |
| Field Manual | **DATA ARCHIVE** | Grey orbital node |

---

## [3.0] VISUAL DESIGN SYSTEM

### 3.1 Color Palette (Kanye2049 Derived)

```css
:root {
  /* Base Tones (Neo-Brutalist Concrete) */
  --deep-charcoal: #1a1a1a;
  --pure-black: #000000;
  --concrete-grey: #7a7a7a;
  --muted-grey: #5a5a5a;

  /* Holographic Accents */
  --electric-cyan: #00FFFF;
  --warning-orange: #FF4F00;
  --success-green: #00FF88;
  --danger-red: #FF0033;

  /* Opacity Layers */
  --hologram-alpha: rgba(0, 255, 255, 0.1);
  --overlay-alpha: rgba(0, 0, 0, 0.7);
}
```

**Usage Guidelines:**
- **Backgrounds:** Deep charcoal (#1a1a1a) for main areas, pure black (#000000) for voids
- **Primary Interactive Elements:** Electric cyan (#00FFFF)
- **Warning/Attention States:** Warning orange (#FF4F00)
- **Success States:** Success green (#00FF88)
- **3D Materials:** Concrete grey (#7a7a7a) base with cyan/orange emissive

### 3.2 Typography System

```css
/* Headings & Critical UI */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

h1, h2, .system-text {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: clamp(1.5rem, 5vw, 3rem);
}

/* Data Display & Terminal Text */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');

.terminal-text, .data-packet {
  font-family: 'Roboto Mono', monospace;
  font-weight: 400;
  letter-spacing: 0.05em;
  font-size: clamp(0.875rem, 2vw, 1rem);
}
```

**Rationale:** 
- Inter = modern, geometric, wide-tracked (official government feel)
- Roboto Mono = raw data, terminal output (technical intelligence feel)

### 3.3 UI Component Library

#### 3.3.1 Holographic Input Field

```html
<div class="hologram-input-container">
  <label class="hologram-label">ENTER TARGET PARAMETERS</label>
  <input type="text" class="hologram-input" placeholder="CLASSIFIED_">
  <div class="hologram-border"></div>
</div>
```

```css
.hologram-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--electric-cyan);
  color: var(--electric-cyan);
  font-family: 'Roboto Mono', monospace;
  padding: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
  transition: all 0.3s;
}

.hologram-input:focus {
  outline: none;
  box-shadow: 
    0 4px 30px rgba(0, 255, 255, 0.4),
    0 -2px 10px rgba(0, 255, 255, 0.2);
  animation: hologram-flicker 0.1s infinite;
}

@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.97; }
}
```

#### 3.3.2 Holographic Button (CTA)

```html
<button class="hologram-button" data-action="analyze">
  <span class="button-text">INITIATE ANALYSIS</span>
  <span class="button-glow"></span>
</button>
```

```css
.hologram-button {
  position: relative;
  background: transparent;
  border: 2px solid var(--electric-cyan);
  color: var(--electric-cyan);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  padding: 1rem 2rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.hologram-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.hologram-button:hover::before {
  left: 100%;
}

.hologram-button:hover {
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.6),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
  transform: translateY(-2px);
}

.hologram-button:active {
  transform: translateY(0);
}
```

#### 3.3.3 Data Packet (Floating Result Container)

```html
<div class="data-packet" data-type="intel">
  <div class="packet-header">
    <span class="packet-id">INTEL-047</span>
    <span class="packet-timestamp">2025.11.06 14:32:09</span>
  </div>
  <div class="packet-content">
    Target Avatar: High-stress tech workers...
  </div>
</div>
```

```css
.data-packet {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid var(--electric-cyan);
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
  animation: packet-materialize 0.5s ease-out;
}

@keyframes packet-materialize {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.packet-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  color: var(--electric-cyan);
  opacity: 0.7;
}

.packet-content {
  font-family: 'Roboto Mono', monospace;
  line-height: 1.8;
  color: var(--concrete-grey);
}
```

---

## [4.0] THREE.JS SCENE ARCHITECTURE

### 4.1 Scene Hierarchy

```
Scene Root
├─ Camera (PerspectiveCamera, FOV 50)
├─ Lighting Rig
│   ├─ KeyLight (Directional, cyan, intensity 1)
│   ├─ FillLight (Directional, orange, intensity 0.3)
│   └─ AmbientLight (grey, intensity 0.1)
├─ Strategy Core (Central 3D Object)
│   ├─ Geometry: IcosahedronGeometry (low-poly)
│   ├─ Material: MeshStandardMaterial (metallic, emissive)
│   └─ Behavior: Slow rotation, API-reactive distortion
├─ Orbital Nodes (5 Interactive Spheres)
│   ├─ Node 01: Target Analysis (Cyan)
│   ├─ Node 02: Intel Visualization (Orange)
│   ├─ Node 03: Field Operations (Green)
│   ├─ Node 04: Training Protocols (Blue)
│   └─ Node 05: Data Archive (Grey)
└─ Environment
    ├─ Fog (subtle depth, color: black)
    └─ Particle System (optional starfield)
```

### 4.2 Strategy Core: Technical Specification

```javascript
// strategy-core.js
import * as THREE from 'three';

export class StrategyCore {
  constructor(scene) {
    this.scene = scene;
    this.initGeometry();
    this.initMaterial();
    this.initMesh();
    this.state = 'idle'; // 'idle' | 'analyzing' | 'glitching' | 'success'
  }

  initGeometry() {
    // Low-poly for performance
    this.geometry = new THREE.IcosahedronGeometry(1, 1);
    
    // Store original vertex positions for morphing
    this.originalPositions = new Float32Array(
      this.geometry.attributes.position.array
    );
  }

  initMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x7a7a7a,        // Concrete grey
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00ffff,     // Cyan glow
      emissiveIntensity: 0.2,
      wireframe: false
    });
  }

  initMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  // Called every frame
  update(deltaTime) {
    // Idle state: slow, elegant rotation
    if (this.state === 'idle') {
      this.mesh.rotation.y += 0.003;
      this.mesh.rotation.x += 0.001;
    }

    // Analyzing state: pulsing scale
    if (this.state === 'analyzing') {
      const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1;
      this.mesh.scale.setScalar(pulse);
      this.material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.005) * 0.2;
    }

    // Glitching state: vertex distortion
    if (this.state === 'glitching') {
      this.applyGlitchEffect();
    }

    // Success state: smooth return to idle
    if (this.state === 'success') {
      this.smoothReturnToIdle();
    }
  }

  // Triggered when Gemini API call starts
  enterAnalysisMode() {
    this.state = 'analyzing';
    this.material.emissiveIntensity = 0.8;
    this.material.emissive.setHex(0x00ffff);
  }

  // Triggered during API processing (shows "thinking")
  applyGlitchEffect() {
    const positions = this.geometry.attributes.position.array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < positions.length; i += 3) {
      // Add noise to vertex positions
      const offset = Math.sin(time + i) * 0.05;
      positions[i] = this.originalPositions[i] + offset;
      positions[i + 1] = this.originalPositions[i + 1] + offset;
      positions[i + 2] = this.originalPositions[i + 2] + offset;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  // Triggered when API returns success
  enterSuccessMode() {
    this.state = 'success';
    this.material.emissive.setHex(0x00ff88); // Green
    this.material.emissiveIntensity = 1.0;

    // Flash effect
    setTimeout(() => {
      this.state = 'idle';
      this.material.emissive.setHex(0x00ffff);
      this.material.emissiveIntensity = 0.2;
    }, 1500);
  }

  smoothReturnToIdle() {
    // Restore original geometry
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i++) {
      positions[i] = THREE.MathUtils.lerp(
        positions[i],
        this.originalPositions[i],
        0.1
      );
    }
    this.geometry.attributes.position.needsUpdate = true;

    // Restore scale
    const targetScale = 1.0;
    this.mesh.scale.x = THREE.MathUtils.lerp(this.mesh.scale.x, targetScale, 0.1);
    this.mesh.scale.y = THREE.MathUtils.lerp(this.mesh.scale.y, targetScale, 0.1);
    this.mesh.scale.z = THREE.MathUtils.lerp(this.mesh.scale.z, targetScale, 0.1);
  }
}
```

### 4.3 Orbital Nodes: Interactive System

```javascript
// orbital-nodes.js
export class OrbitalNodes {
  constructor(scene, strategyCore) {
    this.scene = scene;
    this.strategyCore = strategyCore;
    this.nodes = [];
    this.createNodes();
  }

  createNodes() {
    const nodeConfigs = [
      { id: 'target-analysis', color: 0x00ffff, position: 0 },
      { id: 'intel-viz', color: 0xff4f00, position: 1 },
      { id: 'field-ops', color: 0x00ff88, position: 2 },
      { id: 'training', color: 0x0088ff, position: 3 },
      { id: 'archive', color: 0x7a7a7a, position: 4 }
    ];

    nodeConfigs.forEach(config => {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.5
      });
      
      const node = new THREE.Mesh(geometry, material);
      node.userData = { id: config.id, position: config.position };
      
      this.nodes.push(node);
      this.scene.add(node);
    });
  }

  update() {
    const time = Date.now() * 0.001;
    const radius = 2.5;

    this.nodes.forEach((node, i) => {
      const angle = (i / 5) * Math.PI * 2 + time * 0.3;
      node.position.x = Math.cos(angle) * radius;
      node.position.z = Math.sin(angle) * radius;
      node.position.y = Math.sin(time * 0.5 + i) * 0.3;

      // Pulse effect
      const pulse = Math.sin(time * 2 + i) * 0.02 + 1;
      node.scale.setScalar(pulse);
    });
  }

  // Raycast-based click detection
  handleClick(raycaster, camera) {
    const intersects = raycaster.intersectObjects(this.nodes);
    if (intersects.length > 0) {
      const clickedNode = intersects[0].object;
      this.activateNode(clickedNode.userData.id);
    }
  }

  activateNode(nodeId) {
    // Emit event for UI layer to handle
    window.dispatchEvent(new CustomEvent('node-activated', {
      detail: { nodeId }
    }));

    // Visual feedback: highlight the node
    const node = this.nodes.find(n => n.userData.id === nodeId);
    node.material.emissiveIntensity = 1.5