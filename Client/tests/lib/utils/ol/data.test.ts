import { describe, it, expect } from 'vitest';
import { normalizeGeoJSONData } from '../../../../src/lib/utils/ol/data';

describe('ol data utils', () => {
    describe('normalizeGeoJSONData', () => {
        it('should return null for null/undefined input', () => {
            expect(normalizeGeoJSONData(null)).toBeNull();
            expect(normalizeGeoJSONData(undefined)).toBeNull();
        });

        it('should wrap array data in FeatureCollection', () => {
            const data = [{ type: 'Feature' }, { type: 'Feature' }];
            const result = normalizeGeoJSONData(data);
            expect(result).toEqual({
                type: 'FeatureCollection',
                features: data
            });
        });

        it('should return null for empty array', () => {
            expect(normalizeGeoJSONData([])).toBeNull();
        });

        it('should use existing features property if present', () => {
            const data = {
                type: 'Anything',
                features: [{ type: 'Feature' }]
            };
            const result = normalizeGeoJSONData(data);
            expect(result).toBe(data);
        });

        it('should return null if features array is empty', () => {
            const data = {
                type: 'FeatureCollection',
                features: []
            };
            expect(normalizeGeoJSONData(data)).toBeNull();
        });

        it('should return data as-is if no array or features property', () => {
            const data = { type: 'Point', coordinates: [0, 0] };
            const result = normalizeGeoJSONData(data);
            expect(result).toBe(data);
        });
    });
});
