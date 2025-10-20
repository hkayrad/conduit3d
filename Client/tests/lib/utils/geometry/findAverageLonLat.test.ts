import { describe, test, expect } from 'vitest';
import { findAverageLonLat } from '../../../../src/lib/utils/geometry/findAverageLonLat';
import type { Geometry } from 'geojson';

describe('findAverageLonLat', () => {
	test('should return [0, 0] for null or undefined feature', () => {
		expect(findAverageLonLat(null!)).toEqual([0, 0]);
		expect(findAverageLonLat(undefined!)).toEqual([0, 0]);
	});

	test('should calculate average for a Point', () => {
		const point: Geometry = {
			type: 'Point',
			coordinates: [10, 20]
		};
		expect(findAverageLonLat(point)).toEqual([10, 20]);
	});

	test('should calculate average for a LineString', () => {
		const line: Geometry = {
			type: 'LineString',
			coordinates: [
				[0, 0],
				[10, 10],
				[20, 0]
			]
		};
		// Average lon: (0 + 10 + 20) / 3 = 10
		// Average lat: (0 + 10 + 0) / 3 = 3.333...
		const result = findAverageLonLat(line, 5);
		expect(result[0]).toBe(10);
		expect(result[1]).toBe(3.33333);
	});

	test('should calculate average for a Polygon (using the first ring)', () => {
		const polygon: Geometry = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[10, 0],
					[10, 10],
					[0, 10],
					[0, 0] // Last point is same as first
				],
				[
					[1, 1],
					[2, 1],
					[1, 2]
				] // This inner ring (hole) should be ignored
			]
		};
		// Average lon: (0 + 10 + 10 + 0 + 0) / 5 = 4
		// Average lat: (0 + 0 + 10 + 10 + 0) / 5 = 4
		expect(findAverageLonLat(polygon)).toEqual([4, 4]);
	});

	test('should return [0, 0] for unsupported geometry types', () => {
		const multiPoint: Geometry = {
			type: 'MultiPoint',
			coordinates: [
				[10, 40],
				[40, 30]
			]
		};
		expect(findAverageLonLat(multiPoint)).toEqual([0, 0]);
	});

	test('should return [0, 0] for geometries with empty coordinates', () => {
		const emptyLine: Geometry = {
			type: 'LineString',
			coordinates: []
		};
		expect(findAverageLonLat(emptyLine)).toEqual([0, 0]);

		const emptyPolygon: Geometry = {
			type: 'Polygon',
			coordinates: [[]]
		};
		expect(findAverageLonLat(emptyPolygon)).toEqual([0, 0]);
	});

	test('should handle the trimLength parameter correctly', () => {
		const line: Geometry = {
			type: 'LineString',
			coordinates: [
				[1, 1],
				[2, 2]
			]
		};
		// Average: [1.5, 1.5]
		expect(findAverageLonLat(line, 0)).toEqual([2, 2]); // .toFixed(0) rounds
		expect(findAverageLonLat(line, 1)).toEqual([1.5, 1.5]);
		expect(findAverageLonLat(line, 2)).toEqual([1.5, 1.5]);
	});

	test('should handle negative coordinates', () => {
		const line: Geometry = {
			type: 'LineString',
			coordinates: [
				[-10, -20],
				[-30, -40]
			]
		};
		// Average: [-20, -30]
		expect(findAverageLonLat(line)).toEqual([-20, -30]);
	});
});