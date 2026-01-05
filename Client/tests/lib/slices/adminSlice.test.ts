import { describe, it, expect } from "vitest";
import adminReducer, {
    setItemsPerPage,
    setPageNumber,
    setSortBy,
    setAscending,
    setQuery,
    selectAdminState,
    selectItemsPerPage,
    selectPageNumber,
    selectSortBy,
    selectSortOrder,
    selectQuery,
    type AdminState,
} from "../../../src/app/layout/admin/adminSlice";
import type { RootState } from "../../../src/lib/store";

describe("adminSlice", () => {
    const initialState: AdminState = {
        itemsPerPage: 10,
        pageNumber: 1,
        sortBy: "id",
        ascending: true,
        query: "",
    };

    describe("Reducers", () => {
        it("should return initial state", () => {
            const result = adminReducer(undefined, { type: "unknown" });
            expect(result).toEqual(initialState);
        });

        it("should set itemsPerPage", () => {
            const result = adminReducer(initialState, setItemsPerPage(25));
            expect(result.itemsPerPage).toBe(25);
        });

        it("should set pageNumber", () => {
            const result = adminReducer(initialState, setPageNumber(5));
            expect(result.pageNumber).toBe(5);
        });

        it("should set sortBy", () => {
            const result = adminReducer(initialState, setSortBy("username"));
            expect(result.sortBy).toBe("username");
        });

        it("should set ascending to false", () => {
            const result = adminReducer(initialState, setAscending(false));
            expect(result.ascending).toBe(false);
        });

        it("should set ascending to true", () => {
            const stateWithFalse = { ...initialState, ascending: false };
            const result = adminReducer(stateWithFalse, setAscending(true));
            expect(result.ascending).toBe(true);
        });

        it("should set query", () => {
            const result = adminReducer(initialState, setQuery("search term"));
            expect(result.query).toBe("search term");
        });

        it("should set empty query", () => {
            const stateWithQuery = { ...initialState, query: "old query" };
            const result = adminReducer(stateWithQuery, setQuery(""));
            expect(result.query).toBe("");
        });
    });

    describe("Selectors", () => {
        const mockRootState: RootState = {
            admin: {
                itemsPerPage: 20,
                pageNumber: 3,
                sortBy: "email",
                ascending: false,
                query: "test query",
            },
            auth: { user: null },
            map: {} as any,
            list: {} as any,
            config: { currentPage: "/" },
        };

        it("should select admin state", () => {
            expect(selectAdminState(mockRootState)).toEqual(mockRootState.admin);
        });

        it("should select itemsPerPage", () => {
            expect(selectItemsPerPage(mockRootState)).toBe(20);
        });

        it("should select pageNumber", () => {
            expect(selectPageNumber(mockRootState)).toBe(3);
        });

        it("should select sortBy", () => {
            expect(selectSortBy(mockRootState)).toBe("email");
        });

        it("should select sortOrder (ascending)", () => {
            expect(selectSortOrder(mockRootState)).toBe(false);
        });

        it("should select query", () => {
            expect(selectQuery(mockRootState)).toBe("test query");
        });
    });
});
