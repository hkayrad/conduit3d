import { describe, expect, test } from 'vitest';
import { capitalizeFirstLetter } from '../../../../src/lib/utils/string/capitalize';

describe('capitalizeFirstLetter', () => {
    test('should capitalize the first letter of a lowercase string', () => {
        expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    test('should not change a string that is already capitalized', () => {
        expect(capitalizeFirstLetter('World')).toBe('World');
    });

    test('should handle an all-caps string correctly', () => {
        expect(capitalizeFirstLetter('TEST')).toBe('TEST');
    });

    test('should handle a mixed-case string', () => {
        expect(capitalizeFirstLetter('mIxEdCaSe')).toBe('MIxEdCaSe');
    });

    test('should correctly capitalize a single-character string', () => {
        expect(capitalizeFirstLetter('a')).toBe('A');
    });

    test('should return an empty string when given an empty string', () => {
        expect(capitalizeFirstLetter('')).toBe('');
    });

    test('should not affect strings that start with a number', () => {
        expect(capitalizeFirstLetter('1st place')).toBe('1st place');
    });

    test('should not affect strings that start with a symbol', () => {
        expect(capitalizeFirstLetter('$money')).toBe('$money');
    });

    test('should not trim leading or trailing whitespace', () => {
        expect(capitalizeFirstLetter('  spaced out  ')).toBe('  spaced out  ');
    });
});