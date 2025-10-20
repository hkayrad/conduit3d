import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { CreateLayer } from '../../../../src/lib/utils/layer/createLayer';
import { C3D_MapViewType, HatCinsi } from '../../../../src/lib/enums';
import { BitmapLayer, ColumnLayer, PathLayer, TileLayer } from 'deck.gl';
import { PathStyleExtension } from '@deck.gl/extensions';

// Mock the deck.gl and extension classes
vi.mock('deck.gl', async (importOriginal) => {
    const actual = await importOriginal<typeof import('deck.gl')>();
    return {
        ...actual,
        TileLayer: vi.fn((props) => ({ props })),
        PathLayer: vi.fn((props) => ({ props })),
        ColumnLayer: vi.fn((props) => ({ props })),
        BitmapLayer: vi.fn((props, otherProps) => ({ props, otherProps }))
    };
});

vi.mock('@deck.gl/extensions', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@deck.gl/extensions')>();
    return {
        ...actual,
        PathStyleExtension: vi.fn(() => 'PathStyleExtensionMock')
    };
});

describe('CreateLayer', () => {
    const mockData: GeoJSON.Feature[] = [
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 1] },
            properties: { yukseklik: 10 }
        }
    ];
    const color: [number, number, number, number] = [255, 0, 0, 255];
    const highlightColor: [number, number, number, number] = [0, 255, 0, 255];

    beforeEach(() => {
        // Stub environment variables and globals
        vi.stubGlobal('import.meta', { env: { VITE_TILE_SERVER_URL: 'http://mock-tile-server.com' } });
        vi.stubGlobal('devicePixelRatio', 1);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('LocalTiles', () => {
        test('should create 3 tile layers', () => {
            const layers = CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, true);
            expect(layers).toHaveLength(3);
            expect(TileLayer).toHaveBeenCalledTimes(3);
        });

        test('should configure a city layer correctly', () => {
            CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, true);
            const eskisehirCall = (TileLayer as any).mock.calls.find((call: any) =>
                call[0].id.includes('eskisehir')
            );
            expect(eskisehirCall[0]).toMatchObject({
                id: 'cartesian-eskisehir-basemap',
                data: ['https://localhost/tiles/eskisehir/{z}/{x}/{y}'],
                minZoom: 16,
                maxZoom: 18,
                visible: true,
                pickable: false,
                zoomOffset: -1
            });
        });

        test('should configure the "turkey" layer with a different maxZoom', () => {
            CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, false);
            const turkeyCall = (TileLayer as any).mock.calls.find((call: any) =>
                call[0].id.includes('turkey')
            );
            expect(turkeyCall[0]).toMatchObject({
                maxZoom: 12,
                visible: false
            });
        });

        test('should create a BitmapLayer in renderSubLayers', () => {
            CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, true);
            const tileLayerProps = (TileLayer as any).mock.calls[0][0];
            const mockSubLayerProps = {
                id: 'sub-layer',
                tile: { boundingBox: [[-180, -90], [180, 90]] },
                data: 'mock-image-data'
            };

            const subLayers = tileLayerProps.renderSubLayers(mockSubLayerProps);
            expect(subLayers).toHaveLength(1);
            expect(BitmapLayer).toHaveBeenCalledWith(
                { id: 'sub-layer', tile: mockSubLayerProps.tile },
                {
                    image: 'mock-image-data',
                    bounds: [-180, -90, 180, 90],
                    pickable: false
                }
            );
        });

        test('should set zoomOffset based on devicePixelRatio', () => {
            vi.stubGlobal('devicePixelRatio', 2);
            CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, true);
            const firstCall = (TileLayer as any).mock.calls[0];
            expect(firstCall[0].zoomOffset).toBe(0);
        });
    });

    describe('Hat', () => {
        test('should create a standard PathLayer for HatCinsi.HAVAI', () => {
            const layer = CreateLayer.Hat('hat-1', mockData, color, highlightColor, 5, true, HatCinsi.HAVAI);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props).toMatchObject({
                id: 'hat-1',
                data: mockData,
                getWidth: 5,
                getColor: color,
                visible: true,
                billboard: true,
                autoHighlight: true,
                highlightColor: highlightColor
            });
            expect(layer.props.extensions).toBeUndefined();
            // Test accessor function
            expect(layer.props.getPath(mockData[0])).toEqual([1, 1]);
        });

        test('should create an empty standard PathLayer for HatCinsi.HAVAI', () => {
            const layer = CreateLayer.Hat('hat-3', [], color, highlightColor, 5, true, HatCinsi.HAVAI);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props.data).toEqual([]);
        });

        test('should handle null data for HatCinsi.HAVAI', () => {
            const layer = CreateLayer.Hat('hat-5', null!, color, highlightColor, 5, true, HatCinsi.HAVAI);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props.data).toEqual([]);
        });

        test('should create a dashed PathLayer for HatCinsi.BARA', () => {
            const layer = CreateLayer.Hat('hat-2', mockData, color, highlightColor, 3, false, HatCinsi.BARA);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(PathStyleExtension).toHaveBeenCalledWith({ dash: true });
            expect(layer.props).toMatchObject({
                id: 'hat-2',
                visible: false,
                billboard: false,
                getDashArray: [4, 2],
            });
            // Test accessor function
            expect(layer.props.getPath(mockData[0])).toEqual([1, 1]);
        });

        test('should create an empty dashed PathLayer for HatCinsi.BARA', () => {
            const layer = CreateLayer.Hat('hat-4', [], color, highlightColor, 3, true, HatCinsi.BARA);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props.data).toEqual([]);
        });

        test('should handle null data for HatCinsi.BARA', () => {
            const layer = CreateLayer.Hat('hat-6', null!, color, highlightColor, 3, true, HatCinsi.BARA);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props.data).toEqual([]);
        });
    });

    describe('Direk', () => {
        test('should create a standard ColumnLayer', () => {
            const layer = CreateLayer.Direk('direk-1', mockData, color, highlightColor, true, false);
            expect(ColumnLayer).toHaveBeenCalledTimes(1);
            expect(layer.props).toMatchObject({
                id: 'direk-1',
                data: mockData,
                getFillColor: color,
                visible: true,
                pickable: true,
                wireframe: false,
                diskResolution: 12,
                radius: 0.5
            });
            // Test accessor functions
            expect(layer.props.getPosition(mockData[0])).toEqual([1, 1]);
            expect(layer.props.getElevation(mockData[0])).toBe(10);
        });

        test('should create a wireframe ColumnLayer', () => {
            const layer = CreateLayer.Direk('direk-2', mockData, color, highlightColor, true, true);
            expect(ColumnLayer).toHaveBeenCalledTimes(1);
            expect(layer.props).toMatchObject({
                id: 'direk-2',
                getFillColor: [0, 0, 0, 0],
                pickable: false,
                wireframe: true,
                diskResolution: 4
            });
        });

        test('should handle empty data array', () => {
            const layer = CreateLayer.Direk('direk-3', [], color, highlightColor, true, false);
            expect(layer.props.data).toEqual([]);
        });

        test('should handle null data', () => {
            const layer = CreateLayer.Direk('direk-4', null!, color, highlightColor, true, false);
            expect(layer.props.data).toEqual([]);
        });
    });

    describe('Yol', () => {
        test('should create a PathLayer for Yol', () => {
            const layer = CreateLayer.Yol('yol-1', mockData, color, highlightColor, 2, true);
            expect(PathLayer).toHaveBeenCalledTimes(1);
            expect(layer.props).toMatchObject({
                id: 'yol-1',
                data: mockData,
                getColor: color,
                getWidth: 2,
                pickable: true,
                autoHighlight: true,
                highlightColor: highlightColor,
                visible: true
            });
            // Test accessor function
            expect(layer.props.getPath(mockData[0])).toEqual([1, 1]);
        });

        test('should handle visibility being false', () => {
            const layer = CreateLayer.Yol('yol-2', mockData, color, highlightColor, 2, false);
            expect(layer.props.visible).toBe(false);
        });

        test('should handle empty data array', () => {
            const layer = CreateLayer.Yol('yol-3', [], color, highlightColor, 2, true);
            expect(layer.props.data).toEqual([]);
        });

        test('should handle null data', () => {
            const layer = CreateLayer.Yol('yol-4', null!, color, highlightColor, 2, true);
            expect(layer.props.data).toEqual([]);
        });
    });
});