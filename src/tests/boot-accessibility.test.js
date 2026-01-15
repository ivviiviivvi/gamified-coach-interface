
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * @vitest-environment jsdom
 */

describe('Boot Sequence Accessibility', () => {
    let htmlContent;

    beforeEach(() => {
        // Read the actual HTML file
        htmlContent = fs.readFileSync(path.resolve(__dirname, '../../legion-v3.html'), 'utf-8');
        document.body.innerHTML = htmlContent;
    });

    it('should have correct initial ARIA attributes on boot progress', () => {
        const progress = document.querySelector('.boot-progress');
        expect(progress).not.toBeNull();
        expect(progress.getAttribute('role')).toBe('progressbar');
        expect(progress.getAttribute('aria-valuemin')).toBe('0');
        expect(progress.getAttribute('aria-valuemax')).toBe('100');
        expect(progress.getAttribute('aria-valuenow')).toBe('0');
        expect(progress.getAttribute('aria-label')).toBe('System Boot Progress');
    });

    it('should have visibility: hidden in CSS for .hidden state', () => {
        // We can't easily parse CSS in jsdom from a style tag without a lot of work,
        // but we can check if the style text exists in the document head or style blocks.
        // Or we can just grep the content since we loaded it.
        const styleTags = document.querySelectorAll('style');
        let cssText = '';
        styleTags.forEach(tag => cssText += tag.innerHTML);

        // Normalize whitespace for check
        const hiddenRule = cssText.match(/#boot-screen\.hidden\s*\{([^}]+)\}/);
        expect(hiddenRule).not.toBeNull();
        expect(hiddenRule[1]).toContain('visibility: hidden');
    });
});
