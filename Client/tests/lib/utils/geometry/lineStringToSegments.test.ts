import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { lineStringToSegments } from '../../../../src/lib/utils/geometry/lineStringToSegments';
import { HatCinsi } from '../../../../src/lib/enums';
import * as utils from '../../../../src/lib/utils';

// Mock the findClosestPoleHeight function to isolate the test
vi.mock('../../../../src/lib/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof utils>();
	return {
		...actual,
		findClosestPoleHeight: vi.fn()
	};
});

describe('lineStringToSegments', () => {
	const mockPoles: GeoJSON.Feature[] = [
		/* mock pole data */
	];
	const mockFindClosestPoleHeight = utils.findClosestPoleHeight as Mock;

	beforeEach(() => {
		// Reset mocks before each test
		mockFindClosestPoleHeight.mockClear();
	});

	test('should return an empty array if the input feature is null or undefined', () => {
		expect(lineStringToSegments(null, HatCinsi.HAVAI, mockPoles)).toEqual([]);
		expect(lineStringToSegments(undefined, HatCinsi.HAVAI, mockPoles)).toEqual([]);
	});

	test('should return an empty array for a LineString with less than 2 coordinates', () => {
		const featureWithOnePoint = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: [[10, 20]]
			},
			properties: { name: 'short line' }
		};
		expect(lineStringToSegments(featureWithOnePoint, HatCinsi.HAVAI, mockPoles)).toEqual([]);
	});

	describe('when featureType is HatCinsi.HAVAI', () => {
		const feature = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: [
					[10, 20],
					[30, 40],
					[50, 60]
				]
			},
			properties: { name: 'test line' }
		};

		test('should create segments with heights from findClosestPoleHeight', () => {
			mockFindClosestPoleHeight.mockImplementation((coord) => {
				if (coord[0] === 10) return 15;
				if (coord[0] === 30) return 25;
				if (coord[0] === 50) return 35;
				return 0;
			});

			const segments = lineStringToSegments(feature, HatCinsi.HAVAI, mockPoles);

			expect(segments).toHaveLength(2);
			expect(mockFindClosestPoleHeight).toHaveBeenCalledTimes(4);
			expect(segments[0].geometry.coordinates).toEqual([
				[10, 20, 15],
				[30, 40, 25]
			]);
			expect(segments[1].geometry.coordinates).toEqual([
				[30, 40, 25],
				[50, 60, 35]
			]);
			expect(segments[0].properties).toEqual({ name: 'test line' });
		});

		test('should apply the height offset correctly', () => {
			mockFindClosestPoleHeight.mockReturnValue(10);
			const offset = 5;

			const segments = lineStringToSegments(feature, HatCinsi.HAVAI, mockPoles, offset);

			expect(segments).toHaveLength(2);
			expect(segments[0].geometry.coordinates[0][2]).toBe(15); // 10 + 5
			expect(segments[0].geometry.coordinates[1][2]).toBe(15); // 10 + 5
		});
	});

	describe('when featureType is not HatCinsi.HAVAI', () => {
		const feature = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: [
					[10, 20],
					[30, 40]
				]
			},
			properties: { name: 'ground line' }
		};

		test('should create segments with a height of 0', () => {
			const segments = lineStringToSegments(feature, HatCinsi.BARA, mockPoles);

			expect(segments).toHaveLength(1);
			expect(mockFindClosestPoleHeight).not.toHaveBeenCalled();
			expect(segments[0].geometry.coordinates).toEqual([
				[10, 20, 0],
				[30, 40, 0]
			]);
			expect(segments[0].properties).toEqual({ name: 'ground line' });
		});

		test('should ignore the offset', () => {
			const segments = lineStringToSegments(feature, HatCinsi.BARA, mockPoles, 100);
			expect(segments[0].geometry.coordinates[0][2]).toBe(0);
			expect(segments[0].geometry.coordinates[1][2]).toBe(0);
		});
	});
});