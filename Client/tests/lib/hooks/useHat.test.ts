import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHat } from '../../../src/lib/hooks/useHat';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as mapSlice from '../../../src/app/layout/map/mapSlice';
import * as configSlice from '../../../src/app/configSlice';
import * as utils from '../../../src/lib/utils';
import * as constants from '../../../src/lib/constants';

// Mock Redux hooks and selectors
const mockMapState = {
    visibility: { agHat: true, ogHat: true, rekortman: true },
    filters: {
        agHat: { tipi: [] },
        ogHat: { tipi: [] },
        rekortman: { tipi: [] },
    },
    types: {
        agHat: ['AG_TYPE_1', 'AG_TYPE_2'],
        ogHat: ['OG_TYPE_A', 'OG_TYPE_B'],
        rekortman: ['REK_TYPE_X'],
    },
};
const mockConfig = {
    AG_HAT_AG_TYPE_1_COLOR: '#FF0000',
    AG_HAT_AG_TYPE_2_COLOR: '#FFA500',
    OG_HAT_OG_TYPE_A_COLOR: '#00FF00',
    OG_HAT_OG_TYPE_B_COLOR: '#ADD8E6',
    REKORTMAN_REK_TYPE_X_COLOR: '#0000FF',
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
vi.mock('../../../src/lib/utils/geometry/filterFeature', () => ({
    filterFeature: vi.fn((collection, prop, value) => ({
        type: 'FeatureCollection',
        features: collection.features.filter((f: any) => f.properties?.[prop] === value),
    })),
}));
vi.mock('../../../src/lib/utils', () => ({
    hexToRgba: vi.fn((hex) => {
        if (hex === '#FF0000') return 'rgba(255,0,0,1)';
        if (hex === '#FFA500') return 'rgba(255,165,0,1)';
        if (hex === '#00FF00') return 'rgba(0,255,0,1)';
        if (hex === '#ADD8E6') return 'rgba(173,216,230,1)';
        if (hex === '#0000FF') return 'rgba(0,0,255,1)';
        // Simulate a default or fallback for unknown hex values
        if (hex === undefined) return 'rgba(100,100,100,1)'; // Matches COLORS mock
        return 'rgba(0,0,0,1)'; // Generic fallback for other hexes
    }),
}));

// Mock constants
vi.mock('../../../src/lib/constants', () => ({
    COLORS: {
        AG_HAT: 'rgba(100,100,100,1)',
        OG_HAT: 'rgba(110,110,110,1)',
        REKORTMAN: 'rgba(120,120,120,1)',
    },
}));

describe('useHat', () => {
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

    it('should return initial empty data and setter functions', () => {
        const { result } = renderHook(() => useHat());

        expect(result.current.agHat).toEqual([]);
        expect(result.current.ogHat).toEqual([]);
        expect(result.current.rekortman).toEqual([]);
        expect(result.current.hatLayerData).toEqual([
            [
                {
                    "cinsi": "AG_TYPE_1",
                    "color": "rgba(255,0,0,1)",
                    "data": {
                        "features": [],
                        "type": "FeatureCollection",
                    },
                    "id": "ag-hat-AG_TYPE_1",
                    "visibility": true,
                },
                {
                    "cinsi": "AG_TYPE_2",
                    "color": "rgba(255,165,0,1)",
                    "data": {
                        "features": [],
                        "type": "FeatureCollection",
                    },
                    "id": "ag-hat-AG_TYPE_2",
                    "visibility": true,
                },
            ],
            [
                {
                    "cinsi": "OG_TYPE_A",
                    "color": "rgba(0,255,0,1)",
                    "data": {
                        "features": [],
                        "type": "FeatureCollection",
                    },
                    "id": "og-hat-OG_TYPE_A",
                    "visibility": true,
                },
                {
                    "cinsi": "OG_TYPE_B",
                    "color": "rgba(173,216,230,1)",
                    "data": {
                        "features": [],
                        "type": "FeatureCollection",
                    },
                    "id": "og-hat-OG_TYPE_B",
                    "visibility": true,
                },
            ],
            [
                {
                    "cinsi": "REK_TYPE_X",
                    "color": "rgba(0,0,255,1)",
                    "data": {
                        "features": [],
                        "type": "FeatureCollection",
                    },
                    "id": "rekortman-REK_TYPE_X",
                    "visibility": true,
                },
            ],
        ]); // Expect 3 empty arrays for each formatted type
        expect(typeof result.current.setAgHat).toBe('function');
        expect(typeof result.current.setOgHat).toBe('function');
        expect(typeof result.current.setRekortman).toBe('function');
        expect(result.current.overgroundLineWidth).toBe(1);
        expect(result.current.undergroundLineWidth).toBe(1);
        expect(typeof result.current.setOvergroundLineWidth).toBe('function');
        expect(typeof result.current.setUndergroundLineWidth).toBe('function');
    });

    it('should format agHat data correctly when populated', () => {
        const mockFeatures1: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'AG_TYPE_1', name: 'Hat A1' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        ];
        const mockFeatures2: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'AG_TYPE_2', name: 'Hat A2' }, geometry: { type: 'LineString', coordinates: [[2, 2], [3, 3]] } },
        ];
        const mockAgHat: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeatures1 },
            { type: 'FeatureCollection', features: mockFeatures2 },
        ];

        const { result } = renderHook(() => useHat());

        act(() => {
            result.current.setAgHat(mockAgHat);
        });

        const [agHatFormatted] = result.current.hatLayerData;

        expect(agHatFormatted).toHaveLength(2);
        expect(agHatFormatted[0]).toEqual({
            id: 'ag-hat-AG_TYPE_1',
            color: 'rgba(255,0,0,1)',
            visibility: true,
            cinsi: 'AG_TYPE_1',
            data: { type: 'FeatureCollection', features: mockFeatures1 },
        });
        expect(agHatFormatted[1]).toEqual({
            id: 'ag-hat-AG_TYPE_2',
            color: 'rgba(255,165,0,1)',
            visibility: true,
            cinsi: 'AG_TYPE_2',
            data: { type: 'FeatureCollection', features: mockFeatures2 },
        });
    });

    it('should format ogHat data correctly when populated', () => {
        const mockFeaturesA: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'OG_TYPE_A', name: 'OG Hat A' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        ];
        const mockOgHat: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeaturesA },
        ];

        const { result } = renderHook(() => useHat());

        act(() => {
            result.current.setOgHat(mockOgHat);
        });

        const [, ogHatFormatted] = result.current.hatLayerData;

        expect(ogHatFormatted).toHaveLength(2); // Because mockMapState.types.ogHat has 2 types
        expect(ogHatFormatted[0]).toEqual({
            id: 'og-hat-OG_TYPE_A',
            color: 'rgba(0,255,0,1)',
            visibility: true,
            cinsi: 'OG_TYPE_A',
            data: { type: 'FeatureCollection', features: mockFeaturesA },
        });
        expect(ogHatFormatted[1]).toEqual({
            id: 'og-hat-OG_TYPE_B',
            color: 'rgba(173,216,230,1)',
            visibility: true,
            cinsi: 'OG_TYPE_B',
            data: { type: 'FeatureCollection', features: [] }, // No features for OG_TYPE_B in mockOgHat
        });
    });

    it('should format rekortman data correctly when populated', () => {
        const mockFeaturesX: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'REK_TYPE_X', name: 'Rekortman X' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        ];
        const mockRekortman: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: mockFeaturesX },
        ];

        const { result } = renderHook(() => useHat());

        act(() => {
            result.current.setRekortman(mockRekortman);
        });

        const [, , rekortmanFormatted] = result.current.hatLayerData;

        expect(rekortmanFormatted).toHaveLength(1);
        expect(rekortmanFormatted[0]).toEqual({
            id: 'rekortman-REK_TYPE_X',
            color: 'rgba(0,0,255,1)',
            visibility: true,
            cinsi: 'REK_TYPE_X',
            data: { type: 'FeatureCollection', features: mockFeaturesX },
        });
    });

    it('should use default color if config color is not found for agHat', () => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return { ...mockMapState, types: { ...mockMapState.types, agHat: ['UNKNOWN_AG_TYPE'] } };
            }
            if (selector === configSlice.selectConfig) {
                return { ...mockConfig, AG_HAT_UNKNOWN_AG_TYPE_COLOR: undefined };
            }
            return undefined;
        });

        const mockAgHat: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { cinsi: 'UNKNOWN_AG_TYPE' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }] },
        ];

        const { result } = renderHook(() => useHat());
        act(() => {
            result.current.setAgHat(mockAgHat);
        });

        const [agHatFormatted] = result.current.hatLayerData;
        expect(agHatFormatted[0].color).toBe(constants.COLORS.AG_HAT);
        expect(utils.hexToRgba).toHaveBeenCalledWith(undefined);
    });

    describe('visibility logic for agHat', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'AG_TYPE_1' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        ];
        const mockAgHat: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        it('should be visible if visibility.agHat is true and filter is empty', () => {
            const { result } = renderHook(() => useHat());
            act(() => {
                result.current.setAgHat(mockAgHat);
            });
            const [agHatFormatted] = result.current.hatLayerData;
            expect(agHatFormatted[0].visibility).toBe(true);
        });

        it('should be visible if visibility.agHat is true and filter includes type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        filters: { ...mockMapState.filters, agHat: { tipi: ['AG_TYPE_1'] } },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useHat());
            act(() => {
                result.current.setAgHat(mockAgHat);
            });
            const [agHatFormatted] = result.current.hatLayerData;
            expect(agHatFormatted[0].visibility).toBe(true);
        });

        it('should be invisible if visibility.agHat is true but filter does not include type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        filters: { ...mockMapState.filters, agHat: { tipi: ['OTHER_TYPE'] } },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useHat());
            act(() => {
                result.current.setAgHat(mockAgHat);
            });
            const [agHatFormatted] = result.current.hatLayerData;
            expect(agHatFormatted[0].visibility).toBe(false);
        });

        it('should be invisible if visibility.agHat is false', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { ...mockMapState.visibility, agHat: false },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useHat());
            act(() => {
                result.current.setAgHat(mockAgHat);
            });
            const [agHatFormatted] = result.current.hatLayerData;
            expect(agHatFormatted[0].visibility).toBe(false);
        });
    });

    it('should re-calculate when dependencies change', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'AG_TYPE_1' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        ];
        const mockAgHat: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        const { result, rerender } = renderHook(() => useHat());

        act(() => {
            result.current.setAgHat(mockAgHat);
        });

        expect(result.current.hatLayerData[0][0].visibility).toBe(true);

        // Change visibility in the mock Redux state
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return { ...mockMapState, visibility: { ...mockMapState.visibility, agHat: false } };
            }
            return mockConfig;
        });

        rerender();

        expect(result.current.hatLayerData[0][0].visibility).toBe(false);
    });

    it('should handle hat chunks with null or undefined features gracefully', () => {
        const mockFeaturesA: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { cinsi: 'AG_TYPE_1', name: 'Hat A1' }, geometry: { type: 'LineString', coordinates: [0, 0] as any } },
        ];

        const mockAgHat: (GeoJSON.FeatureCollection | null | undefined)[] = [
            { type: 'FeatureCollection', features: mockFeaturesA },
            null, // Null chunk
            { type: 'FeatureCollection', features: undefined! }, // Chunk with undefined features
            { type: 'FeatureCollection', features: [] }, // Empty chunk
        ];

        const { result } = renderHook(() => useHat());

        act(() => {
            // Cast to satisfy type, as the hook expects GeoJSON.FeatureCollection[]
            result.current.setAgHat(mockAgHat as GeoJSON.FeatureCollection[]);
        });

        // Expect only features from valid chunks to be processed
        // @ts-ignore
        expect(result.current.hatLayerData[0][0].data.features).toEqual(mockFeaturesA);
        // filterFeature should still be called for all types defined in mockMapState,
        // even if only AG_TYPE_1 features are present in the input.
    });

    it('should update overgroundLineWidth when setOvergroundLineWidth is called', () => {
        const { result } = renderHook(() => useHat());
        expect(result.current.overgroundLineWidth).toBe(1);
        act(() => {
            result.current.setOvergroundLineWidth(5);
        });
        expect(result.current.overgroundLineWidth).toBe(5);
    });

    it('should update undergroundLineWidth when setUndergroundLineWidth is called', () => {
        const { result } = renderHook(() => useHat());
        expect(result.current.undergroundLineWidth).toBe(1);
        act(() => {
            result.current.setUndergroundLineWidth(3);
        });
        expect(result.current.undergroundLineWidth).toBe(3);
    });
});