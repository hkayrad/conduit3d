import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

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
    }
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setMapLayerVisibility: (state, action: PayloadAction<{ layer: keyof MapState; visible: boolean }>) => {
            const { layer, visible } = action.payload;
            if (layer in state.visibility) {
                state.visibility[layer] = visible;
            }
        }
    }
});

export const { setMapLayerVisibility } = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export default mapSlice.reducer;