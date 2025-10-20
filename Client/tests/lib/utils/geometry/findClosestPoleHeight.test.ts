import { describe, test, expect } from 'vitest';
import { findClosestPoleHeight } from '../../../../src/lib/utils/geometry/findClosestPoleHeight';

describe('findClosestPoleHeight', () => {
    const mockPoleFeatures = [
        {
            type: 'Feature',
            geometry: { coordinates: [10, 10] },
            properties: { yukseklik: 15 }
        },
        {
            type: 'Feature',
            geometry: { coordinates: [20, 20] },
            properties: { yukseklik: 25 }
        },
        {
            type: 'Feature',
            geometry: { coordinates: [5, 5] },
            properties: { yukseklik: 12 }
        }
    ];

    test('should return the default height of 10 if poleFeatures is null or undefined', () => {
        expect(findClosestPoleHeight([0, 0], null!)).toBe(10);
        expect(findClosestPoleHeight([0, 0], undefined!)).toBe(10);
    });

    test('should return the default height of 10 if poleFeatures is an empty array', () => {
        expect(findClosestPoleHeight([0, 0], [])).toBe(10);
    });

    test('should return the height of the closest pole', () => {
        // This coordinate is closest to the pole at [5, 5]
        const coord = [6, 6];
        expect(findClosestPoleHeight(coord, mockPoleFeatures)).toBe(12);
    });

    test('should return the height of another closest pole', () => {
        // This coordinate is closest to the pole at [20, 20]
        const coord = [19, 19];
        expect(findClosestPoleHeight(coord, mockPoleFeatures)).toBe(25);
    });

    test('should handle a coordinate that is exactly at a pole location', () => {
        const coord = [10, 10];
        expect(findClosestPoleHeight(coord, mockPoleFeatures)).toBe(15);
    });

    test('should return the height of the first pole if two are equidistant', () => {
        const equidistantPoles = [
            {
                type: 'Feature',
                geometry: { coordinates: [10, 10] },
                properties: { yukseklik: 100 }
            },
            {
                type: 'Feature',
                geometry: { coordinates: [-10, -10] },
                properties: { yukseklik: 200 }
            }
        ];
        // The origin [0, 0] is equidistant from [10, 10] and [-10, -10]
        const coord = [0, 0];
        // It should return the height of the first one it finds in the array.
        expect(findClosestPoleHeight(coord, equidistantPoles)).toBe(100);
    });

    test('should return the height of the only pole in the array', () => {
        const singlePole = [
            {
                type: 'Feature',
                geometry: { coordinates: [50, 50] },
                properties: { yukseklik: 99 }
            }
        ];
        expect(findClosestPoleHeight([0, 0], singlePole)).toBe(99);
    });
});