
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Terminal Card Accessibility', () => {
    const htmlContent = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    it('should have role="button" on terminal cards', () => {
        const cards = document.querySelectorAll('.terminal-card');
        expect(cards.length).toBeGreaterThan(0);
        cards.forEach(card => {
            expect(card.getAttribute('role')).toBe('button');
        });
    });

    it('should have tabindex="0" on terminal cards', () => {
        const cards = document.querySelectorAll('.terminal-card');
        expect(cards.length).toBeGreaterThan(0);
        cards.forEach(card => {
            expect(card.getAttribute('tabindex')).toBe('0');
        });
    });
});
