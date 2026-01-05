import { describe, it, expect } from "vitest";
import listReducer, {
    setItemsPerPage,
    setPageNumber,
    setSortBy,
    setAscending,
    setFeatureType,
    setQuery,
    selectListState,
    selectItemsPerPage,
    selectPageNumber,
    selectSortBy,
    selectSortOrder,
    selectFeatureType,
    selectQuery,
    type ListState,
} from "../../../src/app/layout/list/listSlice";
import { ListDataType } from "../../../src/lib/enums";
import type { RootState } from "../../../src/lib/store";

describe("listSlice", () => {
    const initialState: ListState = {
        itemsPerPage: 10,
        pageNumber: 1,
        sortBy: "id",
        ascending: true,
        featureType: ListDataType.AdrBina,
        query: "",
    };

    describe("Reducers", () => {
        it("should return initial state", () => {
            const result = listReducer(undefined, { type: "unknown" });
            expect(result).toEqual(initialState);
        });

        it("should set itemsPerPage", () => {
            const result = listReducer(initialState, setItemsPerPage(25));
            expect(result.itemsPerPage).toBe(25);
        });

        it("should set itemsPerPage to smaller value", () => {
            const result = listReducer(initialState, setItemsPerPage(5));
            expect(result.itemsPerPage).toBe(5);
        });

        it("should set pageNumber", () => {
            const result = listReducer(initialState, setPageNumber(10));
            expect(result.pageNumber).toBe(10);
        });

        it("should set pageNumber back to 1", () => {
            const stateWithPage = { ...initialState, pageNumber: 5 };
            const result = listReducer(stateWithPage, setPageNumber(1));
            expect(result.pageNumber).toBe(1);
        });

        it("should set sortBy", () => {
            const result = listReducer(initialState, setSortBy("name"));
            expect(result.sortBy).toBe("name");
        });

        it("should set sortBy to different field", () => {
            const result = listReducer(initialState, setSortBy("kodu"));
            expect(result.sortBy).toBe("kodu");
        });

        it("should set ascending to false", () => {
            const result = listReducer(initialState, setAscending(false));
            expect(result.ascending).toBe(false);
        });

        it("should set ascending to true", () => {
            const stateWithFalse = { ...initialState, ascending: false };
            const result = listReducer(stateWithFalse, setAscending(true));
            expect(result.ascending).toBe(true);
        });

        it("should set featureType to AgDirek", () => {
            const result = listReducer(initialState, setFeatureType(ListDataType.AgDirek));
            expect(result.featureType).toBe(ListDataType.AgDirek);
        });

        it("should set featureType to TrafoBina", () => {
            const result = listReducer(initialState, setFeatureType(ListDataType.TrafoBina));
            expect(result.featureType).toBe(ListDataType.TrafoBina);
        });

        it("should set featureType to AgHat", () => {
            const result = listReducer(initialState, setFeatureType(ListDataType.AgHat));
            expect(result.featureType).toBe(ListDataType.AgHat);
        });

        it("should set query", () => {
            const result = listReducer(initialState, setQuery("search term"));
            expect(result.query).toBe("search term");
        });

        it("should set empty query", () => {
            const stateWithQuery = { ...initialState, query: "old query" };
            const result = listReducer(stateWithQuery, setQuery(""));
            expect(result.query).toBe("");
        });

        it("should handle query with special characters", () => {
            const result = listReducer(initialState, setQuery("test@#$%"));
            expect(result.query).toBe("test@#$%");
        });
    });

    describe("Selectors", () => {
        const mockRootState: RootState = {
            list: {
                itemsPerPage: 50,
                pageNumber: 7,
                sortBy: "kodu",
                ascending: false,
                featureType: ListDataType.AgDirek,
                query: "test query",
            },
            auth: { user: null },
            admin: {} as any,
            map: {} as any,
            config: { currentPage: "/" },
        };

        it("should select list state", () => {
            expect(selectListState(mockRootState)).toEqual(mockRootState.list);
        });

        it("should select itemsPerPage", () => {
            expect(selectItemsPerPage(mockRootState)).toBe(50);
        });

        it("should select pageNumber", () => {
            expect(selectPageNumber(mockRootState)).toBe(7);
        });

        it("should select sortBy", () => {
            expect(selectSortBy(mockRootState)).toBe("kodu");
        });

        it("should select sortOrder (ascending)", () => {
            expect(selectSortOrder(mockRootState)).toBe(false);
        });

        it("should select featureType", () => {
            expect(selectFeatureType(mockRootState)).toBe(ListDataType.AgDirek);
        });

        it("should select query", () => {
            expect(selectQuery(mockRootState)).toBe("test query");
        });

        it("should select default values", () => {
            const defaultRootState: RootState = {
                list: initialState,
                auth: { user: null },
                admin: {} as any,
                map: {} as any,
                config: { currentPage: "/" },
            };
            expect(selectItemsPerPage(defaultRootState)).toBe(10);
            expect(selectPageNumber(defaultRootState)).toBe(1);
            expect(selectSortBy(defaultRootState)).toBe("id");
            expect(selectSortOrder(defaultRootState)).toBe(true);
            expect(selectFeatureType(defaultRootState)).toBe(ListDataType.AdrBina);
            expect(selectQuery(defaultRootState)).toBe("");
        });
    });
});
