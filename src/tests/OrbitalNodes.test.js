
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrbitalNodes } from '../OrbitalNodes.js';
import * as THREE from 'three';

// Mock THREE
vi.mock('three', () => {
  return {
    Scene: vi.fn(function() {
      return {
        add: vi.fn()
      };
    }),
    SphereGeometry: vi.fn(function() {}),
    MeshBasicMaterial: vi.fn(function() {
        return {
            color: {},
            emissive: {},
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        };
    }),
    Mesh: vi.fn(function() {
      return {
        position: { x: 0, y: 0, z: 0 },
        scale: { setScalar: vi.fn() },
        add: vi.fn(),
        userData: {},
        material: { emissiveIntensity: 0, opacity: 1.0 }
      };
    }),
    PointLight: vi.fn(function() {}),
    Raycaster: vi.fn(function() {}),
    Vector2: vi.fn(function() {})
  };
});

describe('OrbitalNodes', () => {
  let scene;
  let strategyCore;
  let orbitalNodes;

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();

    scene = new THREE.Scene();
    strategyCore = {};
    orbitalNodes = new OrbitalNodes(scene, strategyCore);
  });

  it('should create nodes on initialization', () => {
    expect(orbitalNodes.nodes.length).toBe(5);
    // 5 nodes are added to scene
    expect(scene.add).toHaveBeenCalledTimes(5);
  });

  it('should update node positions in update loop', () => {
    // Clear previous calls from constructor
    orbitalNodes.nodes.forEach(node => {
      node.scale.setScalar.mockClear();
    });

    orbitalNodes.update();

    // Check that properties were accessed/modified
    const node = orbitalNodes.nodes[0];
    expect(node.scale.setScalar).toHaveBeenCalled();
  });
});
