import { describe, it, expect } from 'vitest';
import { generateRandomColor, normalizeColor } from '../../../../src/lib/utils/ol/color';

describe('ol color utils', () => {
    describe('generateRandomColor', () => {
        it('should return a valid hex color string', () => {
            const color = generateRandomColor();
            expect(color).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('should generate different colors on multiple calls', () => {
            const color1 = generateRandomColor();
            const color2 = generateRandomColor();
            // There's a tiny chance they are equal, but practically they should be different
            expect(color1).not.toBe(color2);
        });
    });

    describe('normalizeColor', () => {
        it('should return string input as-is', () => {
            expect(normalizeColor('#ff0000')).toBe('#ff0000');
            expect(normalizeColor('rgba(255,0,0,1)')).toBe('rgba(255,0,0,1)');
        });

        it('should convert array [r, g, b, a] to rgba string', () => {
            const color: [number, number, number, number] = [255, 0, 0, 255];
            // The implementation divides alpha by 255
            expect(normalizeColor(color)).toBe('rgba(255, 0, 0, 1)');
        });

        it('should handle partial alpha', () => {
            const color: [number, number, number, number] = [0, 255, 0, 127.5];
            expect(normalizeColor(color)).toBe('rgba(0, 255, 0, 0.5)');
        });
    });
});
