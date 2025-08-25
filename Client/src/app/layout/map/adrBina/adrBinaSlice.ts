import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../../lib/store";
import type { AdrBina } from "../../../../lib/types";

interface AdrBinaState {
    value: AdrBina[];
}

const initialState: AdrBinaState = {
    value: []
};

export const adrBinaSlice = createSlice({
    name: 'adrBina',
    initialState,
    reducers: {
        appendValue: (state, action: PayloadAction<AdrBina>) => {
            state.value.push(action.payload);
        },
        setValue: (state, action: PayloadAction<AdrBina[]>) => {
            state.value = action.payload;
        },
        clearValue: (state) => {
            state.value = [];
        }
    }
});

export const { appendValue, setValue, clearValue } = adrBinaSlice.actions;

export const selectAdrBina = (state: RootState) => state.adrBina.value;

export default adrBinaSlice.reducer;