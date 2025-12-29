import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useYol } from '../../../src/lib/hooks/useYol';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as mapSlice from '../../../src/app/layout/map/mapSlice';
import * as configSlice from '../../../src/app/configSlice';
import * as utils from '../../../src/lib/utils';
import * as constants from '../../../src/lib/constants';

// Mock Redux hooks and selectors
const mockMapState = {
    visibility: { adrYol: true },
    filters: { adrYol: { tipi: [] } },
    types: { adrYol: ['TYPE_A', 'TYPE_B'] },
};
const mockConfig = {
    ADR_YOL_TYPE_A_COLOR: '#FF0000',
    ADR_YOL_TYPE_B_COLOR: '#00FF00',
    SOME_OTHER_CONFIG: 'value',
};

vi.mock('../../../src/lib/hooks/reduxHooks', () => ({
    useAppSelector: vi.fn(),
}));
vi.mock('../../../src/app/layout/map/mapSlice', () => ({
    selectMapState: vi.fn(() => mockMapState),
}));
vi.mock('../../../src/app/configSlice', () => ({
    selectConfig: vi.fn(() => mockConfig),
}));

// Mock utility functions
vi.mock('../../../src/lib/utils', () => ({
    filterFeature: vi.fn((collection, prop, value) => ({
        type: 'FeatureCollection',
        features: collection.features.filter((f: any) => f.properties?.[prop] === value),
    })),
    hexToRgba: vi.fn((hex) => {
        if (hex === '#FF0000') return 'rgba(255,0,0,1)';
        if (hex === '#00FF00') return 'rgba(0,255,0,1)';
        if (hex === '#ffffff') return null;
        return null;
    }),
}));

// Mock constants
vi.mock('../../../src/lib/constants', () => ({
    COLORS: {
        ADR_YOL: 'rgba(100,100,100,1)',
    },
}));

describe('useYol', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        // Set default mock return values for useAppSelector
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return mockMapState;
            }
            if (selector === configSlice.selectConfig) {
                return mockConfig;
            }
            return undefined;
        });
    });

    it('should return initial empty yolLayerData and setAdrYol function', () => {
        const { result } = renderHook(() => useYol());

        expect(result.current.yolLayerData).toEqual([[]]);
        expect(typeof result.current.setAdrYol).toBe('function');
    });

    it('should return empty yolLayerData if adrYol is empty', () => {
        const { result } = renderHook(() => useYol());

        act(() => {
            result.current.setAdrYol([]);
        });

        expect(result.current.yolLayerData).toEqual([[]]);
    });

    it('should format adrYol data correctly when populated', () => {
        const mockFeaturesA: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'TYPE_A', name: 'Road A1' }, geometry: { type: 'Point', coordinates: [0, 0] } },
            { type: 'Feature', properties: { tipi: 'TYPE_A', name: 'Road A2' }, geometry: { type: 'Point', coordinates: [1, 1] } },
        ];
        const mockFeaturesB: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'TYPE_B', name: 'Road B1' }, geometry: { type: 'Point', coordinates: [2, 2] } },
        ];

        const mockAdrYol: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeaturesA },
            { type: 'FeatureCollection', features: mockFeaturesB },
        ];

        const { result } = renderHook(() => useYol());

        act(() => {
            result.current.setAdrYol(mockAdrYol);
        });

        const expectedYolLayerData = [
            [
                {
                    id: 'adr-yol-TYPE_A',
                    color: 'rgba(255,0,0,1)',
                    visibility: true, // visibility.adrYol is true, filters.adrYol.tipi is empty
                    cinsi: 'TYPE_A',
                    data: {
                        type: 'FeatureCollection',
                        features: mockFeaturesA, // Filtered for TYPE_A
                    },
                },
                {
                    id: 'adr-yol-TYPE_B',
                    color: 'rgba(0,255,0,1)',
                    visibility: true, // visibility.adrYol is true, filters.adrYol.tipi is empty
                    cinsi: 'TYPE_B',
                    data: {
                        type: 'FeatureCollection',
                        features: mockFeaturesB, // Filtered for TYPE_B
                    },
                },
            ],
        ];

        expect(result.current.yolLayerData).toEqual(expectedYolLayerData);
        expect(utils.filterFeature).toHaveBeenCalledTimes(2);
        // Verify filterFeature was called with the combined collection and correct type
        expect(utils.filterFeature).toHaveBeenCalledWith(
            expect.objectContaining({
                features: [...mockFeaturesA, ...mockFeaturesB],
            }),
            'tipi',
            'TYPE_A'
        );
        expect(utils.filterFeature).toHaveBeenCalledWith(
            expect.objectContaining({
                features: [...mockFeaturesA, ...mockFeaturesB],
            }),
            'tipi',
            'TYPE_B'
        );
        expect(utils.hexToRgba).toHaveBeenCalledWith('#FF0000');
        expect(utils.hexToRgba).toHaveBeenCalledWith('#00FF00');
    });

    it('should use default color if config color is not found', () => {
        // Temporarily modify mockConfig for this test
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return { ...mockMapState, types: { adrYol: ['UNKNOWN_TYPE'] } };
            }
            if (selector === configSlice.selectConfig) {
                return { ...mockConfig, ADR_YOL_UNKNOWN_TYPE_COLOR: undefined }; // Simulate missing config
            }
            return undefined;
        });

        const mockAdrYol: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { tipi: 'UNKNOWN_TYPE' }, geometry: { type: 'Point', coordinates: [0, 0] } }] },
        ];

        const { result } = renderHook(() => useYol());

        act(() => {
            result.current.setAdrYol(mockAdrYol);
        });

        expect(result.current.yolLayerData[0][0].color).toBe(constants.COLORS.ADR_YOL);
        expect(utils.hexToRgba).toHaveBeenCalledWith('#ffffff'); // It will be called with '#ffffff' as fallback
    });

    describe('visibility logic', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'TYPE_A' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];
        const mockAdrYol: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeatures },
        ];

        it('should be visible if visibility.adrYol is true and filters.adrYol.tipi includes type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { adrYol: true },
                        filters: { adrYol: { tipi: ['TYPE_A'] } },
                        types: { adrYol: ['TYPE_A'] },
                    };
                }
                return mockConfig; // Ensure config is returned for color
            });

            const { result } = renderHook(() => useYol());
            act(() => {
                result.current.setAdrYol(mockAdrYol);
            });
            expect(result.current.yolLayerData[0][0].visibility).toBe(true);
        });

        it('should be visible if visibility.adrYol is true and filters.adrYol.tipi is empty', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { adrYol: true },
                        filters: { adrYol: { tipi: [] } }, // Empty filter
                        types: { adrYol: ['TYPE_A'] },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useYol());
            act(() => {
                result.current.setAdrYol(mockAdrYol);
            });
            expect(result.current.yolLayerData[0][0].visibility).toBe(true);
        });

        it('should be invisible if visibility.adrYol is true but filters.adrYol.tipi does not include type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { adrYol: true },
                        filters: { adrYol: { tipi: ['OTHER_TYPE'] } }, // Does not include TYPE_A
                        types: { adrYol: ['TYPE_A'] },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useYol());
            act(() => {
                result.current.setAdrYol(mockAdrYol);
            });
            expect(result.current.yolLayerData[0][0].visibility).toBe(false);
        });

        it('should be invisible if visibility.adrYol is false', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { adrYol: false }, // False visibility
                        filters: { adrYol: { tipi: ['TYPE_A'] } },
                        types: { adrYol: ['TYPE_A'] },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useYol());
            act(() => {
                result.current.setAdrYol(mockAdrYol);
            });
            expect(result.current.yolLayerData[0][0].visibility).toBe(false);
        });
    });

    it('should re-calculate adrYolFormatted when dependencies change', () => {
        const mockFeaturesA: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'TYPE_A', name: 'Road A1' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];
        const mockAdrYol: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeaturesA },
        ];

        const { result, rerender } = renderHook(() => useYol());

        act(() => {
            result.current.setAdrYol(mockAdrYol);
        });

        expect(result.current.yolLayerData[0][0].visibility).toBe(true); // Default mockMapState has visibility.adrYol: true, filters.adrYol.tipi: []

        // Change visibility via Redux state mock
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return {
                    ...mockMapState,
                    visibility: { adrYol: false }, // Change visibility
                    filters: { adrYol: { tipi: [] } },
                    types: { adrYol: ['TYPE_A', 'TYPE_B'] },
                };
            }
            return mockConfig;
        });

        rerender(); // Re-render the hook to pick up new mock state

        expect(result.current.yolLayerData[0][0].visibility).toBe(false);
    });

    it('should handle adrYol chunks with null or undefined features gracefully', () => {
        const mockFeaturesA: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'TYPE_A', name: 'Road A1' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];

        const mockAdrYol: (GeoJSON.FeatureCollection | null | undefined)[] = [
            { type: 'FeatureCollection', features: mockFeaturesA },
            null, // Null chunk
            { type: 'FeatureCollection', features: undefined! }, // Chunk with undefined features
            { type: 'FeatureCollection', features: [] }, // Empty chunk
        ];

        const { result } = renderHook(() => useYol());

        act(() => {
            // Cast to satisfy type, as the hook expects GeoJSON.FeatureCollection[]
            result.current.setAdrYol(mockAdrYol as GeoJSON.FeatureCollection[]);
        });

        // Expect only features from valid chunks to be processed
        // @ts-ignore
        expect(result.current.yolLayerData[0][0].data.features).toEqual(mockFeaturesA);
        // filterFeature should still be called for all types defined in mockMapState,
        // even if only TYPE_A features are present in the input.
        expect(utils.filterFeature).toHaveBeenCalledTimes(2);
    });
});
