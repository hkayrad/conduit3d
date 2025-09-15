import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { FirstPersonViewState, MapViewState } from "deck.gl";
import { C3D_MapViewType } from "../../../lib/enums";

export interface MapState {
    isDataLoading: boolean,
    isLayerControlsOpen: boolean,
    isHoverInfoVisible: boolean,
    selectedViewType: C3D_MapViewType,
    visibility: {
        basemap: boolean,
        adrBina: boolean,
        trafoBina: boolean,
        agDirek: boolean,
        ogMusDirek: boolean,
        aydDirek: boolean,
        agHat: boolean,
        ogHat: boolean,
        rekortman: boolean,
    },
    filters: {
        agDirek: {
            tipi: string[]
        },
        ogMusDirek: {
            tipi: string[]
        },
        aydDirek: {
            tipi: string[]
        },
        agHat: {
            tipi: string[]
        },
        ogHat: {
            tipi: string[]
        },
        rekortman: {
            tipi: string[]
        }
    },
    types: {
        agDirek: string[],
        ogMusDirek: string[],
        aydDirek: string[],
        agHat: string[],
        ogHat: string[],
        rekortman: string[]
    },
    viewState: {
        [C3D_MapViewType.Cartesian]: MapViewState,
        [C3D_MapViewType.FirstPerson]: FirstPersonViewState
    },
    extent: {
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
    }
}

const initialState: MapState = {
    isDataLoading: false,
    isLayerControlsOpen: false,
    isHoverInfoVisible: true,
    selectedViewType: C3D_MapViewType.Cartesian,
    visibility: {
        basemap: true,
        adrBina: true,
        trafoBina: true,
        agDirek: true,
        ogMusDirek: true,
        aydDirek: true,
        agHat: true,
        ogHat: true,
        rekortman: true
    },
    filters: {
        agDirek: {
            tipi: []
        },
        ogMusDirek: {
            tipi: []
        },
        aydDirek: {
            tipi: []
        },
        agHat: {
            tipi: []
        },
        ogHat: {
            tipi: []
        },
        rekortman: {
            tipi: []
        }
    },
    types: {
        agDirek: [],
        ogMusDirek: [],
        aydDirek: [],
        agHat: [],
        ogHat: [],
        rekortman: []
    },
    viewState: {
        [C3D_MapViewType.Cartesian]: {
            longitude: 41.287,
            latitude: 39.9,
            zoom: 15,
            pitch: 60,
            bearing: 0
        },
        [C3D_MapViewType.FirstPerson]: {
            longitude: 41.287,
            latitude: 39.9,
            pitch: 0,
            bearing: 50
        }
    },
    extent: {
        minX: 40,
        minY: 39,
        maxX: 41,
        maxY: 40,
    }
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setIsDataLoading: (state, action: PayloadAction<boolean>) => {
            state.isDataLoading = action.payload;
        },
        setIsLayerControlsOpen: (state, action: PayloadAction<boolean>) => {
            state.isLayerControlsOpen = action.payload;
        },
        setIsHoverInfoVisible: (state, action: PayloadAction<boolean>) => {
            state.isHoverInfoVisible = action.payload;
        },
        setSelectedViewType: (state, action: PayloadAction<C3D_MapViewType>) => {
            state.selectedViewType = action.payload;
        },
        setMapLayerVisibility: (
            state,
            action: PayloadAction<{
                layer: keyof MapState["visibility"];
                visible: boolean
            }>
        ) => {
            const { layer, visible } = action.payload;
            if (layer in state.visibility) {
                state.visibility[layer] = visible;
            }
        },
        setFilter: (
            state,
            action: PayloadAction<{
                filter: keyof MapState["filters"];
                tipi: string[];
            }>
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
            }>
        ) => {
            const { key, types } = action.payload;
            state.types[key] = types;
        },
        setViewState: (
            state,
            action: PayloadAction<{ viewId: C3D_MapViewType, viewState: MapViewState | FirstPersonViewState }>
        ) => {
            const { viewId, viewState } = action.payload;
            if (viewId === C3D_MapViewType.Cartesian) {
                state.viewState[viewId] = viewState as MapViewState;
            } else if (viewId === C3D_MapViewType.FirstPerson) {
                state.viewState[viewId] = viewState as FirstPersonViewState;
            }
        },
        setExtent: (
            state,
            action: PayloadAction<{ extent: MapState["extent"] }>
        ) => {
            const { extent } = action.payload;
            state.extent = extent;
        }
    }
});

export const {
    setIsDataLoading,
    setIsLayerControlsOpen,
    setIsHoverInfoVisible,
    setMapLayerVisibility,
    setSelectedViewType,
    setFilter,
    setViewState,
    setExtent,
    setType
} = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export const selectIsDataLoading = (state: RootState) => state.map.isDataLoading;
export const selectIsLayerControlsOpen = (state: RootState) => state.map.isLayerControlsOpen;
export const selectIsHoverInfoVisible = (state: RootState) => state.map.isHoverInfoVisible;
export const selectSelectedViewType = (state: RootState) => state.map.selectedViewType;
export const selectVisibility = (state: RootState) => state.map.visibility;
export const selectFilters = (state: RootState) => state.map.filters;
export const selectTypes = (state: RootState) => state.map.types;
export const selectViewState = (state: RootState) => state.map.viewState;
export const selectExtent = (state: RootState) => state.map.extent;

export default mapSlice.reducer;