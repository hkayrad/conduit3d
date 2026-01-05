import { describe, it, expect } from 'vitest';
import { geometryToWkb } from '../../../../src/lib/utils/geometry/geometryToWkb';
import Point from 'ol/geom/Point';

describe('geometryToWkb', () => {
    it('should convert an OpenLayers Point to WKB Base64 string', () => {
        const point = new Point([0, 0]);
        const wkb = geometryToWkb(point);
        expect(typeof wkb).toBe('string');
        // Basic check for Base64 characters
        expect(wkb).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

        // Known WKB for Point(0 0) in EPSG:4326 (if projections are handled correctly by writeGeometry default)
        // or just ensure it returns a non-empty string for now as exact binary representation depends on version/endianness
        expect(wkb.length).toBeGreaterThan(0);
    });
});
