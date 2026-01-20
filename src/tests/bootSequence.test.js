
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock SceneManager
vi.mock('../SceneManager.js', () => {
  return {
    SceneManager: class {
      constructor() {}
      getOrbitalNodes() { return { deactivateNode: vi.fn() }; }
      setCoreStat() {}
    }
  };
});

describe('LegionCommandCenter Boot Sequence', () => {
    let mockBootBar;
    let mockBootScreen;
    let mockBootProgressContainer;

    beforeEach(() => {
        // Mock DOM elements
        mockBootBar = { style: { width: '0%' } };
        mockBootScreen = { classList: { add: vi.fn() } };
        mockBootProgressContainer = { setAttribute: vi.fn() };

        // Mock global document and window
        global.document = {
            getElementById: vi.fn((id) => {
                if (id === 'boot-bar') return mockBootBar;
                if (id === 'boot-screen') return mockBootScreen;
                if (id === 'boot-progress-container') return mockBootProgressContainer;
                return { addEventListener: vi.fn() };
            }),
            addEventListener: vi.fn(), // Catch the DOMContentLoaded listener
            querySelectorAll: vi.fn(() => []),
            activeElement: null
        };

        global.window = {
            addEventListener: vi.fn(),
            localStorage: { getItem: vi.fn() },
            innerWidth: 1024,
            innerHeight: 768
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.document;
        delete global.window;
        vi.resetModules();
    });

    it('should update aria-valuenow on boot progress container', async () => {
        vi.useFakeTimers();

        // Dynamic import to ensure globals are set before module evaluation
        const { LegionCommandCenter } = await import('../main.js');

        const app = new LegionCommandCenter();

        // Advance timers to trigger interval updates
        // The interval is 200ms. It adds 0-15%.
        // To reach 100%, it takes roughly 7-10 steps.
        // 200ms * 15 = 3000ms should be enough.
        await vi.advanceTimersByTimeAsync(3000);

        // Verify setAttribute was called with updated values
        // It starts at 0.
        // It updates multiple times.
        // We check if it was called at all.
        expect(mockBootProgressContainer.setAttribute).toHaveBeenCalled();

        // Check the last call arguments roughly
        // The logic sets it to Math.round(progress)
        // Since we mocked Math.random? No, we didn't mock Math.random.
        // But eventually it hits 100.

        expect(mockBootProgressContainer.setAttribute).toHaveBeenCalledWith('aria-valuenow', expect.any(Number));

        vi.useRealTimers();
    });
});
