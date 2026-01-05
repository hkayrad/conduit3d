import { describe, it, expect, vi } from 'vitest';
import { flyToFeature } from '../../../../src/lib/utils/geometry/flyToFeature';
import { FeatureType, C3D_MapViewType } from '../../../../src/lib/enums';
import { WebMercatorViewport } from '@deck.gl/core';

// Mock WebMercatorViewport
vi.mock('@deck.gl/core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        WebMercatorViewport: vi.fn().mockImplementation(() => ({
            fitBounds: vi.fn().mockReturnValue({
                longitude: 29.0,
                latitude: 41.0,
                zoom: 18
            })
        })),
        FlyToInterpolator: vi.fn()
    };
});

describe('flyToFeature', () => {
    it('should not do anything if feature has no geometry', () => {
        const feature: any = { type: 'Feature', geometry: null };
        const setMapViewState = vi.fn();
        const mapViewState: any = {};

        flyToFeature(feature, mapViewState, setMapViewState);
        expect(setMapViewState).not.toHaveBeenCalled();
    });

    it('should call fitBounds and update view state for Line feature', () => {
        const feature: any = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
            properties: { dataType: FeatureType.LINE }
        };
        const setMapViewState = vi.fn();
        const mapViewState: any = { longitude: 0, latitude: 0, zoom: 10 };

        flyToFeature(feature, mapViewState, setMapViewState);

        // Check if setMapViewState was called with a function
        expect(setMapViewState).toHaveBeenCalled();
        const updateFn = setMapViewState.mock.calls[0][0];
        const newState = updateFn({});

        expect(newState[C3D_MapViewType.Cartesian]).toBeDefined();
        // Zoom should be overridden to 20 for Line
        expect(newState[C3D_MapViewType.Cartesian].zoom).toBe(20);
        expect(newState[C3D_MapViewType.Cartesian].longitude).toBe(29.0);
        expect(newState[C3D_MapViewType.Cartesian].latitude).toBe(41.0);
    });

    it('should use zoom level 23 for Trafo feature', () => {
        const feature: any = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { dataType: FeatureType.TRAFO }
        };
        const setMapViewState = vi.fn();
        const mapViewState: any = {};

        flyToFeature(feature, mapViewState, setMapViewState);

        const updateFn = setMapViewState.mock.calls[0][0];
        const newState = updateFn({});
        expect(newState[C3D_MapViewType.Cartesian].zoom).toBe(23);
    });
});
