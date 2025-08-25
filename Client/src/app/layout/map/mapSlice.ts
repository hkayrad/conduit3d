import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

export interface MapState {
    isBasemapVisible: boolean;
    isAdrBinaVisible: boolean;
    isTrafoBinaVisible: boolean;
    isAgDirekVisible: boolean;
    isOgMusDirekVisible: boolean;
    isAydDirekVisible: boolean;
    isAgHatVisible: boolean;
    isOgHatVisible: boolean;
    isRekortmanVisible: boolean;
}

const initialState: MapState = {
    isBasemapVisible: true,
    isAdrBinaVisible: true,
    isTrafoBinaVisible: true,
    isAgDirekVisible: true,
    isOgMusDirekVisible: true,
    isAydDirekVisible: true,
    isAgHatVisible: true,
    isOgHatVisible: true,
    isRekortmanVisible: true
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setMapLayerVisibility: (state, action: PayloadAction<{ layer: keyof MapState; visible: boolean }>) => {
            const { layer, visible } = action.payload;
            if (layer in state) {
                state[layer] = visible;
            }
        }
    }
});

export const { setMapLayerVisibility } = mapSlice.actions;

export const selectMapState = (state: RootState) => state.map;

export default mapSlice.reducer;