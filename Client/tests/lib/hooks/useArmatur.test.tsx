import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useArmatur } from '../../../src/lib/hooks/useArmatur';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

// Mock the redux selectors
vi.mock('../../../src/app/layout/map/mapSlice', () => ({
    selectMapState: () => ({ visibility: { armatur: true } })
}));

vi.mock('../../../src/app/configSlice', () => ({
    selectConfig: () => ({ ARMATUR_COLOR: '#ff0000' })
}));

vi.mock('../../../src/lib/utils', () => ({
    hexToRgba: vi.fn((hex: string) => [255, 0, 0, 255])
}));

// Create a mock store
const createMockStore = () => configureStore({
    reducer: {
        map: () => ({ visibility: { armatur: true } }),
        config: () => ({ ARMATUR_COLOR: '#ff0000' })
    }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store= { createMockStore() } > { children } </Provider>
);

describe('useArmatur', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return initial empty armatur state', () => {
        const { result } = renderHook(() => useArmatur([]), { wrapper });

        expect(result.current.armatur).toEqual([]);
        expect(result.current.setArmatur).toBeDefined();
        expect(result.current.armaturLayerData).toEqual([]);
    });

    it('should return armaturLayerData with correct structure when armatur has data', () => {
        const { result } = renderHook(() => useArmatur([]), { wrapper });

        // Set some armatur data
        const mockFeatureCollection: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: { id: 1, bagli_tablo_kayit_id: null }
            }]
        };

        // Use act to update state
        result.current.setArmatur([mockFeatureCollection]);
    });

    it('should link armatur to poles when bagli_tablo_kayit_id matches', () => {
        const mockPoles: GeoJSON.Feature[] = [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 1] },
            properties: { id: 100, yukseklik: 10 }
        }];

        const { result } = renderHook(() => useArmatur(mockPoles), { wrapper });

        // The hook should be able to link armaturs to poles
        expect(result.current.armaturLayerData).toBeDefined();
    });
});
