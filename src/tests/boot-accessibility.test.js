
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

/** @vitest-environment jsdom */

describe('Boot Screen Accessibility', () => {
    let dom;

    beforeEach(() => {
        // Load the HTML file content
        const html = fs.readFileSync(path.resolve(__dirname, '../../legion-v3.html'), 'utf8');
        document.documentElement.innerHTML = html;

        // Mock the SceneManager since we're only testing DOM/Accessibility
        vi.mock('../SceneManager.js', () => ({
            SceneManager: class {
                constructor() {}
            }
        }));
    });

    it('should have a progress bar with correct aria attributes', () => {
        const progressBarContainer = document.querySelector('.boot-progress');
        expect(progressBarContainer).not.toBeNull();

        // Check for accessibility attributes that SHOULD be there (this test is expected to fail initially)
        expect(progressBarContainer.getAttribute('role')).toBe('progressbar');
        expect(progressBarContainer.getAttribute('aria-label')).toBe('System Boot Progress');
        expect(progressBarContainer.getAttribute('aria-valuemin')).toBe('0');
        expect(progressBarContainer.getAttribute('aria-valuemax')).toBe('100');
        expect(progressBarContainer.hasAttribute('aria-valuenow')).toBe(true);
    });
});
