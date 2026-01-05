import { describe, it, expect, beforeEach, vi } from "vitest";
import mapReducer, {
    setFocusedView,
    setIsDataLoading,
    setIsLayerControlsOpen,
    setIsHoverInfoVisible,
    setIsStreetViewVisible,
    setIsStreetViewPinned,
    setIsWireframe,
    setSelectedViewType,
    setIsSettingsWindowOpen,
    setMapLayerVisibility,
    toggleWireframe,
    toggleUndergroundLinesFlattened,
    toggleStreetView,
    toggleStreetViewPinned,
    toggleSettingsWindow,
    toggleMapLayerVisibility,
    toggleLayerControls,
    setFilter,
    setType,
    setViewState,
    setExtent,
    setLastRefreshPosition,
    addCustomLayer,
    removeCustomLayer,
    toggleCustomLayerVisibility,
    setCustomLayerOpacity,
    reorderCustomLayers,
    addGeoTiffLayer,
    removeGeoTiffLayer,
    toggleGeoTiffLayerVisibility,
    setGeoTiffLayerOpacity,
    selectMapState,
    selectIsDataLoading,
    selectIsLayerControlsOpen,
    selectIsHoverInfoVisible,
    selectIsStreetViewVisible,
    selectIsStreetViewPinned,
    selectIsWireframe,
    selectIsUndergroundLinesFlattened,
    selectIsSettingsWindowOpen,
    selectSelectedViewType,
    selectFocusedView,
    selectVisibility,
    selectFilters,
    selectTypes,
    selectViewState,
    selectExtent,
    selectLastRefreshPosition,
    selectCustomLayers,
    selectGeoTiffLayers,
    type MapState,
} from "../../../src/app/layout/map/mapSlice";
import { C3D_MapViewType, C3D_MapLayers, ListDataType } from "../../../src/lib/enums";
import type { RootState } from "../../../src/lib/store";
import type { CustomLayer, GeoTiffLayer } from "../../../src/lib/types";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("mapSlice", () => {
    let initialState: MapState;

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();

        initialState = {
            isDataLoading: false,
            isLayerControlsOpen: false,
            isHoverInfoVisible: true,
            isStreetViewVisible: true,
            isStreetViewPinned: false,
            isSettingsWindowOpen: false,
            isWireframe: false,
            isUndergroundLinesFlattened: false,
            focusedView: "deckgl",
            selectedViewType: C3D_MapViewType.Cartesian,
            visibility: {
                [C3D_MapLayers.Basemap]: true,
                [C3D_MapLayers.AdrBina]: true,
                [C3D_MapLayers.TrafoBina]: true,
                [C3D_MapLayers.AgDirek]: true,
                [C3D_MapLayers.OgMusDirek]: true,
                [C3D_MapLayers.AydDirek]: true,
                [C3D_MapLayers.AgHat]: true,
                [C3D_MapLayers.OgHat]: true,
                [C3D_MapLayers.Rekortman]: true,
                [C3D_MapLayers.AdrYol]: true,
                [C3D_MapLayers.Armatur]: true,
            },
            filters: {
                [C3D_MapLayers.AgDirek]: { tipi: [] },
                [C3D_MapLayers.OgMusDirek]: { tipi: [] },
                [C3D_MapLayers.AydDirek]: { tipi: [] },
                [C3D_MapLayers.AgHat]: { tipi: [] },
                [C3D_MapLayers.OgHat]: { tipi: [] },
                [C3D_MapLayers.Rekortman]: { tipi: [] },
                [C3D_MapLayers.AdrYol]: { tipi: [] },
            },
            types: {
                [C3D_MapLayers.AgDirek]: [],
                [C3D_MapLayers.OgMusDirek]: [],
                [C3D_MapLayers.AydDirek]: [],
                [C3D_MapLayers.AgHat]: [],
                [C3D_MapLayers.OgHat]: [],
                [C3D_MapLayers.Rekortman]: [],
                [C3D_MapLayers.AdrYol]: [],
            },
            viewState: {
                [C3D_MapViewType.Cartesian]: {
                    longitude: 41.28654673296825,
                    latitude: 39.90032606428541,
                    zoom: 16,
                    pitch: 60,
                    bearing: 0,
                },
                [C3D_MapViewType.FirstPerson]: {
                    longitude: 41.28654673296825,
                    latitude: 39.90032606428541,
                    pitch: 0,
                    bearing: 0,
                    position: [0, 0, 3],
                },
            },
            extent: {
                minX: null!,
                minY: null!,
                maxX: null!,
                maxY: null!,
            },
            lastRefreshPosition: {
                longitude: null!,
                latitude: null!,
            },
            customLayers: [],
            geoTiffLayers: [],
        };
    });

    describe("Boolean state reducers", () => {
        it("should set focusedView", () => {
            const result = mapReducer(initialState, setFocusedView("streetview"));
            expect(result.focusedView).toBe("streetview");
        });

        it("should set isDataLoading", () => {
            const result = mapReducer(initialState, setIsDataLoading(true));
            expect(result.isDataLoading).toBe(true);
        });

        it("should set isLayerControlsOpen", () => {
            const result = mapReducer(initialState, setIsLayerControlsOpen(true));
            expect(result.isLayerControlsOpen).toBe(true);
        });

        it("should set isHoverInfoVisible", () => {
            const result = mapReducer(initialState, setIsHoverInfoVisible(false));
            expect(result.isHoverInfoVisible).toBe(false);
        });

        it("should set isStreetViewVisible", () => {
            const result = mapReducer(initialState, setIsStreetViewVisible(false));
            expect(result.isStreetViewVisible).toBe(false);
        });

        it("should set isStreetViewPinned", () => {
            const result = mapReducer(initialState, setIsStreetViewPinned(true));
            expect(result.isStreetViewPinned).toBe(true);
        });

        it("should set isWireframe", () => {
            const result = mapReducer(initialState, setIsWireframe(true));
            expect(result.isWireframe).toBe(true);
        });

        it("should set selectedViewType", () => {
            const result = mapReducer(initialState, setSelectedViewType(C3D_MapViewType.FirstPerson));
            expect(result.selectedViewType).toBe(C3D_MapViewType.FirstPerson);
        });

        it("should set isSettingsWindowOpen", () => {
            const result = mapReducer(initialState, setIsSettingsWindowOpen(true));
            expect(result.isSettingsWindowOpen).toBe(true);
        });
    });

    describe("Toggle reducers", () => {
        it("should toggle wireframe", () => {
            expect(initialState.isWireframe).toBe(false);
            const result = mapReducer(initialState, toggleWireframe());
            expect(result.isWireframe).toBe(true);
            const result2 = mapReducer(result, toggleWireframe());
            expect(result2.isWireframe).toBe(false);
        });

        it("should toggle underground lines flattened", () => {
            expect(initialState.isUndergroundLinesFlattened).toBe(false);
            const result = mapReducer(initialState, toggleUndergroundLinesFlattened());
            expect(result.isUndergroundLinesFlattened).toBe(true);
        });

        it("should toggle street view", () => {
            expect(initialState.isStreetViewVisible).toBe(true);
            const result = mapReducer(initialState, toggleStreetView());
            expect(result.isStreetViewVisible).toBe(false);
        });

        it("should toggle street view pinned", () => {
            expect(initialState.isStreetViewPinned).toBe(false);
            const result = mapReducer(initialState, toggleStreetViewPinned());
            expect(result.isStreetViewPinned).toBe(true);
        });

        it("should toggle settings window", () => {
            expect(initialState.isSettingsWindowOpen).toBe(false);
            const result = mapReducer(initialState, toggleSettingsWindow());
            expect(result.isSettingsWindowOpen).toBe(true);
        });

        it("should toggle layer controls", () => {
            expect(initialState.isLayerControlsOpen).toBe(false);
            const result = mapReducer(initialState, toggleLayerControls());
            expect(result.isLayerControlsOpen).toBe(true);
        });
    });

    describe("Layer visibility reducers", () => {
        it("should set map layer visibility", () => {
            const result = mapReducer(
                initialState,
                setMapLayerVisibility({ layer: C3D_MapLayers.AgDirek, visible: false }),
            );
            expect(result.visibility[C3D_MapLayers.AgDirek]).toBe(false);
        });

        it("should toggle map layer visibility", () => {
            expect(initialState.visibility[C3D_MapLayers.AgDirek]).toBe(true);
            const result = mapReducer(initialState, toggleMapLayerVisibility({ layer: C3D_MapLayers.AgDirek }));
            expect(result.visibility[C3D_MapLayers.AgDirek]).toBe(false);
        });

        it("should not affect state for unknown layer", () => {
            const result = mapReducer(
                initialState,
                setMapLayerVisibility({ layer: "unknown" as any, visible: false }),
            );
            expect(result).toEqual(initialState);
        });
    });

    describe("Filter and type reducers", () => {
        it("should set filter", () => {
            const result = mapReducer(
                initialState,
                setFilter({ filter: C3D_MapLayers.AgDirek, tipi: ["Type1", "Type2"] }),
            );
            expect(result.filters[C3D_MapLayers.AgDirek].tipi).toEqual(["Type1", "Type2"]);
        });

        it("should not affect state for unknown filter", () => {
            const result = mapReducer(initialState, setFilter({ filter: "unknown" as any, tipi: ["Type1"] }));
            expect(result).toEqual(initialState);
        });

        it("should set type", () => {
            const result = mapReducer(
                initialState,
                setType({ key: C3D_MapLayers.AgDirek, types: ["TypeA", "TypeB"] }),
            );
            expect(result.types[C3D_MapLayers.AgDirek]).toEqual(["TypeA", "TypeB"]);
        });
    });

    describe("View state reducers", () => {
        it("should set view state for Cartesian view", () => {
            const newViewState = {
                longitude: 30,
                latitude: 40,
                zoom: 14,
                pitch: 45,
                bearing: 90,
            };
            const result = mapReducer(
                initialState,
                setViewState({ viewId: C3D_MapViewType.Cartesian, viewState: newViewState }),
            );
            expect(result.viewState[C3D_MapViewType.Cartesian]).toEqual(newViewState);
        });

        it("should set view state for FirstPerson view", () => {
            const newViewState = {
                longitude: 30,
                latitude: 40,
                pitch: 10,
                bearing: 180,
                position: [0, 0, 5] as [number, number, number],
            };
            const result = mapReducer(
                initialState,
                setViewState({ viewId: C3D_MapViewType.FirstPerson, viewState: newViewState }),
            );
            expect(result.viewState[C3D_MapViewType.FirstPerson]).toEqual(newViewState);
        });

        it("should set extent", () => {
            const newExtent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };
            const result = mapReducer(initialState, setExtent({ extent: newExtent }));
            expect(result.extent).toEqual(newExtent);
        });

        it("should set last refresh position", () => {
            const position = { longitude: 41.5, latitude: 40.5 };
            const result = mapReducer(initialState, setLastRefreshPosition({ position }));
            expect(result.lastRefreshPosition).toEqual(position);
        });
    });

    describe("Custom layer reducers", () => {
        const mockCustomLayer: CustomLayer = {
            id: "layer-1",
            name: "Test Layer",
            url: "https://example.com/tiles/{z}/{x}/{y}.png",
            visible: true,
            opacity: 1,
        };

        it("should add custom layer", () => {
            const result = mapReducer(initialState, addCustomLayer(mockCustomLayer));
            expect(result.customLayers).toHaveLength(1);
            expect(result.customLayers[0]).toEqual(mockCustomLayer);
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it("should remove custom layer", () => {
            const stateWithLayer = { ...initialState, customLayers: [mockCustomLayer] };
            const result = mapReducer(stateWithLayer, removeCustomLayer("layer-1"));
            expect(result.customLayers).toHaveLength(0);
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it("should toggle custom layer visibility", () => {
            const stateWithLayer = { ...initialState, customLayers: [mockCustomLayer] };
            const result = mapReducer(stateWithLayer, toggleCustomLayerVisibility("layer-1"));
            expect(result.customLayers[0].visible).toBe(false);
        });

        it("should not toggle visibility for non-existent layer", () => {
            const stateWithLayer = { ...initialState, customLayers: [mockCustomLayer] };
            const result = mapReducer(stateWithLayer, toggleCustomLayerVisibility("non-existent"));
            expect(result.customLayers[0].visible).toBe(true);
        });

        it("should set custom layer opacity", () => {
            const stateWithLayer = { ...initialState, customLayers: [mockCustomLayer] };
            const result = mapReducer(stateWithLayer, setCustomLayerOpacity({ id: "layer-1", opacity: 0.5 }));
            expect(result.customLayers[0].opacity).toBe(0.5);
        });

        it("should not set opacity for non-existent layer", () => {
            const stateWithLayer = { ...initialState, customLayers: [mockCustomLayer] };
            const result = mapReducer(stateWithLayer, setCustomLayerOpacity({ id: "non-existent", opacity: 0.5 }));
            expect(result.customLayers[0].opacity).toBe(1);
        });

        it("should reorder custom layers", () => {
            const layer2: CustomLayer = { ...mockCustomLayer, id: "layer-2", name: "Layer 2" };
            const layer3: CustomLayer = { ...mockCustomLayer, id: "layer-3", name: "Layer 3" };
            const stateWithLayers = { ...initialState, customLayers: [mockCustomLayer, layer2, layer3] };

            const result = mapReducer(stateWithLayers, reorderCustomLayers({ startIndex: 0, endIndex: 2 }));
            expect(result.customLayers[0].id).toBe("layer-2");
            expect(result.customLayers[1].id).toBe("layer-3");
            expect(result.customLayers[2].id).toBe("layer-1");
        });
    });

    describe("GeoTiff layer reducers", () => {
        // Create a mock ImageData for testing
        const mockImageData = { width: 100, height: 100, data: new Uint8ClampedArray(40000) } as unknown as ImageData;
        const mockGeoTiffLayer: GeoTiffLayer = {
            id: "geotiff-1",
            name: "Test GeoTiff",
            bounds: [0, 0, 100, 100],
            visible: true,
            opacity: 1,
            imageData: mockImageData,
            sourceCRS: "EPSG:4326",
            fileSize: 1024,
            bandCount: 3,
            bandMapping: { mode: "rgb", redBand: 0, greenBand: 1, blueBand: 2 },
        };

        it("should add GeoTiff layer", () => {
            const result = mapReducer(initialState, addGeoTiffLayer(mockGeoTiffLayer));
            expect(result.geoTiffLayers).toHaveLength(1);
            expect(result.geoTiffLayers[0]).toEqual(mockGeoTiffLayer);
        });

        it("should remove GeoTiff layer", () => {
            const stateWithLayer = { ...initialState, geoTiffLayers: [mockGeoTiffLayer] };
            const result = mapReducer(stateWithLayer, removeGeoTiffLayer("geotiff-1"));
            expect(result.geoTiffLayers).toHaveLength(0);
        });

        it("should toggle GeoTiff layer visibility", () => {
            const stateWithLayer = { ...initialState, geoTiffLayers: [mockGeoTiffLayer] };
            const result = mapReducer(stateWithLayer, toggleGeoTiffLayerVisibility("geotiff-1"));
            expect(result.geoTiffLayers[0].visible).toBe(false);
        });

        it("should not toggle visibility for non-existent GeoTiff layer", () => {
            const stateWithLayer = { ...initialState, geoTiffLayers: [mockGeoTiffLayer] };
            const result = mapReducer(stateWithLayer, toggleGeoTiffLayerVisibility("non-existent"));
            expect(result.geoTiffLayers[0].visible).toBe(true);
        });

        it("should set GeoTiff layer opacity", () => {
            const stateWithLayer = { ...initialState, geoTiffLayers: [mockGeoTiffLayer] };
            const result = mapReducer(stateWithLayer, setGeoTiffLayerOpacity({ id: "geotiff-1", opacity: 0.7 }));
            expect(result.geoTiffLayers[0].opacity).toBe(0.7);
        });

        it("should not set opacity for non-existent GeoTiff layer", () => {
            const stateWithLayer = { ...initialState, geoTiffLayers: [mockGeoTiffLayer] };
            const result = mapReducer(stateWithLayer, setGeoTiffLayerOpacity({ id: "non-existent", opacity: 0.7 }));
            expect(result.geoTiffLayers[0].opacity).toBe(1);
        });
    });

    describe("Selectors", () => {
        const getMockRootState = (): RootState => ({
            map: initialState,
            auth: { user: null },
            admin: { itemsPerPage: 10, pageNumber: 1, sortBy: "id", ascending: true, query: "" },
            list: {
                itemsPerPage: 10,
                pageNumber: 1,
                sortBy: "id",
                ascending: true,
                featureType: ListDataType.AdrBina,
                query: "",
            },
            config: { currentPage: "/" },
        });

        it("should select map state", () => {
            const mockRootState = getMockRootState();
            expect(selectMapState(mockRootState)).toEqual(initialState);
        });

        it("should select isDataLoading", () => {
            const mockRootState = getMockRootState();
            expect(selectIsDataLoading(mockRootState)).toBe(false);
        });

        it("should select isLayerControlsOpen", () => {
            const mockRootState = getMockRootState();
            expect(selectIsLayerControlsOpen(mockRootState)).toBe(false);
        });

        it("should select isHoverInfoVisible", () => {
            const mockRootState = getMockRootState();
            expect(selectIsHoverInfoVisible(mockRootState)).toBe(true);
        });

        it("should select isStreetViewVisible", () => {
            const mockRootState = getMockRootState();
            expect(selectIsStreetViewVisible(mockRootState)).toBe(true);
        });

        it("should select isStreetViewPinned", () => {
            const mockRootState = getMockRootState();
            expect(selectIsStreetViewPinned(mockRootState)).toBe(false);
        });

        it("should select isWireframe", () => {
            const mockRootState = getMockRootState();
            expect(selectIsWireframe(mockRootState)).toBe(false);
        });

        it("should select isUndergroundLinesFlattened", () => {
            const mockRootState = getMockRootState();
            expect(selectIsUndergroundLinesFlattened(mockRootState)).toBe(false);
        });

        it("should select isSettingsWindowOpen", () => {
            const mockRootState = getMockRootState();
            expect(selectIsSettingsWindowOpen(mockRootState)).toBe(false);
        });

        it("should select selectedViewType", () => {
            const mockRootState = getMockRootState();
            expect(selectSelectedViewType(mockRootState)).toBe(C3D_MapViewType.Cartesian);
        });

        it("should select focusedView", () => {
            const mockRootState = getMockRootState();
            expect(selectFocusedView(mockRootState)).toBe("deckgl");
        });

        it("should select visibility", () => {
            const mockRootState = getMockRootState();
            expect(selectVisibility(mockRootState)).toEqual(initialState.visibility);
        });

        it("should select filters", () => {
            const mockRootState = getMockRootState();
            expect(selectFilters(mockRootState)).toEqual(initialState.filters);
        });

        it("should select types", () => {
            const mockRootState = getMockRootState();
            expect(selectTypes(mockRootState)).toEqual(initialState.types);
        });

        it("should select viewState", () => {
            const mockRootState = getMockRootState();
            expect(selectViewState(mockRootState)).toEqual(initialState.viewState);
        });

        it("should select extent", () => {
            const mockRootState = getMockRootState();
            expect(selectExtent(mockRootState)).toEqual(initialState.extent);
        });

        it("should select lastRefreshPosition", () => {
            const mockRootState = getMockRootState();
            expect(selectLastRefreshPosition(mockRootState)).toEqual(initialState.lastRefreshPosition);
        });

        it("should select customLayers", () => {
            const mockRootState = getMockRootState();
            expect(selectCustomLayers(mockRootState)).toEqual([]);
        });

        it("should select geoTiffLayers", () => {
            const mockRootState = getMockRootState();
            expect(selectGeoTiffLayers(mockRootState)).toEqual([]);
        });
    });
});
