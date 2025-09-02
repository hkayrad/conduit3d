import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

export interface MapState {
    isDataLoading: boolean,
    isLayerControlsOpen: boolean,
    isHoverInfoVisible: boolean,
    visibility: {
        basemap: boolean,
        adrBina: boolean,
        trafoBina: boolean,
        agDirek: boolean,
        ogMusDirek: boolean,
        aydDirek: boolean,
        agHat: boolean,
        ogHat: boolean,
        rekortman: boolean
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
        lon: number,
        lat: number,
        z: number,
        p: number,
        b: number
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
        lon: 41.287,
        lat: 39.9,
        z: 15,
        p: 60,
        b: 0
    },
    extent: {
        minX: 26,
        minY: 36,
        maxX: 45,
        maxY: 42,
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
            action: PayloadAction<{ viewState: MapState["viewState"] }>
        ) => {
            const { viewState } = action.payload;
            state.viewState = viewState;
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
    setFilter,
    setViewState,
    setExtent,
    setType
} = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export const selectIsDataLoading = (state: RootState) => state.map.isDataLoading;
export const selectIsLayerControlsOpen = (state: RootState) => state.map.isLayerControlsOpen;
export const selectIsHoverInfoVisible = (state: RootState) => state.map.isHoverInfoVisible;
export const selectVisibility = (state: RootState) => state.map.visibility;
export const selectFilters = (state: RootState) => state.map.filters;
export const selectTypes = (state: RootState) => state.map.types;
export const selectViewState = (state: RootState) => state.map.viewState;
export const selectExtent = (state: RootState) => state.map.extent;

export default mapSlice.reducer;