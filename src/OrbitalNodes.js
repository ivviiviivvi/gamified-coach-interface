import * as THREE from 'three';

/**
 * OrbitalNodes - Interactive navigation spheres orbiting the Strategy Core
 */
export class OrbitalNodes {
    constructor(scene, strategyCore) {
        this.scene = scene;
        this.strategyCore = strategyCore;
        this.nodes = [];
        this.orbitRadius = 2.5;
        this.orbitSpeed = 0.3;
        this.activeNode = null;

        this.createNodes();
    }

    createNodes() {
        const nodeConfigs = [
            {
                id: 'target-analysis',
                label: 'TARGET ANALYSIS',
                color: 0x00ffff,
                position: 0
            },
            {
                id: 'intel-viz',
                label: 'INTEL VISUALIZATION',
                color: 0xff4f00,
                position: 1
            },
            {
                id: 'field-ops',
                label: 'FIELD OPERATIONS',
                color: 0x00ff88,
                position: 2
            },
            {
                id: 'training',
                label: 'TRAINING PROTOCOLS',
                color: 0x0088ff,
                position: 3
            },
            {
                id: 'archive',
                label: 'DATA ARCHIVE',
                color: 0x7a7a7a,
                position: 4
            }
        ];

        nodeConfigs.forEach(config => {
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: config.color,
                emissive: config.color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            });

            const node = new THREE.Mesh(geometry, material);
            node.userData = {
                id: config.id,
                label: config.label,
                position: config.position,
                baseColor: config.color
            };

            this.nodes.push(node);
            this.scene.add(node);

            // Add point light to each node for glow effect
            const light = new THREE.PointLight(config.color, 0.5, 2);
            node.add(light);
        });
    }

    update() {
        const time = Date.now() * 0.001;

        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * Math.PI * 2 + time * this.orbitSpeed;

            // Position nodes in orbit around core
            node.position.x = Math.cos(angle) * this.orbitRadius;
            node.position.z = Math.sin(angle) * this.orbitRadius;
            node.position.y = Math.sin(time * 0.5 + i) * 0.3;

            // Pulse effect
            const pulse = Math.sin(time * 2 + i) * 0.02 + 1;
            node.scale.setScalar(pulse);

            // Highlight active node
            if (this.activeNode === node.userData.id) {
                node.material.emissiveIntensity = 1.0;
                node.scale.setScalar(1.3);
            } else {
                node.material.emissiveIntensity = 0.5;
            }
        });
    }

    // Handle click detection with raycaster
    handleClick(raycaster, camera, mouse) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(this.nodes);

        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;
            this.activateNode(clickedNode.userData.id);
            return clickedNode.userData;
        }
        return null;
    }

    // Handle hover detection
    handleHover(raycaster, camera, mouse) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(this.nodes);

        // Reset all nodes
        this.nodes.forEach(node => {
            if (this.activeNode !== node.userData.id) {
                node.material.opacity = 0.9;
            }
        });

        // Highlight hovered node
        if (intersects.length > 0) {
            const hoveredNode = intersects[0].object;
            if (this.activeNode !== hoveredNode.userData.id) {
                hoveredNode.material.opacity = 1.0;
            }
            return hoveredNode.userData.id;
        }
        return null;
    }

    activateNode(nodeId) {
        this.activeNode = nodeId;

        // Emit custom event for UI layer
        window.dispatchEvent(new CustomEvent('node-activated', {
            detail: { nodeId }
        }));

        // Visual feedback
        const node = this.nodes.find(n => n.userData.id === nodeId);
        if (node) {
            // Flash effect
            node.material.emissiveIntensity = 2.0;
            setTimeout(() => {
                node.material.emissiveIntensity = 1.0;
            }, 200);
        }
    }

    deactivateNode() {
        this.activeNode = null;
    }

    // Get all node meshes for raycasting
    getNodes() {
        return this.nodes;
    }
}
