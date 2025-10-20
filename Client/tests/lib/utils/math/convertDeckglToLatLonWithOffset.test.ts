import { describe, test, expect } from 'vitest';
import { convertDeckGLPositionToLatLonWithOffset } from '../../../../src/lib/utils/math/convertDeckglToLatLonWithOffset';

describe('convertDeckGLPositionToLatLonWithOffset', () => {
    const baseLat = 40.7128; // New York City
    const baseLon = -74.006;

    test('should return base coordinates when offset is zero', () => {
        const result = convertDeckGLPositionToLatLonWithOffset(0, 0, baseLat, baseLon);
        expect(result.latitude).toBeCloseTo(baseLat);
        expect(result.longitude).toBeCloseTo(baseLon);
    });

    test('should calculate correct coordinates for a positive offset', () => {
        const x = 1000; // 1km east
        const y = 1000; // 1km north
        const result = convertDeckGLPositionToLatLonWithOffset(x, y, baseLat, baseLon);

        // Expected values are calculated based on the formulas in the function
        const expectedLat = 40.72178;
        const expectedLon = -73.99425;

        expect(result.latitude).toBeCloseTo(expectedLat);
        expect(result.longitude).toBeCloseTo(expectedLon);
    });

    test('should calculate correct coordinates for a negative offset', () => {
        const x = -1000; // 1km west
        const y = -1000; // 1km south
        const result = convertDeckGLPositionToLatLonWithOffset(x, y, baseLat, baseLon);

        // Expected values are calculated based on the formulas in the function
        const expectedLat = 40.70381;
        const expectedLon = -74.01774;

        expect(result.latitude).toBeCloseTo(expectedLat);
        expect(result.longitude).toBeCloseTo(expectedLon);
    });

    test('should calculate correctly at the equator (latitude 0)', () => {
        const x = 111320; // approx 1 degree of longitude at the equator
        const y = 111320; // approx 1 degree of latitude
        const result = convertDeckGLPositionToLatLonWithOffset(x, y, 0, 0);

        expect(result.latitude).toBeCloseTo(1);
        expect(result.longitude).toBeCloseTo(1);
    });

    test('should throw TypeError for non-numeric x argument', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => convertDeckGLPositionToLatLonWithOffset('a', 0, baseLat, baseLon)).toThrow(
            'All arguments must be numbers'
        );
    });

    test('should throw TypeError for non-numeric y argument', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => convertDeckGLPositionToLatLonWithOffset(0, 'a', baseLat, baseLon)).toThrow(
            'All arguments must be numbers'
        );
    });

    test('should throw TypeError for non-numeric baseLatitude argument', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => convertDeckGLPositionToLatLonWithOffset(0, 0, 'a', baseLon)).toThrow(
            'All arguments must be numbers'
        );
    });

    test('should throw TypeError for non-numeric baseLongitude argument', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => convertDeckGLPositionToLatLonWithOffset(0, 0, baseLat, 'a')).toThrow(
            'All arguments must be numbers'
        );
    });
});