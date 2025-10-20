import { describe, test, expect } from 'vitest';
import { filterFeature } from '../../../../src/lib/utils/geometry/filterFeature';
import type { FeatureCollection } from 'geojson';

describe('filterFeature', () => {
	const mockFeature1 = {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [0, 0] },
		properties: { category: 'A', name: 'Feature 1' }
	};
	const mockFeature2 = {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [1, 1] },
		properties: { category: 'B', name: 'Feature 2' }
	};
	const mockFeature3 = {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [2, 2] },
		properties: { category: 'A', name: 'Feature 3' }
	};
	const featureWithoutProperties = {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [3, 3] },
		properties: null
	};
	const featureWithDifferentProperty = {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [4, 4] },
		properties: { type: 'X', name: 'Feature 4' }
	};

	const mockCollection: FeatureCollection = {
		type: 'FeatureCollection',
		features: [mockFeature1, mockFeature2, mockFeature3, featureWithoutProperties, featureWithDifferentProperty]
	};

	test('should return an array of features matching the property and value', () => {
		const result = filterFeature(mockCollection, 'category', 'A');
		expect(result).toHaveLength(2);
		expect(result).toEqual([mockFeature1, mockFeature3]);
	});

	test('should return a single matching feature', () => {
		const result = filterFeature(mockCollection, 'category', 'B');
		expect(result).toHaveLength(1);
		expect(result).toEqual([mockFeature2]);
	});

	test('should return an empty array when no features match the value', () => {
		const result = filterFeature(mockCollection, 'category', 'C');
		expect(result).toHaveLength(0);
		expect(result).toEqual([]);
	});

	test('should return an empty array when no features have the specified property', () => {
		const result = filterFeature(mockCollection, 'nonExistentProperty', 'A');
		expect(result).toHaveLength(0);
	});

	test('should return an empty array for a null collection', () => {
		expect(filterFeature(null, 'category', 'A')).toEqual([]);
	});

	test('should return an empty array for a collection with no features', () => {
		const emptyCollection: FeatureCollection = {
			type: 'FeatureCollection',
			features: []
		};
		expect(filterFeature(emptyCollection, 'category', 'A')).toEqual([]);
	});

	test('should correctly handle features with null properties', () => {
		// This test implicitly checks that `featureWithoutProperties` is not included in results.
		const result = filterFeature(mockCollection, 'category', 'A');
		expect(result.some((f) => f.properties === null)).toBe(false);
	});

	test('should perform a case-sensitive match', () => {
		const result = filterFeature(mockCollection, 'category', 'a');
		expect(result).toHaveLength(0);
	});
});