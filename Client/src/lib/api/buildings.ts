import instance from "../instance";
import type { AdrBina, ApiResponse, Extent, TrafoBina } from "../types";
import { capitalizeFirstLetter } from "../utils";
import { Logger } from "../utils/logger";

/**
 * Class representing the ADR Bina API
 */
export class AdrBinaApi {
    /**
     * Fetch all ADR buildings within the specified extent.
     * @param pageSize Number of buildings per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter buildings.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of ADR buildings.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ) {
        try {
            const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of AdrBina.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of AdrBina.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("adrBina/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina count error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the Trafo Bina API
 */
export class TrafoBinaApi {
    /**
     * Fetch all transformer stations within the specified extent.
     * @param pageSize Number of buildings per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter buildings.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of transformer stations.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ) {
        try {

            const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina", {
                params: {
                    pageSize,
                    pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending,
                    query,
                    ...extent
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch TrafoBina error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of transformer stations.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of transformer stations.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("trafoBina/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch TrafoBina count error:", error);
            throw error;
        }
    }
}