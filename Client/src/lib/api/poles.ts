import instance from "../instance";
import type { ApiResponse, Direk, Extent } from "../types";
import { capitalizeFirstLetter } from "../utils";

/** 
 * Class representing the AG Direk API 
 */
export class AgDirekApi {
    /**
     * Fetch all AG Direk features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of AG Direk features.
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
            const response = await instance.get<ApiResponse<Direk[]>>("agDirek", {
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
            console.error("Fetch AgDirek error:", error);
            throw error;
        }
    }

    /**
     * Fetch all AG Direk feature types.
     * @returns A promise that resolves to the list of AG Direk feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>("agDirek/types");
            return response.data;
        } catch (error) {
            console.error("Fetch AgDirek types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of AG Direk features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of AG Direk features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("agDirek/count", {
                params: {
                    query
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("Fetch AgDirek count error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the OG Mus Direk API
 */
export class OgMusDirekApi {
    /**
     * Fetch all OG Mus Direk features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of OG Mus Direk features.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent) {
        try {
            const response = await instance.get<ApiResponse<Direk[]>>("ogMusDirek", {
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
            console.error("Fetch OgMusDirek error:", error);
            throw error;
        }
    }

    /**
     * Fetch all OG Mus Direk feature types.
     * @returns A promise that resolves to the list of OG Mus Direk feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>("ogMusDirek/types");
            return response.data;
        } catch (error) {
            console.error("Fetch OgMusDirek types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of OG Mus Direk features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of OG Mus Direk features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("ogMusDirek/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            console.error("Fetch OgMusDirek count error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the Ayd Direk API
 */
export class AydDirekApi {
    /**
     * Fetch all Ayd Direk features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of Ayd Direk features.
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
            const response = await instance.get<ApiResponse<Direk[]>>("aydDirek", {
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
            console.error("Fetch AydDirek error:", error);
            throw error;
        }
    }

    /**
     * Fetch all Ayd Direk feature types.
     * @returns A promise that resolves to the list of Ayd Direk feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>("aydDirek/types");
            return response.data;
        } catch (error) {
            console.error("Fetch AydDirek types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of Ayd Direk features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of Ayd Direk features.
     */
    static async fetchCount(
        query: string = null!
    ) {
        try {
            const response = await instance.get<ApiResponse<number>>("aydDirek/count", {
                params: {
                    query
                }
            });
            return response.data;
        } catch (error) {
            console.error("Fetch AydDirek count error:", error);
            throw error;
        }
    }
}