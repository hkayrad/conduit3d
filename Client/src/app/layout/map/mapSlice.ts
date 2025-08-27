import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { AgDirekTipi, AydDirekTipi, OgMusDirekTipi } from "../../../lib/enums";

export interface MapState {
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
    }
}

const initialState: MapState = {
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
    }
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
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
        }
    }
});

export const { setMapLayerVisibility } = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export const selectVisibility = (state: RootState) => state.map.visibility;
export const selectFilters = (state: RootState) => state.map.filters;

export default mapSlice.reducer;