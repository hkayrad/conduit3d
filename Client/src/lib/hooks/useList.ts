import { useCallback, useMemo, useState } from "react";
import {
	AdrBinaApi,
	AdrYolApi,
	AgDirekApi,
	AgHatApi,
	ArmaturApi,
	AydDirekApi,
	OgHatApi,
	OgMusDirekApi,
	RekortmanApi,
	TrafoBinaApi,
} from "../api";
import { ListDataType } from "../enums";
import {
	selectListState,
	setAscending,
	setItemsPerPage,
	setPageNumber,
	setQuery,
	setSortBy,
} from "../../app/layout/list/listSlice";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { Logger, InputSanitizer } from "../utils";
import type { TableData } from "../types";

/**
 * Custom hook for managing list state and API interactions.
 * @returns List related functions and handlers
 */
export function useList() {
	const { itemsPerPage, pageNumber, sortBy, ascending, featureType, query } = useAppSelector(selectListState);
	const dispatch = useAppDispatch();
	const sanitizedQuery = InputSanitizer.sanitizeSearchQuery(query);

	const [features, setFeatures] = useState<any[]>([]);
	const [featureCount, setFeatureCount] = useState<number>(0);
	const [tableData, setTableData] = useState<TableData>({
		headers: [],
		rows: [],
	});

	const apiMap = useMemo(
		() => ({
			[ListDataType.AdrBina]: AdrBinaApi,
			[ListDataType.TrafoBina]: TrafoBinaApi,
			[ListDataType.AdrYol]: AdrYolApi,
			[ListDataType.AgDirek]: AgDirekApi,
			[ListDataType.OgMusDirek]: OgMusDirekApi,
			[ListDataType.AydDirek]: AydDirekApi,
			[ListDataType.AgHat]: AgHatApi,
			[ListDataType.OgHat]: OgHatApi,
			[ListDataType.Rekortman]: RekortmanApi,
			[ListDataType.Armatur]: ArmaturApi,
		}),
		[],
	);

	/**
	 * Fetch features from the API.
	 * @param featureToFetch The feature type to fetch.
	 * @returns A promise that resolves when the fetch is complete.
	 */
	const handleFetchFeatures = useCallback(
		async (featureToFetch: ListDataType): Promise<void> => {
			const api = apiMap[featureToFetch];
			if (!api) return;

			try {
				const [dataResponse, countResponse] = await Promise.all([
					api.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, sanitizedQuery),
					api.fetchCount(sanitizedQuery),
				]);

				if (!dataResponse.isSuccess || !countResponse.isSuccess) {
					setFeatures([]);
					setFeatureCount(0);
					return;
				}

				setFeatures(dataResponse.data);
				setFeatureCount(countResponse.data);
			} catch (error) {
				Logger.error(`Error fetching ${featureToFetch}:`, error);
				setFeatures([]);
				setFeatureCount(0);
			}
		},
		[itemsPerPage, apiMap, ascending, pageNumber, sanitizedQuery, sortBy],
	);

	/**
	 * Handle change in items per page.
	 * @param e The change event from the select element
	 * @returns void
	 */
	const handleChangeItemsPerPage = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>): void => {
			const newItemsPerPage = Number.parseInt(e.target.value);
			dispatch(setItemsPerPage(newItemsPerPage));
			dispatch(setPageNumber(1)); // Reset to first page on items per page change
		},
		[dispatch],
	);

	/**
	 * Handle setting page number.
	 * @param newPageNumber The new page number to set
	 * @returns void
	 */
	const handleSetPageNumber = useCallback(
		(newPageNumber: number): void => {
			dispatch(setPageNumber(newPageNumber));
		},
		[dispatch],
	);

	/**
	 * Handle setting sort by field.
	 * @param newSortBy The new field to sort by
	 * @returns void
	 */
	const handleSetSortBy = useCallback(
		(newSortBy: string): void => {
			dispatch(setSortBy(newSortBy));
		},
		[dispatch],
	);

	/**
	 * Handle setting sort order.
	 * @param newSortOrder The new sort order (true for ascending, false for descending)
	 * @returns void
	 */
	const handleSetAscending = useCallback(
		(newSortOrder: boolean): void => {
			dispatch(setAscending(newSortOrder));
		},
		[dispatch],
	);

	/**
	 * Handle setting query.
	 * @param newQuery The new search query to set
	 * @returns void
	 */
	const handleSetQuery = useCallback(
		(newQuery: string): void => {
			dispatch(setQuery(newQuery));
		},
		[dispatch],
	);

	/**
	 * Refresh data by fetching features again.
	 * @returns void
	 */
	const handleRefreshData = useCallback((): void => {
		handleFetchFeatures(featureType);
	}, [handleFetchFeatures, featureType]);

	return {
		features,
		featureCount,
		tableData,
		setTableData,
		setFeatures,
		setFeatureCount,
		handleFetchFeatures,
		handleChangeItemsPerPage,
		handleSetPageNumber,
		handleSetSortBy,
		handleSetAscending,
		handleSetQuery,
		handleRefreshData,
	};
}
