import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMap } from '../../../src/lib/hooks/useMap';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as mapSlice from '../../../src/app/layout/map/mapSlice';
import * as Utils from '../../../src/lib/utils';
import { C3D_MapLayers, C3D_MapViewType } from '../../../src/lib/enums';
import { WebMercatorViewport, PickingInfo } from 'deck.gl';
import { MAX_POPUP_COUNT } from '../../../src/lib/constants';

const mockDispatch = vi.fn();

// Mock Redux
vi.mock('../../../src/lib/hooks/reduxHooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('../../../src/app/layout/map/mapSlice', () => ({
    selectMapState: vi.fn(),
    setExtent: vi.fn((payload) => ({ type: 'map/setExtent', payload })),
    setLastRefreshPosition: vi.fn((payload) => ({ type: 'map/setLastRefreshPosition', payload })),
    setSelectedViewType: vi.fn((payload) => ({ type: 'map/setSelectedViewType', payload })),
    setViewState: vi.fn((payload) => ({ type: 'map/setViewState', payload })),
    toggleMapLayerVisibility: vi.fn((payload) => ({ type: 'map/toggleMapLayerVisibility', payload })),
    toggleSettingsWindow: vi.fn(() => ({ type: 'map/toggleSettingsWindow' })),
    toggleStreetView: vi.fn(() => ({ type: 'map/toggleStreetView' })),
    toggleWireframe: vi.fn(() => ({ type: 'map/toggleWireframe' })),
}));

// Mock Deck.GL classes
vi.mock('deck.gl', async (importOriginal) => {
    const original = await importOriginal<typeof import('deck.gl')>();
    return {
        ...original,
        MapView: vi.fn().mockImplementation(() => ({ id: C3D_MapViewType.Cartesian })),
        FirstPersonView: vi.fn().mockImplementation(() => ({ id: C3D_MapViewType.FirstPerson })),
        WebMercatorViewport: vi.fn().mockImplementation(() => ({
            getBounds: () => [-10, -10, 10, 10],
        })),
        FirstPersonViewport: vi.fn().mockImplementation(() => ({
            getBounds: () => [-1, -1, 1, 1],
        })),
    };
});

// Mock utility functions
vi.mock('../../../src/lib/utils', () => ({
    convertDeckGLToLatLonWithOffset: vi.fn(() => ({ longitude: 1, latitude: 1 })),
    flyToFeature: vi.fn(),
}));

const initialCartesianState = {
    longitude: 0,
    latitude: 0,
    zoom: 15,
    pitch: 50,
    bearing: 0,
};

const initialFirstPersonState = {
    longitude: 0,
    latitude: 0,
    pitch: 0,
    bearing: 0,
    position: [0, 0, 3],
};

const mockMapState = {
    viewState: {
        cartesian: initialCartesianState,
        firstPerson: initialFirstPersonState,
    },
    selectedViewType: C3D_MapViewType.Cartesian,
    focusedView: 'deckgl',
    lastRefreshPosition: { longitude: 0, latitude: 0 },
};

describe('useMap', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(reduxHooks.useAppSelector).mockReturnValue(mockMapState);
        // Mock globalThis.location
        Object.defineProperty(globalThis, 'location', {
            value: {
                pathname: '/',
            },
            writable: true,
        });
    });

    it('should return initial state and functions', () => {
        const { result } = renderHook(() => useMap());

        expect(result.current.activePopups).toEqual([]);
        expect(result.current.hoveredFeature).toBeNull();
        expect(result.current.showFpsCounter).toBe(false);
        expect(result.current.mapViewState.cartesian).toEqual(expect.objectContaining(initialCartesianState));
        expect(typeof result.current.handleUpdate).toBe('function');
        expect(typeof result.current.handleClick).toBe('function');
        expect(typeof result.current.handleKeyPresses).toBe('function');
    });

    describe('Views and Layer Filter', () => {
        it('should create a MapView for Cartesian view type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockReturnValue({
                ...mockMapState,
                selectedViewType: C3D_MapViewType.Cartesian,
            });
            const { result } = renderHook(() => useMap());
            expect(result.current.views?.id).toBe(C3D_MapViewType.Cartesian);
        });

        it('should create a FirstPersonView for FirstPerson view type', () => {
            vi.mocked(reduxHooks.useAppSelector).mockReturnValue({
                ...mockMapState,
                selectedViewType: C3D_MapViewType.FirstPerson,
            });
            const { result } = renderHook(() => useMap());
            expect(result.current.views?.id).toBe(C3D_MapViewType.FirstPerson);
        });

        it('layerFilter should always return true for non-basemap layers', () => {
            const { result } = renderHook(() => useMap());
            const layer = { id: 'some-layer' } as any;
            const viewport = { id: 'any-viewport' } as any;
            expect(result.current.layerFilter({ layer, viewport } as any)).toBe(true);
        });

        it('layerFilter should filter basemap layers based on viewport id', () => {
            const { result } = renderHook(() => useMap());
            const layer = { id: 'basemap-cartesian' } as any;
            const matchingViewport = { id: 'cartesian' } as any;
            const nonMatchingViewport = { id: 'first-person' } as any;

            expect(result.current.layerFilter({ layer, viewport: matchingViewport } as any)).toBe(true);
            expect(result.current.layerFilter({ layer, viewport: nonMatchingViewport } as any)).toBe(false);
        });
    });

    describe('State Updates and Interactions', () => {
        it('handleViewStateChange should update mapViewState', () => {
            const { result } = renderHook(() => useMap());
            const newViewState = { longitude: 10, latitude: 10, zoom: 16 };

            act(() => {
                result.current.handleViewStateChange(C3D_MapViewType.Cartesian, newViewState as any);
            });

            expect(result.current.mapViewState.cartesian).toEqual(expect.objectContaining(newViewState));
            // Check if firstPerson longitude/latitude is also updated
            expect(result.current.mapViewState.firstPerson.longitude).toBe(10);
            expect(result.current.mapViewState.firstPerson.latitude).toBe(10);
        });

        it('handleMouseMove should update hover state', () => {
            const { result } = renderHook(() => useMap());
            const mockInfo = {
                object: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [] } },
                x: 100,
                y: 200,
                coordinate: [1, 2],
            } as PickingInfo;

            act(() => {
                result.current.handleMouseMove(mockInfo);
            });

            expect(result.current.hoveredFeature).toEqual(mockInfo.object);
            expect(result.current.mousePos).toEqual({ x: 100, y: 200 });
            expect(result.current.mouseLonLat).toEqual([1, 2]);
        });

        it('handleUpdate should dispatch setViewState and setExtent', () => {
            vi.mocked(reduxHooks.useAppSelector).mockReturnValue({
                ...mockMapState,
                lastRefreshPosition: { longitude: null, latitude: null }, // Force extent update
            });
            const { result } = renderHook(() => useMap());

            act(() => {
                result.current.handleUpdate();
            });

            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setViewState(expect.any(Object)));
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setExtent(expect.any(Object)));
            expect(WebMercatorViewport).toHaveBeenCalled();
        });

        it('handleUpdate should not run if focusedView is not deckgl', () => {
            vi.mocked(reduxHooks.useAppSelector).mockReturnValue({ ...mockMapState, focusedView: 'sidebar' });
            const { result } = renderHook(() => useMap());

            act(() => {
                result.current.handleUpdate();
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('Popup Management', () => {
        const mockInfo = {
            object: { type: 'Feature', properties: { id: 1 }, geometry: { type: 'Point', coordinates: [] } },
        } as PickingInfo;

        it('handleClick should add a popup', () => {
            const { result } = renderHook(() => useMap());

            act(() => {
                result.current.handleClick(mockInfo);
            });

            expect(result.current.activePopups).toHaveLength(1);
            expect(result.current.activePopups[0].info).toEqual(mockInfo);
        });

        it('handleClick should not add duplicate popups', () => {
            const { result } = renderHook(() => useMap());

            act(() => {
                result.current.handleClick(mockInfo);
                result.current.handleClick(mockInfo); // Click same object again
            });

            expect(result.current.activePopups).toHaveLength(1);
        });

        it('handleClick should respect MAX_POPUP_COUNT', () => {
            const { result } = renderHook(() => useMap());

            act(() => {
                for (let i = 0; i < MAX_POPUP_COUNT + 2; i++) {
                    result.current.handleClick({
                        ...mockInfo,
                        object: { ...mockInfo.object, properties: { id: i } },
                    } as PickingInfo);
                }
            });

            expect(result.current.activePopups).toHaveLength(MAX_POPUP_COUNT);
            // Check that the first popup was removed
            expect(result.current.activePopups.find(p => p.info.object.properties.id === 0)).toBeUndefined();
        });

        it('handleClosePopup should remove a popup', () => {
            const { result } = renderHook(() => useMap());

            act(() => {
                result.current.handleClick(mockInfo);
            });

            const popupId = result.current.activePopups[0].id;
            act(() => {
                result.current.handleClosePopup(popupId);
            });

            expect(result.current.activePopups).toHaveLength(0);
        });

        it('handleFocusPopup should bring a popup to the front', () => {
            const { result } = renderHook(() => useMap());
            const info1 = { ...mockInfo, object: { ...mockInfo.object, properties: { id: 1 } } } as PickingInfo;
            const info2 = { ...mockInfo, object: { ...mockInfo.object, properties: { id: 2 } } } as PickingInfo;

            act(() => {
                result.current.handleClick(info1);
                result.current.handleClick(info2);
            });

            const popup1 = result.current.activePopups[0];
            const popup2 = result.current.activePopups[1];
            expect(popup1.zIndex).toBeLessThan(popup2.zIndex);

            act(() => {
                result.current.handleFocusPopup(popup1.id);
            });

            const updatedPopup1 = result.current.activePopups.find(p => p.id === popup1.id)!;
            const updatedPopup2 = result.current.activePopups.find(p => p.id === popup2.id)!;
            expect(updatedPopup1.zIndex).toBeGreaterThan(updatedPopup2.zIndex);
        });
    });

    describe('Keyboard Shortcuts (handleKeyPresses)', () => {
        const createEvent = (code: string, ctrlKey = false, shiftKey = false) =>
            new KeyboardEvent('keydown', { code, ctrlKey, shiftKey, bubbles: true });

        it('should toggle wireframe with Shift+W', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleKeyPresses(createEvent('KeyW', false, true));
            });
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.toggleWireframe());
        });

        it('should change to Cartesian view with Shift+C', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleKeyPresses(createEvent('KeyC', false, true));
            });
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setSelectedViewType(C3D_MapViewType.Cartesian));
        });

        it('should change to First Person view with Shift+F', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleKeyPresses(createEvent('KeyF', false, true));
            });
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setSelectedViewType(C3D_MapViewType.FirstPerson));
        });

        it('should toggle FPS counter with Shift+P', () => {
            const { result } = renderHook(() => useMap());
            expect(result.current.showFpsCounter).toBe(false);
            act(() => {
                result.current.handleKeyPresses(createEvent('KeyP', false, true));
            });
            expect(result.current.showFpsCounter).toBe(true);
        });

        it('should toggle layer visibility with Shift+[Digit]', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleKeyPresses(createEvent('Digit1', false, true));
            });
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.toggleMapLayerVisibility({ layer: C3D_MapLayers.AdrBina }));
        });

        it('should toggle settings with Ctrl+,', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleKeyPresses(createEvent('Comma', true, false));
            });
            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.toggleSettingsWindow());
        });

        it('should clear all popups with Ctrl+Delete', () => {
            const { result } = renderHook(() => useMap());
            act(() => {
                result.current.handleClick({ object: {} } as PickingInfo);
            });
            expect(result.current.activePopups).toHaveLength(1);
            act(() => {
                result.current.handleKeyPresses(createEvent('Delete', true, false));
            });
            expect(result.current.activePopups).toHaveLength(0);
        });
    });

    describe('flyTo', () => {
        it('should call flyToFeature utility', () => {
            const { result } = renderHook(() => useMap());
            const feature = { type: 'Feature' } as GeoJSON.Feature;

            act(() => {
                result.current.flyTo(feature);
            });

            expect(Utils.flyToFeature).toHaveBeenCalledWith(
                feature,
                result.current.mapViewState.cartesian,
                expect.any(Function)
            );
        });

        it('should switch to Cartesian view if not already active', () => {
            vi.mocked(reduxHooks.useAppSelector).mockReturnValue({
                ...mockMapState,
                selectedViewType: C3D_MapViewType.FirstPerson,
            });
            const { result } = renderHook(() => useMap());
            const feature = { type: 'Feature' } as GeoJSON.Feature;

            act(() => {
                result.current.flyTo(feature);
            });

            expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setSelectedViewType(C3D_MapViewType.Cartesian));
            expect(Utils.flyToFeature).toHaveBeenCalled();
        });
    });
});