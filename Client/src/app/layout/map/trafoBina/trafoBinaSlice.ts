import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../../lib/store";
import type { Trafo } from "../../../../lib/types";

interface TrafoBinaState {
    value: Trafo[];
}

const initialState: TrafoBinaState = {
    value: []
};

export const trafoBinaSlice = createSlice({
    name: 'trafoBina',
    initialState,
    reducers: {
        appendValue: (state, action: PayloadAction<Trafo>) => {
            state.value.push(action.payload);
        },
        setValue: (state, action: PayloadAction<Trafo[]>) => {
            state.value = action.payload;
        },
        clearValue: (state) => {
            state.value = [];
        }
    }
});

export const { appendValue, setValue, clearValue } = trafoBinaSlice.actions;

export const selectTrafoBina = (state: RootState) => state.trafoBina.value;

export default trafoBinaSlice.reducer;