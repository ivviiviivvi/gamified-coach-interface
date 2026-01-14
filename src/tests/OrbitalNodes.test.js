import { describe, it, expect, vi } from 'vitest';
import { OrbitalNodes } from '../OrbitalNodes.js';

describe('OrbitalNodes', () => {
    it('should instantiate without crashing', () => {
        const mockScene = {
            add: vi.fn()
        };
        const mockStrategyCore = {};

        // This is expected to pass now
        const nodes = new OrbitalNodes(mockScene, mockStrategyCore);
        expect(nodes).toBeDefined();
        expect(nodes.nodes.length).toBeGreaterThan(0);
    });
});
