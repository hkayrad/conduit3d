import { useCallback } from "react";
import { AdrBinaApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from "../api";
import { ListDataType } from "../enums";
import { useDispatch } from "react-redux";
import { setAscending, setItemsPerPage, setPageNumber, setQuery, setSortBy } from "../../app/layout/list/listSlice";

/**
 * Custom hook for managing list state and API interactions.
 * @param featureType The type of feature to manage.
 * @param itemsPerPage The number of items to display per page.
 * @param pageNumber The current page number.
 * @param sortBy The field to sort by.
 * @param ascending Whether the sort is ascending or descending.
 * @param query The search query.
 * @param setFeatures A function to set the features state.
 * @param setFeatureCount A function to set the feature count state.
 * @returns List related functions and handlers
 */
export function useList(
    featureType: ListDataType,
    itemsPerPage: number,
    pageNumber: number,
    sortBy: string,
    ascending: boolean,
    query: string,
    setFeatures: React.Dispatch<React.SetStateAction<any[]>>,
    setFeatureCount: React.Dispatch<React.SetStateAction<number>>,
) {
    const apiMap = {
        [ListDataType.AdrBina]: AdrBinaApi,
        [ListDataType.TrafoBina]: TrafoBinaApi,
        [ListDataType.AgDirek]: AgDirekApi,
        [ListDataType.OgMusDirek]: OgMusDirekApi,
        [ListDataType.AydDirek]: AydDirekApi,
        [ListDataType.AgHat]: AgHatApi,
        [ListDataType.OgHat]: OgHatApi,
        [ListDataType.Rekortman]: RekortmanApi,
    };
    const dispatch = useDispatch();

    /**
     * Fetch features from the API.
     * @param featureToFetch The feature type to fetch.
     * @returns A promise that resolves when the fetch is complete.
     */
    const handleFetchFeatures = async (featureToFetch: ListDataType): Promise<void> => {
        const api = apiMap[featureToFetch];
        if (!api) return;

        const [dataResponse, countResponse] = await Promise.all([
            api.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query),
            api.fetchCount(query)
        ]);

        if (!dataResponse.isSuccess || !countResponse.isSuccess) {
            setFeatures([]);
            setFeatureCount(0);
            return;
        }

        setFeatures(dataResponse.data);
        setFeatureCount(countResponse.data);
    }

    /**
     * Handle change in items per page.
     * @param e The change event from the select element
     * @returns void
     */
    const handleChangeItemsPerPage = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newItemsPerPage = parseInt(e.target.value);
        dispatch(setItemsPerPage(newItemsPerPage));
        dispatch(setPageNumber(1)); // Reset to first page on items per page change
    }, []);

    /**
     * Handle setting page number.
     * @param newPageNumber The new page number to set
     * @returns void
     */
    const handleSetPageNumber = useCallback((newPageNumber: number): void => {
        dispatch(setPageNumber(newPageNumber));
    }, []);

    /**
     * Handle setting sort by field.
     * @param newSortBy The new field to sort by
     * @returns void
     */
    const handleSetSortBy = useCallback((newSortBy: string): void => {
        dispatch(setSortBy(newSortBy));
    }, []);

    /**
     * Handle setting sort order.
     * @param newSortOrder The new sort order (true for ascending, false for descending)
     * @returns void
     */
    const handleSetAscending = useCallback((newSortOrder: boolean): void => {
        dispatch(setAscending(newSortOrder));
    }, []);

    /**
     * Handle setting query.
     * @param newQuery The new search query to set
     * @returns void
     */
    const handleSetQuery = useCallback((newQuery: string): void => {
        dispatch(setQuery(newQuery));
    }, []);

    /**
     * Refresh data by fetching features again.
     * @returns void
     */
    const handleRefreshData = useCallback((): void => {
        handleFetchFeatures(featureType);
    }, [handleFetchFeatures, featureType, itemsPerPage, pageNumber, sortBy, ascending, query]);

    return {
        handleFetchFeatures,
        handleChangeItemsPerPage,
        handleSetPageNumber,
        handleSetSortBy,
        handleSetAscending,
        handleSetQuery,
        handleRefreshData
    }
}