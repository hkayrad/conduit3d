import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

export interface ListState {
    itemsPerPage: number,
    pageNumber: number,
    sortBy: string,
    ascending: boolean
}

const initialState: ListState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: 'id',
    ascending: true
};

export const listSlice = createSlice({
    name: 'list',
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<ListState['itemsPerPage']>) => {
            state.itemsPerPage = action.payload;
        },
        setPageNumber: (state, action: PayloadAction<ListState['pageNumber']>) => {
            state.pageNumber = action.payload;
        },
        setSortBy: (state, action: PayloadAction<ListState['sortBy']>) => {
            state.sortBy = action.payload;
        },
        setAscending: (state, action: PayloadAction<ListState['ascending']>) => {
            state.ascending = action.payload;
        }
    }
});

export const {
    setItemsPerPage,
    setPageNumber,
    setSortBy,
    setAscending
} = listSlice.actions;

export const selectListState = (state: RootState) => state.list;

export const selectItemsPerPage = (state: RootState) => state.list.itemsPerPage;
export const selectPageNumber = (state: RootState) => state.list.pageNumber;
export const selectSortBy = (state: RootState) => state.list.sortBy;
export const selectSortOrder = (state: RootState) => state.list.ascending;

export default listSlice.reducer;