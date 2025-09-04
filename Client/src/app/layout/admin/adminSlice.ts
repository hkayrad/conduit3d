import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { UserSortBy } from "../../../lib/types";

export interface AdminState {
    itemsPerPage: number,
    pageNumber: number,
    sortBy: UserSortBy,
    ascending: boolean
}

const initialState: AdminState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: 'id',
    ascending: true
};

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<AdminState['itemsPerPage']>) => {
            state.itemsPerPage = action.payload;
        },
        setPageNumber: (state, action: PayloadAction<AdminState['pageNumber']>) => {
            state.pageNumber = action.payload;
        },
        setSortBy: (state, action: PayloadAction<AdminState['sortBy']>) => {
            state.sortBy = action.payload;
        },
        setAscending: (state, action: PayloadAction<AdminState['ascending']>) => {
            state.ascending = action.payload;
        }
    }
});

export const {
    setItemsPerPage,
    setPageNumber,
    setSortBy,
    setAscending
} = adminSlice.actions;

export const selectAdminState = (state: RootState) => state.admin;

export const selectItemsPerPage = (state: RootState) => state.admin.itemsPerPage;
export const selectPageNumber = (state: RootState) => state.admin.pageNumber;
export const selectSortBy = (state: RootState) => state.admin.sortBy;
export const selectSortOrder = (state: RootState) => state.admin.ascending;

export default adminSlice.reducer;