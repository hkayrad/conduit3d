import instance from "../instance";
import type { ApiResponse, Extent, Hat, Rekortman } from "../types";
import { Logger, capitalizeFirstLetter } from "../utils";

/**
 * Class representing the AG Hat API
 */
export class AgHatApi {
    /**
     * Fetch all AG Hat features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of AG Hat features.
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
            const response = await instance.get<ApiResponse<Hat[]>>(
                "agHat",
                {
                    params: {
                        pageSize,
                        pageNumber,
                        sortBy: capitalizeFirstLetter(sortBy),
                        ascending,
                        query,
                        ...extent
                    }
                }
            );
            return response.data;
        } catch (error) {
            Logger.error("Fetch AgHat error:", error);
            throw error;
        }
    }

    /**
     * Fetch all AG Hat feature types.
     * @returns A promise that resolves to the list of AG Hat feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>(
                "agHat/types"
            );
            return response.data;
        } catch (error) {
            Logger.error("Fetch AgHat types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of AG Hat features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of AG Hat features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("agHat/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AgHat count error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the OG Hat API
 */
export class OgHatApi {
    /**
     * Fetch all OG Hat features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of OG Hat features.
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
            const response = await instance.get<ApiResponse<Hat[]>>(
                "ogHat",
                {
                    params: {
                        pageSize,
                        pageNumber,
                        sortBy: capitalizeFirstLetter(sortBy),
                        ascending,
                        query,
                        ...extent
                    }
                }
            );

            return response.data;
        } catch (error) {
            Logger.error("Fetch OgHat error:", error);
            throw error;
        }
    }

    /**
     * Fetch all OG Hat feature types.
     * @returns A promise that resolves to the list of OG Hat feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>(
                "ogHat/types"
            );
            return response.data;
        } catch (error) {
            Logger.error("Fetch OgHat types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of OG Hat features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of OG Hat features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("ogHat/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch OgHat count error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the Rekortman API
 */
export class RekortmanApi {
    /**
     * Fetch all Rekortman features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of Rekortman features.
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
            const response = await instance.get<ApiResponse<Rekortman[]>>(
                "rekortman",
                {
                    params: {
                        pageSize,
                        pageNumber,
                        sortBy: capitalizeFirstLetter(sortBy),
                        ascending,
                        query,
                        ...extent
                    }
                }
            );
            return response.data;
        } catch (error) {
            Logger.error("Fetch Rekortman error:", error);
            throw error;
        }
    }

    /**
     * Fetch all Rekortman feature types.
     * @returns A promise that resolves to the list of Rekortman feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>(
                "rekortman/types"
            );
            return response.data;
        } catch (error) {
            Logger.error("Fetch Rekortman types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of Rekortman features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of Rekortman features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("rekortman/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch Rekortman count error:", error);
            throw error;
        }
    }
}