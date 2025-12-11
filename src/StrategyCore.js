import * as THREE from 'three';

/**
 * StrategyCore - Central 3D holographic object
 * Represents the AI intelligence core with reactive states
 */
export class StrategyCore {
    constructor(scene) {
        this.scene = scene;
        this.state = 'idle'; // 'idle' | 'analyzing' | 'glitching' | 'success'
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.originalPositions = null;

        this.initGeometry();
        this.initMaterial();
        this.initMesh();
    }

    initGeometry() {
        // Low-poly icosahedron for performance
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
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }

    // Called every frame from main animation loop
    update(deltaTime) {
        const time = Date.now() * 0.001;

        // Idle state: slow, elegant rotation
        if (this.state === 'idle') {
            this.mesh.rotation.y += 0.003;
            this.mesh.rotation.x += 0.001;
        }

        // Analyzing state: pulsing scale and increased emissive
        if (this.state === 'analyzing') {
            const pulse = Math.sin(time * 3) * 0.1 + 1;
            this.mesh.scale.setScalar(pulse);
            this.material.emissiveIntensity = 0.4 + Math.sin(time * 5) * 0.2;
            this.mesh.rotation.y += 0.01;
        }

        // Glitching state: vertex distortion
        if (this.state === 'glitching') {
            this.applyGlitchEffect();
            this.mesh.rotation.y += 0.02;
            this.mesh.rotation.x += 0.01;
        }

        // Success state: smooth return to idle
        if (this.state === 'success') {
            this.smoothReturnToIdle();
        }
    }

    // Triggered when AI analysis starts
    enterAnalysisMode() {
        this.state = 'analyzing';
        this.material.emissiveIntensity = 0.8;
        this.material.emissive.setHex(0x00ffff);
    }

    // Triggered during AI processing
    enterGlitchMode() {
        this.state = 'glitching';
        this.material.emissive.setHex(0xff4f00); // Orange
    }

    // Apply glitch effect to vertices
    applyGlitchEffect() {
        const positions = this.geometry.attributes.position.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
            // Add noise to vertex positions
            const offset = Math.sin(time * 10 + i) * 0.05;
            positions[i] = this.originalPositions[i] + offset;
            positions[i + 1] = this.originalPositions[i + 1] + offset;
            positions[i + 2] = this.originalPositions[i + 2] + offset;
        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    // Triggered when AI returns success
    enterSuccessMode() {
        this.state = 'success';
        this.material.emissive.setHex(0x00ff88); // Green
        this.material.emissiveIntensity = 1.0;

        // Flash effect then return to idle
        setTimeout(() => {
            this.returnToIdle();
        }, 1500);
    }

    returnToIdle() {
        this.state = 'idle';
        this.material.emissive.setHex(0x00ffff);
        this.material.emissiveIntensity = 0.2;
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

    // Get mesh for raycasting
    getMesh() {
        return this.mesh;
    }
}
