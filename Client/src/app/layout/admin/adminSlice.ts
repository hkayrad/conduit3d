import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

export interface AdminState {
    itemsPerPage: number,
    pageNumber: number
}

const initialState: AdminState = {
    itemsPerPage: 10,
    pageNumber: 1
};

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<number>) => {
            state.itemsPerPage = action.payload;
        },
        setPageNumber: (state, action: PayloadAction<number>) => {
            state.pageNumber = action.payload;
        }
    }
});

export const {
    setItemsPerPage,
    setPageNumber
} = adminSlice.actions;

export const selectAdminState = (state: RootState) => state.admin;

export const selectItemsPerPage = (state: RootState) => state.admin.itemsPerPage;
export const selectPageNumber = (state: RootState) => state.admin.pageNumber;

export default adminSlice.reducer;