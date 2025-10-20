import { describe, test, expect } from 'vitest';
import { hexToRgba } from '../../../../src/lib/utils/math/hexToRgba';

describe('hexToRgba', () => {
	test('should convert a 6-digit hex with # to an RGBA array with default alpha', () => {
		expect(hexToRgba('#ff0000')).toEqual([255, 0, 0, 255]);
	});

	test('should convert a 6-digit hex without # to an RGBA array', () => {
		expect(hexToRgba('00ff00')).toEqual([0, 255, 0, 255]);
	});

	test('should convert an 8-digit hex with # to an RGBA array including alpha', () => {
		expect(hexToRgba('#0000ff80')).toEqual([0, 0, 255, 128]);
	});

	test('should convert an 8-digit hex without # to an RGBA array including alpha', () => {
		expect(hexToRgba('ffff007f')).toEqual([255, 255, 0, 127]);
	});

	test('should handle mixed-case hex values', () => {
		expect(hexToRgba('#fF00aA')).toEqual([255, 0, 170, 255]);
	});

	test('should correctly convert black and white', () => {
		expect(hexToRgba('#000000')).toEqual([0, 0, 0, 255]);
		expect(hexToRgba('ffffff')).toEqual([255, 255, 255, 255]);
	});

	test('should throw an error for invalid hex format (too short)', () => {
		const expectedError = 'Invalid hex format. Expected "#aabbcc" or "#aabbccdd".';
		expect(() => hexToRgba('#123')).toThrow(expectedError);
		expect(() => hexToRgba('12345')).toThrow(expectedError);
	});

	test('should throw an error for invalid hex format (too long)', () => {
		const expectedError = 'Invalid hex format. Expected "#aabbcc" or "#aabbccdd".';
		expect(() => hexToRgba('#1234567')).toThrow(expectedError);
	});

	test('should throw an error for invalid hex format (invalid characters)', () => {
		const expectedError = 'Invalid hex format. Expected "#aabbcc" or "#aabbccdd".';
		expect(() => hexToRgba('#gg0000')).toThrow(expectedError);
	});

	test('should throw an error for an empty string', () => {
		const expectedError = 'Invalid hex format. Expected "#aabbcc" or "#aabbccdd".';
		expect(() => hexToRgba('')).toThrow(expectedError);
	});

	test('should handle fully transparent alpha', () => {
		expect(hexToRgba('#ff000000')).toEqual([255, 0, 0, 0]);
	});
});