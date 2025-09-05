import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";

export interface ListState {
    itemsPerPage: number,
    pageNumber: number,
    sortBy: string,
    ascending: boolean,
    featureType: string
}

const initialState: ListState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: 'id',
    ascending: true,
    featureType: 'AdrBina'
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
        },
        setFeatureType: (state, action: PayloadAction<ListState['featureType']>) => {
            state.featureType = action.payload;
        }
    }
});

export const {
    setItemsPerPage,
    setPageNumber,
    setSortBy,
    setAscending,
    setFeatureType
} = listSlice.actions;

export const selectListState = (state: RootState) => state.list;

export const selectItemsPerPage = (state: RootState) => state.list.itemsPerPage;
export const selectPageNumber = (state: RootState) => state.list.pageNumber;
export const selectSortBy = (state: RootState) => state.list.sortBy;
export const selectSortOrder = (state: RootState) => state.list.ascending;
export const selectFeatureType = (state: RootState) => state.list.featureType;

export default listSlice.reducer;