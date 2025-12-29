import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useList } from '../../../src/lib/hooks/useList';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as listSlice from '../../../src/app/layout/list/listSlice';
import * as utils from '../../../src/lib/utils';
import { AdrBinaApi } from '../../../src/lib/api';
import { ListDataType } from '../../../src/lib/enums';

const mockDispatch = vi.fn();

vi.mock('../../../src/lib/hooks/reduxHooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(() => mockDispatch),
}));

const mockListState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: 'id',
    ascending: true,
    featureType: ListDataType.AdrBina,
    query: '',
};

vi.mock('../../../src/app/layout/list/listSlice', () => ({
    selectListState: vi.fn(() => mockListState),
    setItemsPerPage: vi.fn((payload) => ({ type: 'list/setItemsPerPage', payload })),
    setPageNumber: vi.fn((payload) => ({ type: 'list/setPageNumber', payload })),
    setSortBy: vi.fn((payload) => ({ type: 'list/setSortBy', payload })),
    setAscending: vi.fn((payload) => ({ type: 'list/setAscending', payload })),
    setQuery: vi.fn((payload) => ({ type: 'list/setQuery', payload })),
}));

vi.mock('../../../src/lib/api', () => ({
    AdrBinaApi: {
        fetchAll: vi.fn(),
        fetchCount: vi.fn(),
    },
    TrafoBinaApi: {},
    AdrYolApi: {},
    AgDirekApi: {},
    OgMusDirekApi: {},
    AydDirekApi: {},
    AgHatApi: {},
    OgHatApi: {},
    RekortmanApi: {},
    ArmaturApi: {
        fetchAll: vi.fn(),
        fetchCount: vi.fn(),
    },
}));

vi.mock('../../../src/lib/utils', () => ({
    Logger: {
        error: vi.fn(),
    },
    InputSanitizer: {
        sanitizeSearchQuery: vi.fn((query) => query),
    },
}));

describe('useList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === listSlice.selectListState) return mockListState;
            return undefined;
        });
    });

    it('should return initial empty data and handler functions', () => {
        const { result } = renderHook(() => useList());

        expect(result.current.features).toEqual([]);
        expect(result.current.featureCount).toBe(0);
        expect(result.current.tableData).toEqual({ headers: [], rows: [] });
        expect(typeof result.current.handleFetchFeatures).toBe('function');
        expect(typeof result.current.handleChangeItemsPerPage).toBe('function');
        expect(typeof result.current.handleSetPageNumber).toBe('function');
        expect(typeof result.current.handleSetSortBy).toBe('function');
        expect(typeof result.current.handleSetAscending).toBe('function');
        expect(typeof result.current.handleSetQuery).toBe('function');
        expect(typeof result.current.handleRefreshData).toBe('function');
    });

    it('should sanitize query on initialization', () => {
        vi.mocked(reduxHooks.useAppSelector).mockReturnValue({ ...mockListState, query: 'test query' });
        renderHook(() => useList());
        expect(utils.InputSanitizer.sanitizeSearchQuery).toHaveBeenCalledWith('test query');
    });

    describe('handleFetchFeatures', () => {
        it('should fetch features and count successfully', async () => {
            const mockFeatures = [{ id: 1, name: 'Building A' }];
            const mockCount = 1;

            (AdrBinaApi.fetchAll as Mock).mockResolvedValue({ isSuccess: true, data: mockFeatures });
            (AdrBinaApi.fetchCount as Mock).mockResolvedValue({ isSuccess: true, data: mockCount });

            const { result } = renderHook(() => useList());

            await act(async () => {
                await result.current.handleFetchFeatures(ListDataType.AdrBina);
            });

            expect(AdrBinaApi.fetchAll).toHaveBeenCalledWith(10, 1, 'id', true, '');
            expect(AdrBinaApi.fetchCount).toHaveBeenCalledWith('');
            expect(result.current.features).toEqual(mockFeatures);
            expect(result.current.featureCount).toBe(mockCount);
        });

        it('should handle API fetch failure', async () => {
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue({ isSuccess: false, data: [] });
            (AdrBinaApi.fetchCount as Mock).mockResolvedValue({ isSuccess: true, data: 1 }); // count might succeed

            const { result } = renderHook(() => useList());

            await act(async () => {
                await result.current.handleFetchFeatures(ListDataType.AdrBina);
            });

            expect(result.current.features).toEqual([]);
            expect(result.current.featureCount).toBe(0);
        });

        it('should handle network errors during fetch', async () => {
            const error = new Error('Network Error');
            (AdrBinaApi.fetchAll as Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useList());

            await act(async () => {
                await result.current.handleFetchFeatures(ListDataType.AdrBina);
            });

            expect(result.current.features).toEqual([]);
            expect(result.current.featureCount).toBe(0);
            expect(utils.Logger.error).toHaveBeenCalledWith(`Error fetching ${ListDataType.AdrBina}:`, error);
        });

        it('should not fetch if featureType is invalid', async () => {
            const { result } = renderHook(() => useList());

            await act(async () => {
                await result.current.handleFetchFeatures('INVALID_TYPE' as ListDataType);
            });

            expect(AdrBinaApi.fetchAll).not.toHaveBeenCalled();
            expect(AdrBinaApi.fetchCount).not.toHaveBeenCalled();
        });
    });

    describe('Redux dispatch handlers', () => {
        it('handleChangeItemsPerPage should dispatch setItemsPerPage and setPageNumber to 1', () => {
            const { result } = renderHook(() => useList());
            const mockEvent = { target: { value: '50' } } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleChangeItemsPerPage(mockEvent);
            });

            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setItemsPerPage(50));
            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setPageNumber(1));
        });

        it('handleSetPageNumber should dispatch setPageNumber', () => {
            const { result } = renderHook(() => useList());
            act(() => {
                result.current.handleSetPageNumber(3);
            });
            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setPageNumber(3));
        });

        it('handleSetSortBy should dispatch setSortBy', () => {
            const { result } = renderHook(() => useList());
            act(() => {
                result.current.handleSetSortBy('name');
            });
            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setSortBy('name'));
        });

        it('handleSetAscending should dispatch setAscending', () => {
            const { result } = renderHook(() => useList());
            act(() => {
                result.current.handleSetAscending(false);
            });
            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setAscending(false));
        });

        it('handleSetQuery should dispatch setQuery', () => {
            const { result } = renderHook(() => useList());
            act(() => {
                result.current.handleSetQuery('search term');
            });
            expect(mockDispatch).toHaveBeenCalledWith(listSlice.setQuery('search term'));
        });
    });

    it('handleRefreshData should call handleFetchFeatures with featureType from state', async () => {
        (AdrBinaApi.fetchAll as Mock).mockResolvedValue({ isSuccess: true, data: [] });
        (AdrBinaApi.fetchCount as Mock).mockResolvedValue({ isSuccess: true, data: 0 });

        const { result } = renderHook(() => useList());

        await act(async () => {
            await result.current.handleRefreshData();
        });

        expect(AdrBinaApi.fetchAll).toHaveBeenCalledTimes(1);
        expect(AdrBinaApi.fetchAll).toHaveBeenCalledWith(
            mockListState.itemsPerPage,
            mockListState.pageNumber,
            mockListState.sortBy,
            mockListState.ascending,
            mockListState.query
        );
        expect(AdrBinaApi.fetchCount).toHaveBeenCalledTimes(1);
    });
});