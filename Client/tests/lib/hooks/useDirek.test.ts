import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDirek } from '../../../src/lib/hooks/useDirek';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as mapSlice from '../../../src/app/layout/map/mapSlice';
import * as configSlice from '../../../src/app/configSlice';
import * as utils from '../../../src/lib/utils';
import * as constants from '../../../src/lib/constants';

// Mock Redux hooks and selectors with data for all direk types
const mockMapState = {
    visibility: { agDirek: true, ogMusDirek: true, aydDirek: true },
    filters: {
        agDirek: { tipi: [] },
        ogMusDirek: { tipi: [] },
        aydDirek: { tipi: [] },
    },
    types: {
        agDirek: ['AG_TYPE_A'],
        ogMusDirek: ['OG_TYPE_B'],
        aydDirek: ['AYD_TYPE_C'],
    },
};

const mockConfig = {
    AG_DIREK_AG_TYPE_A_COLOR: '#FF0000',
    OG_MUS_DIREK_OG_TYPE_B_COLOR: '#00FF00',
    AYD_DIREK_AYD_TYPE_C_COLOR: '#0000FF',
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

// Mock utility functions. Note: The actual hook imports from a sub-path.
vi.mock('../../../src/lib/utils/geometry/filterFeature', () => ({
    filterFeature: vi.fn((collection, prop, value) => ({
        type: 'FeatureCollection',
        features: collection.features.filter((f: any) => f.properties?.[prop] === value),
    })),
}));
vi.mock('../../../src/lib/utils', () => ({
    hexToRgba: vi.fn((hex) => {
        if (hex === '#FF0000') return 'rgba(255,0,0,1)';
        if (hex === '#00FF00') return 'rgba(0,255,0,1)';
        if (hex === '#0000FF') return 'rgba(0,0,255,1)';
        if (hex === '#ffffff') return null;
        return null;
    }),
}));

vi.mock('../../../src/lib/constants', () => ({
    COLORS: {
        AG_DIREK: 'rgba(100,100,100,1)',
        OG_MUS_DIREK: 'rgba(110,110,110,1)',
        AYD_DIREK: 'rgba(120,120,120,1)',
    },
}));

describe('useDirek', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) return mockMapState;
            if (selector === configSlice.selectConfig) return mockConfig;
            return undefined;
        });
    });

    it('should return initial empty data and setter functions', () => {
        const { result } = renderHook(() => useDirek());

        const [agDirekLayer, ogMusDirekLayer] = result.current.direkLayerData;
        const aydDirekLayer = result.current.aydDirekFormatted;
        
        expect(agDirekLayer).toHaveLength(1);
        expect(agDirekLayer[0]).toMatchObject({
            id: 'ag-direk-AG_TYPE_A',
            color: 'rgba(255,0,0,1)',
            visibility: true,
        });
        expect(agDirekLayer[0].data.features).toEqual([]);
        
        expect(ogMusDirekLayer).toHaveLength(1);
        expect(ogMusDirekLayer[0]).toMatchObject({
            id: 'og-mus-direk-OG_TYPE_B',
            color: 'rgba(0,255,0,1)',
            visibility: true,
        });
        expect(ogMusDirekLayer[0].data.features).toEqual([]);
        
        expect(aydDirekLayer).toHaveLength(1);
        expect(aydDirekLayer[0]).toMatchObject({
            id: 'ayd-direk-AYD_TYPE_C',
            color: 'rgba(0,0,255,1)',
            visibility: true,
        });
        expect(aydDirekLayer[0].data.features).toEqual([]);
        
        expect(result.current.allPoles).toEqual([]);
        expect(typeof result.current.setAgDirek).toBe('function');
        expect(typeof result.current.setOgMusDirek).toBe('function');
        expect(typeof result.current.setAydDirek).toBe('function');
    });

    it('should format agDirek data correctly when populated', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'AG_TYPE_A' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];
        const mockAgDirek: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        const { result } = renderHook(() => useDirek());

        act(() => {
            result.current.setAgDirek(mockAgDirek);
        });

        const [agDirekFormatted] = result.current.direkLayerData;

        expect(agDirekFormatted).toHaveLength(1);
        expect(agDirekFormatted[0]).toEqual({
            id: 'ag-direk-AG_TYPE_A',
            data: { type: 'FeatureCollection', features: mockFeatures },
            color: 'rgba(255,0,0,1)',
            visibility: true,
        });
    });

    it('should format ogMusDirek data correctly when populated', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'OG_TYPE_B' }, geometry: { type: 'Point', coordinates: [1, 1] } },
        ];
        const mockOgMusDirek: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        const { result } = renderHook(() => useDirek());

        act(() => {
            result.current.setOgMusDirek(mockOgMusDirek);
        });

        const [, ogMusDirekFormatted] = result.current.direkLayerData;

        expect(ogMusDirekFormatted).toHaveLength(1);
        expect(ogMusDirekFormatted[0]).toEqual({
            id: 'og-mus-direk-OG_TYPE_B',
            data: { type: 'FeatureCollection', features: mockFeatures },
            color: 'rgba(0,255,0,1)',
            visibility: true,
        });
    });

    it('should format aydDirek data correctly when populated', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'AYD_TYPE_C' }, geometry: { type: 'Point', coordinates: [2, 2] } },
        ];
        const mockAydDirek: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        const { result } = renderHook(() => useDirek());

        act(() => {
            result.current.setAydDirek(mockAydDirek);
        });

        const aydDirekFormatted = result.current.aydDirekFormatted;

        expect(aydDirekFormatted).toHaveLength(1);
        expect(aydDirekFormatted[0]).toEqual({
            id: 'ayd-direk-AYD_TYPE_C',
            data: { type: 'FeatureCollection', features: mockFeatures },
            color: 'rgba(0,0,255,1)',
            visibility: true,
        });
    });

    it('should combine all poles into a single array', () => {
        const agFeature: GeoJSON.Feature = { type: 'Feature', properties: { tipi: 'AG_TYPE_A' }, geometry: { type: 'Point', coordinates: [0, 0] } };
        const ogFeature: GeoJSON.Feature = { type: 'Feature', properties: { tipi: 'OG_TYPE_B' }, geometry: { type: 'Point', coordinates: [1, 1] } };
        const aydFeature: GeoJSON.Feature = { type: 'Feature', properties: { tipi: 'AYD_TYPE_C' }, geometry: { type: 'Point', coordinates: [2, 2] } };

        const { result } = renderHook(() => useDirek());

        act(() => {
            result.current.setAgDirek([{ type: 'FeatureCollection', features: [agFeature] }]);
            result.current.setOgMusDirek([{ type: 'FeatureCollection', features: [ogFeature] }]);
            result.current.setAydDirek([{ type: 'FeatureCollection', features: [aydFeature] }]);
        });

        expect(result.current.allPoles).toHaveLength(3);
        expect(result.current.allPoles).toEqual([agFeature, ogFeature, aydFeature]);
    });

    it('should return an empty allPoles array if data is not set', () => {
        const { result } = renderHook(() => useDirek());
        expect(result.current.allPoles).toEqual([]);
    });

    it('should use default color if config color is not found', () => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return { ...mockMapState, types: { ...mockMapState.types, agDirek: ['UNKNOWN_TYPE'] } };
            }
            if (selector === configSlice.selectConfig) {
                return { ...mockConfig, AG_DIREK_UNKNOWN_TYPE_COLOR: undefined };
            }
            return undefined;
        });

        const mockAgDirek: GeoJSON.FeatureCollection[] = [
            { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { tipi: 'UNKNOWN_TYPE' }, geometry: { type: 'Point', coordinates: [0, 0] } }] },
        ];

        const { result } = renderHook(() => useDirek());
        act(() => {
            result.current.setAgDirek(mockAgDirek);
        });

        const [agDirekFormatted] = result.current.direkLayerData;
        expect(agDirekFormatted[0].color).toBe(constants.COLORS.AG_DIREK);
        expect(utils.hexToRgba).toHaveBeenCalledWith('#ffffff');
    });

    describe('visibility logic for agDirek', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'AG_TYPE_A' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];
        const mockAgDirek: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        it('should be visible if visibility.agDirek is true and filter is empty', () => {
            const { result } = renderHook(() => useDirek());
            act(() => {
                result.current.setAgDirek(mockAgDirek);
            });
            const [agDirekFormatted] = result.current.direkLayerData;
            expect(agDirekFormatted[0].visibility).toBe(true);
        });

        it('should be visible if visibility.agDirek is true and filter includes type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        filters: { ...mockMapState.filters, agDirek: { tipi: ['AG_TYPE_A'] } },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useDirek());
            act(() => {
                result.current.setAgDirek(mockAgDirek);
            });
            const [agDirekFormatted] = result.current.direkLayerData;
            expect(agDirekFormatted[0].visibility).toBe(true);
        });

        it('should be invisible if visibility.agDirek is true but filter does not include type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        filters: { ...mockMapState.filters, agDirek: { tipi: ['OTHER_TYPE'] } },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useDirek());
            act(() => {
                result.current.setAgDirek(mockAgDirek);
            });
            const [agDirekFormatted] = result.current.direkLayerData;
            expect(agDirekFormatted[0].visibility).toBe(false);
        });

        it('should be invisible if visibility.agDirek is false', () => {
            vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
                if (selector === mapSlice.selectMapState) {
                    return {
                        ...mockMapState,
                        visibility: { ...mockMapState.visibility, agDirek: false },
                    };
                }
                return mockConfig;
            });

            const { result } = renderHook(() => useDirek());
            act(() => {
                result.current.setAgDirek(mockAgDirek);
            });
            const [agDirekFormatted] = result.current.direkLayerData;
            expect(agDirekFormatted[0].visibility).toBe(false);
        });
    });

    it('should re-calculate when dependencies change', () => {
        const mockFeatures: GeoJSON.Feature[] = [
            { type: 'Feature', properties: { tipi: 'AG_TYPE_A' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        ];
        const mockAgDirek: GeoJSON.FeatureCollection[] = [{ type: 'FeatureCollection', features: mockFeatures }];

        const { result, rerender } = renderHook(() => useDirek());

        act(() => {
            result.current.setAgDirek(mockAgDirek);
        });

        expect(result.current.direkLayerData[0][0].visibility).toBe(true);

        // Change visibility in the mock Redux state
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === mapSlice.selectMapState) {
                return { ...mockMapState, visibility: { ...mockMapState.visibility, agDirek: false } };
            }
            return mockConfig;
        });

        rerender();

        expect(result.current.direkLayerData[0][0].visibility).toBe(false);
    });
});