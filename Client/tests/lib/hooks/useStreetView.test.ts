import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreetView } from '../../../src/lib/hooks/useStreetView';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as mapSlice from '../../../src/app/layout/map/mapSlice';
import { Loader } from '@googlemaps/js-api-loader';
import { C3D_MapViewType } from '../../../src/lib/enums';

const mockDispatch = vi.fn();

// Mock Redux
vi.mock('../../../src/lib/hooks/reduxHooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: () => mockDispatch,
}));

vi.mock('../../../src/app/layout/map/mapSlice', () => ({
    selectFocusedView: vi.fn(),
    setFocusedView: (payload: any) => ({ type: 'map/setFocusedView', payload }),
    setViewState: (payload: any) => ({ type: 'map/setViewState', payload }),
}));

// --- Mock Google Maps API ---
const mockStreetViewInstance = {
    addListener: vi.fn(),
    getPosition: vi.fn(() => ({ lat: () => 39.9, lng: () => 32.8 })),
    getPov: vi.fn(() => ({ heading: 90, pitch: -10 })),
    setPosition: vi.fn(),
    setPov: vi.fn(),
};

const mockStreetViewPanorama = vi.fn(() => mockStreetViewInstance);
const mockLatLng = vi.fn();

const mockGoogle = {
    maps: {
        StreetViewPanorama: mockStreetViewPanorama,
        LatLng: mockLatLng,
    },
};

// Mock the loader
vi.mock('@googlemaps/js-api-loader', () => ({
    Loader: vi.fn().mockImplementation(() => ({
        importLibrary: vi.fn().mockImplementation(async (library: string) => {
            if (library === 'streetView') {
                // Make the mock google.maps object available globally
                (globalThis as any).google = mockGoogle;
                return;
            }
            throw new Error('Unknown library');
        }),
    })),
}));

const initialProps = {
    position: { lat: 39.8, lng: 32.7 },
    pov: { heading: 0, pitch: 0, zoom: 1 },
};

describe('useStreetView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(reduxHooks.useAppSelector).mockReturnValue('streetview');
        // Ensure the global google object is clean before each test
        if ((globalThis as any).google) {
            delete (globalThis as any).google;
        }
    });

    afterEach(() => {
        // Cleanup global mock
        if ((globalThis as any).google) {
            delete (globalThis as any).google;
        }
    });

    it('should return initial state correctly', () => {
        const { result } = renderHook(() => useStreetView(initialProps));

        expect(result.current.isLoaded).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.streetView).toBeNull();
        expect(result.current.containerRef.current).toBeNull();
    });

    it('should initialize loader and load Street View', async () => {
        const { result } = renderHook(() => useStreetView(initialProps));

        // Simulate the ref getting a DOM element
        act(() => {
            result.current.containerRef.current = document.createElement('div');
        });

        // Re-run effects
        await act(async () => {
            // Let promises resolve
        });

        expect(Loader).toHaveBeenCalledWith({
            apiKey: process.env.VITE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ["streetView"],
            region: "TR",
        });

        expect(mockStreetViewPanorama).toHaveBeenCalled();
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.streetView).toBe(mockStreetViewInstance);
    });

    it('should handle API loading errors', async () => {
        const error = new Error('Failed to load');
        vi.mocked(Loader).mockImplementationOnce(() => ({
            importLibrary: vi.fn().mockRejectedValue(error),
        } as any));

        const { result } = renderHook(() => useStreetView(initialProps));
        act(() => {
            result.current.containerRef.current = document.createElement('div');
        });

        await act(async () => {});

        expect(result.current.isLoaded).toBe(false);
        expect(result.current.error).toBe(error.message);
    });
    
    it('should dispatch setViewState on position_changed event when focused', async () => {
        const { result } = renderHook(() => useStreetView(initialProps));
        act(() => {
            result.current.containerRef.current = document.createElement('div');
        });
        await act(async () => {});

        // Find the 'position_changed' listener and call it
        const positionListener = vi.mocked(mockStreetViewInstance.addListener).mock.calls.find(call => call[0] === 'position_changed')?.[1];
        expect(positionListener).toBeDefined();

        act(() => {
            positionListener!();
        });

        expect(mockDispatch).toHaveBeenCalledWith(mapSlice.setViewState({
            viewId: C3D_MapViewType.FirstPerson,
            viewState: {
                longitude: 32.8,
                latitude: 39.9,
                bearing: 90,
                pitch: 10, // Inverted pitch
                position: [0, 0, 3],
            },
        }));
    });

    it('should not dispatch setViewState when not focused', async () => {
        vi.mocked(reduxHooks.useAppSelector).mockReturnValue('deckgl'); // Not focused

        const { result, rerender } = renderHook(() => useStreetView(initialProps));
        act(() => {
            result.current.containerRef.current = document.createElement('div');
        });
        await act(async () => {});

        // Find the 'position_changed' listener
        const positionListener = vi.mocked(mockStreetViewInstance.addListener).mock.calls.find(call => call[0] === 'position_changed')?.[1];

        // Rerender to update the focusedView inside the hook
        rerender();

        act(() => {
            positionListener!();
        });

        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'map/setViewState' }));
    });
});