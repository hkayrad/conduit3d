import instance from "../instance";
import type { ApiResponse, Direk, Extent } from "../types";

/** 
 * Class representing the AG Direk API 
 */
export class AgDirekApi {
    /**
     * Fetch all AG Direk features within the specified extent.
     * @param {Extent} extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of AG Direk features.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("agDirek", {
            params: {
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
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("ogMusDirek", {
            params: {
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
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("aydDirek", {
            params: {
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
}