import instance from "../instance";
import type { ApiResponse, Direk, Extent } from "../types";
import { capitalizeFirstLetter } from "../utils";

/** 
 * Class representing the AG Direk API 
 */
export class AgDirekApi {
    /**
     * Fetch all AG Direk features within the specified extent.
     * @param {Extent} extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of AG Direk features.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        extent?: Extent
    ) {
        const response = await instance.get<ApiResponse<Direk[]>>("agDirek", {
            params: {
                pageSize,
                pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending,
                ...extent
            }
        });
        return response.data;
    }

    /**
     * Fetch all AG Direk feature types.
     * @returns A promise that resolves to the list of AG Direk feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("agDirek/types");
        return response.data;
    }

    static async fetchCount() {
        const response = await instance.get<ApiResponse<number>>("agDirek/count");
        return response.data;
    }
}

/**
 * Class representing the OG Mus Direk API
 */
export class OgMusDirekApi {
    /**
     * Fetch all OG Mus Direk features within the specified extent.
     * @param {Extent} extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of OG Mus Direk features.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        extent?: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("ogMusDirek", {
            params: {
                pageSize,
                pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending,
                ...extent
            }
        });
        return response.data;
    }

    /**
     * Fetch all OG Mus Direk feature types.
     * @returns A promise that resolves to the list of OG Mus Direk feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("ogMusDirek/types");
        return response.data;
    }

    static async fetchCount() {
        const response = await instance.get<ApiResponse<number>>("ogMusDirek/count");
        return response.data;
    }
}

/**
 * Class representing the Ayd Direk API
 */
export class AydDirekApi {
    /**
     * Fetch all Ayd Direk features within the specified extent.
     * @param {Extent} extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of Ayd Direk features.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        extent?: Extent
    ) {
        const response = await instance.get<ApiResponse<Direk[]>>("aydDirek", {
            params: {
                pageSize,
                pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending,
                ...extent
            }
        });
        return response.data;
    }

    /**
     * Fetch all Ayd Direk feature types.
     * @returns A promise that resolves to the list of Ayd Direk feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("aydDirek/types");
        return response.data;
    }

    static async fetchCount() {
        const response = await instance.get<ApiResponse<number>>("aydDirek/count");
        return response.data;
    }
}