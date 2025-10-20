import { describe, test, expect } from 'vitest';
import { easeInOutCubic } from '../../../../src/lib/utils/math/easeInOutCubic';

describe('easeInOutCubic', () => {
	test('should return 0 for input 0 (start of the transition)', () => {
		expect(easeInOutCubic(0)).toBe(0);
	});

	test('should return 1 for input 1 (end of the transition)', () => {
		expect(easeInOutCubic(1)).toBe(1);
	});

	test('should return 0.5 for input 0.5 (midpoint of the transition)', () => {
		expect(easeInOutCubic(0.5)).toBe(0.5);
	});

	test('should correctly calculate a value in the "ease-in" part (< 0.5)', () => {
		const input = 0.25;
		const expected = 0.0625; // Calculation: 4 * 0.25^3
		expect(easeInOutCubic(input)).toBeCloseTo(expected);
	});

	test('should correctly calculate a value in the "ease-out" part (> 0.5)', () => {
		const input = 0.75;
		const expected = 0.9375; // Calculation: 1 - ((-2 * 0.75 + 2)^3) / 2
		expect(easeInOutCubic(input)).toBeCloseTo(expected);
	});

	test('should handle values less than 0', () => {
		expect(easeInOutCubic(-1)).toBe(-4);
	});

	test('should handle values greater than 1', () => {
		expect(easeInOutCubic(2)).toBe(5);
	});
});