import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { FirstPersonViewState, MapViewState } from "deck.gl";
import { C3D_MapViewType, C3D_MapLayers } from "../../../lib/enums";
import type { C3D_LayerViewState, CustomLayer } from "../../../lib/types";

export interface MapState {
	isDataLoading: boolean;
	isLayerControlsOpen: boolean;
	isHoverInfoVisible: boolean;
	isStreetViewVisible: boolean;
	isStreetViewPinned: boolean;
	isSettingsWindowOpen: boolean;
	isWireframe: boolean;
	selectedViewType: C3D_MapViewType;
	visibility: C3D_LayerViewState;
	focusedView: "deckgl" | "streetview";
	filters: {
		[C3D_MapLayers.AgDirek]: {
			tipi: string[];
		};
		[C3D_MapLayers.OgMusDirek]: {
			tipi: string[];
		};
		[C3D_MapLayers.AydDirek]: {
			tipi: string[];
		};
		[C3D_MapLayers.AgHat]: {
			tipi: string[];
		};
		[C3D_MapLayers.OgHat]: {
			tipi: string[];
		};
		[C3D_MapLayers.Rekortman]: {
			tipi: string[];
		};
		[C3D_MapLayers.AdrYol]: {
			tipi: string[];
		};
	};
	types: {
		[C3D_MapLayers.AgDirek]: string[];
		[C3D_MapLayers.OgMusDirek]: string[];
		[C3D_MapLayers.AydDirek]: string[];
		[C3D_MapLayers.AgHat]: string[];
		[C3D_MapLayers.OgHat]: string[];
		[C3D_MapLayers.Rekortman]: string[];
		[C3D_MapLayers.AdrYol]: string[];
	};
	viewState: {
		[C3D_MapViewType.Cartesian]: MapViewState;
		[C3D_MapViewType.FirstPerson]: FirstPersonViewState;
	};
	extent: {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
	};
	lastRefreshPosition: {
		longitude: number;
		latitude: number;
	};
	customLayers: CustomLayer[];
	isUndergroundLinesFlattened: boolean;
}

const CUSTOM_LAYERS_KEY = "c3d_custom_layers";

const loadCustomLayers = (): CustomLayer[] => {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(CUSTOM_LAYERS_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Failed to load custom layers from local storage:", error);
		return [];
	}
};

const saveCustomLayers = (layers: CustomLayer[]) => {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(layers));
	} catch (error) {
		console.error("Failed to save custom layers to local storage:", error);
	}
};

const initialState: MapState = {
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
		[C3D_MapLayers.AgDirek]: {
			tipi: [],
		},
		[C3D_MapLayers.OgMusDirek]: {
			tipi: [],
		},
		[C3D_MapLayers.AydDirek]: {
			tipi: [],
		},
		[C3D_MapLayers.AgHat]: {
			tipi: [],
		},
		[C3D_MapLayers.OgHat]: {
			tipi: [],
		},
		[C3D_MapLayers.Rekortman]: {
			tipi: [],
		},
		[C3D_MapLayers.AdrYol]: {
			tipi: [],
		},
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
			// longitude: (26 + 46) / 2,
			// latitude: (36 + 42) / 2,
			zoom: 16,
			pitch: 60,
			bearing: 0,
		},
		[C3D_MapViewType.FirstPerson]: {
			longitude: 41.28654673296825,
			latitude: 39.90032606428541,
			pitch: 0,
			bearing: 0,
			position: [0, 0, 3], // 3 meters height
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
	customLayers: loadCustomLayers(),
};

export const mapSlice = createSlice({
	name: "map",
	initialState,
	reducers: {
		setFocusedView: (state, action: PayloadAction<"deckgl" | "streetview">) => {
			state.focusedView = action.payload;
		},
		setIsDataLoading: (state, action: PayloadAction<boolean>) => {
			state.isDataLoading = action.payload;
		},
		setIsLayerControlsOpen: (state, action: PayloadAction<boolean>) => {
			state.isLayerControlsOpen = action.payload;
		},
		setIsHoverInfoVisible: (state, action: PayloadAction<boolean>) => {
			state.isHoverInfoVisible = action.payload;
		},
		setIsStreetViewVisible: (state, action: PayloadAction<boolean>) => {
			state.isStreetViewVisible = action.payload;
		},
		setIsStreetViewPinned: (state, action: PayloadAction<boolean>) => {
			state.isStreetViewPinned = action.payload;
		},
		setIsWireframe: (state, action: PayloadAction<boolean>) => {
			state.isWireframe = action.payload;
		},
		setSelectedViewType: (state, action: PayloadAction<C3D_MapViewType>) => {
			state.selectedViewType = action.payload;
		},
		setIsSettingsWindowOpen: (state, action: PayloadAction<boolean>) => {
			state.isSettingsWindowOpen = action.payload;
		},
		setMapLayerVisibility: (
			state,
			action: PayloadAction<{
				layer: keyof MapState["visibility"];
				visible: boolean;
			}>,
		) => {
			const { layer, visible } = action.payload;
			if (layer in state.visibility) {
				state.visibility[layer] = visible;
			}
		},

		toggleWireframe: (state) => {
			state.isWireframe = !state.isWireframe;
		},
		toggleUndergroundLinesFlattened: (state) => {
			state.isUndergroundLinesFlattened = !state.isUndergroundLinesFlattened;
		},
		toggleStreetView: (state) => {
			state.isStreetViewVisible = !state.isStreetViewVisible;
		},
		toggleStreetViewPinned: (state) => {
			state.isStreetViewPinned = !state.isStreetViewPinned;
		},
		toggleSettingsWindow: (state) => {
			state.isSettingsWindowOpen = !state.isSettingsWindowOpen;
		},
		toggleMapLayerVisibility: (
			state,
			action: PayloadAction<{
				layer: keyof MapState["visibility"];
			}>,
		) => {
			const { layer } = action.payload;
			if (layer in state.visibility) {
				state.visibility[layer] = !state.visibility[layer];
			}
		},

		setFilter: (
			state,
			action: PayloadAction<{
				filter: keyof MapState["filters"];
				tipi: string[];
			}>,
		) => {
			const { filter, tipi } = action.payload;
			if (filter in state.filters) {
				state.filters[filter].tipi = tipi as any[];
			}
		},
		setType: (
			state,
			action: PayloadAction<{
				key: keyof MapState["types"];
				types: string[];
			}>,
		) => {
			const { key, types } = action.payload;
			state.types[key] = types;
		},
		setViewState: (
			state,
			action: PayloadAction<{ viewId: C3D_MapViewType; viewState: MapViewState | FirstPersonViewState }>,
		) => {
			const { viewId, viewState } = action.payload;
			if (viewId === C3D_MapViewType.Cartesian) {
				state.viewState[viewId] = viewState as MapViewState;
			} else if (viewId === C3D_MapViewType.FirstPerson) {
				state.viewState[viewId] = viewState as FirstPersonViewState;
			}
		},
		setExtent: (state, action: PayloadAction<{ extent: MapState["extent"] }>) => {
			const { extent } = action.payload;
			state.extent = extent;
		},
		setLastRefreshPosition: (state, action: PayloadAction<{ position: MapState["lastRefreshPosition"] }>) => {
			const { position } = action.payload;
			state.lastRefreshPosition = position;
		},
		addCustomLayer: (state, action: PayloadAction<CustomLayer>) => {
			state.customLayers.push(action.payload);
			saveCustomLayers(state.customLayers);
		},
		removeCustomLayer: (state, action: PayloadAction<string>) => {
			state.customLayers = state.customLayers.filter((layer) => layer.id !== action.payload);
			saveCustomLayers(state.customLayers);
		},
		toggleCustomLayerVisibility: (state, action: PayloadAction<string>) => {
			const layer = state.customLayers.find((l) => l.id === action.payload);
			if (layer) {
				layer.visible = !layer.visible;
				saveCustomLayers(state.customLayers);
			}
		},
		setCustomLayerOpacity: (state, action: PayloadAction<{ id: string; opacity: number }>) => {
			const layer = state.customLayers.find((l) => l.id === action.payload.id);
			if (layer) {
				layer.opacity = action.payload.opacity;
				saveCustomLayers(state.customLayers);
			}
		},
		reorderCustomLayers: (state, action: PayloadAction<{ startIndex: number; endIndex: number }>) => {
			const { startIndex, endIndex } = action.payload;
			const [removed] = state.customLayers.splice(startIndex, 1);
			state.customLayers.splice(endIndex, 0, removed);
			saveCustomLayers(state.customLayers);
		},
	},
});

export const {
	setIsDataLoading,
	setIsLayerControlsOpen,
	setIsHoverInfoVisible,
	setMapLayerVisibility,
	setIsStreetViewVisible,
	setIsStreetViewPinned,
	setIsSettingsWindowOpen,
	setIsWireframe,
	setFocusedView,
	setSelectedViewType,
	toggleWireframe,
	toggleUndergroundLinesFlattened,
	toggleStreetView,
	toggleStreetViewPinned,
	toggleSettingsWindow,
	toggleMapLayerVisibility,
	setFilter,
	setViewState,
	setExtent,
	setType,
	setLastRefreshPosition,
	addCustomLayer,
	removeCustomLayer,
	toggleCustomLayerVisibility,
	setCustomLayerOpacity,
	reorderCustomLayers,
} = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export const selectIsDataLoading = (state: RootState) => state.map.isDataLoading;
export const selectIsLayerControlsOpen = (state: RootState) => state.map.isLayerControlsOpen;
export const selectIsHoverInfoVisible = (state: RootState) => state.map.isHoverInfoVisible;
export const selectIsStreetViewVisible = (state: RootState) => state.map.isStreetViewVisible;
export const selectIsStreetViewPinned = (state: RootState) => state.map.isStreetViewPinned;
export const selectIsWireframe = (state: RootState) => state.map.isWireframe;
export const selectIsUndergroundLinesFlattened = (state: RootState) => state.map.isUndergroundLinesFlattened;
export const selectIsSettingsWindowOpen = (state: RootState) => state.map.isSettingsWindowOpen;
export const selectSelectedViewType = (state: RootState) => state.map.selectedViewType;
export const selectFocusedView = (state: RootState) => state.map.focusedView;
export const selectVisibility = (state: RootState) => state.map.visibility;
export const selectFilters = (state: RootState) => state.map.filters;
export const selectTypes = (state: RootState) => state.map.types;
export const selectViewState = (state: RootState) => state.map.viewState;
export const selectExtent = (state: RootState) => state.map.extent;
export const selectLastRefreshPosition = (state: RootState) => state.map.lastRefreshPosition;
export const selectCustomLayers = (state: RootState) => state.map.customLayers;

export default mapSlice.reducer;
