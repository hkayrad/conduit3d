import { describe, test, expect } from 'vitest';
import { wkbToGeometry } from '../../../../src/lib/utils/geometry/wkbToGeometry';

describe('wkbToGeometry', () => {
	test('should convert a WKB Point to a GeoJSON Point', () => {
		// WKB for POINT(10 20) in base64
		const wkbPoint = 'AQEAAAAAAAAAAAAkQAAAAAAAADRA';
		const expectedGeoJson = {
			type: 'Point',
			coordinates: [10, 20]
		};
		expect(wkbToGeometry(wkbPoint)).toEqual(expectedGeoJson);
	});

	test('should convert a WKB LineString to a GeoJSON LineString', () => {
		// WKB for LINESTRING(10 20, 30 40) in base64
		const wkbLine = 'AQIAAAACAAAAAAAAAAAAJEAAAAAAAAA0QAAAAAAAAD5AAAAAAAAAREA=';
		const expectedGeoJson = {
			type: 'LineString',
			coordinates: [
				[10, 20],
				[30, 40]
			]
		};
		expect(wkbToGeometry(wkbLine)).toEqual(expectedGeoJson);
	});

	test('should convert a WKB Polygon to a GeoJSON Polygon', () => {
		// WKB for POLYGON((0 0, 10 0, 10 10, 0 10, 0 0)) in base64
		const wkbPolygon =
			'AQMAAAABAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAAAAAAAAAAAAAAAAAJEAAAAAAAAAkQAAAAAAAAAAAAAAAAAAAJEAAAAAAAAAAAAAAAAAAAAAA';
		const expectedGeoJson = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[10, 0],
					[10, 10],
					[0, 10],
					[0, 0]
				]
			]
		};
		expect(wkbToGeometry(wkbPolygon)).toEqual(expectedGeoJson);
	});

	test('should throw an error for invalid WKB data', () => {
		const invalidWkb = 'not-a-valid-wkb-string';
		expect(() => wkbToGeometry(invalidWkb)).toThrow();
	});
});