import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { AgDirekTipi, AydDirekTipi, OgMusDirekTipi } from "../../../lib/enums";

export interface MapState {
    isDataLoading: boolean,
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
            tipi: AgDirekTipi[]
        },
        ogMusDirek: {
            tipi: OgMusDirekTipi[]
        },
        aydDirek: {
            tipi: AydDirekTipi[]
        }
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
        }
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
                tipi: (AgDirekTipi | OgMusDirekTipi | AydDirekTipi)[];
            }>
        ) => {
            const { filter, tipi } = action.payload;
            if (filter in state.filters) {
                state.filters[filter].tipi = tipi as any[];
            }
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

export const { setIsDataLoading, setMapLayerVisibility, setFilter, setViewState, setExtent } = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export const selectIsDataLoading = (state: RootState) => state.map.isDataLoading;
export const selectVisibility = (state: RootState) => state.map.visibility;
export const selectFilters = (state: RootState) => state.map.filters;
export const selectViewState = (state: RootState) => state.map.viewState;
export const selectExtent = (state: RootState) => state.map.extent;

export default mapSlice.reducer;