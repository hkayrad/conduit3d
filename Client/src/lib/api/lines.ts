import instance from "../instance";
import type { ApiResponse, Extent, Hat, Rekortman } from "../types";

/**
 * Class representing the AG Hat API
 */
export class AgHatApi {
    /**
     * Fetch all AG Hat features within the specified extent.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of AG Hat features.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Hat[]>>(
            "agHat",
            {
                params: {
                    minX: extent.minX,
                    minY: extent.minY,
                    maxX: extent.maxX,
                    maxY: extent.maxY
                }
            }
        );
        return response.data;
    }

    /**
     * Fetch all AG Hat feature types.
     * @returns A promise that resolves to the list of AG Hat feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>(
            "agHat/types"
        );
        return response.data;
    }
}

/**
 * Class representing the OG Hat API
 */
export class OgHatApi {
    /**
     * Fetch all OG Hat features within the specified extent.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of OG Hat features.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Hat[]>>(
            "ogHat",
            {
                params: {
                    minX: extent.minX,
                    minY: extent.minY,
                    maxX: extent.maxX,
                    maxY: extent.maxY
                }
            });

        return response.data;
    }

    /**
     * Fetch all OG Hat feature types.
     * @returns A promise that resolves to the list of OG Hat feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>(
            "ogHat/types"
        );
        return response.data;
    }
}

/**
 * Class representing the Rekortman API
 */
export class RekortmanApi {
    /**
     * Fetch all Rekortman features within the specified extent.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of Rekortman features.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Rekortman[]>>(
            "rekortman",
            {
                params: {
                    minX: extent.minX,
                    minY: extent.minY,
                    maxX: extent.maxX,
                    maxY: extent.maxY
                }
            }
        );
        return response.data;
    }

    /**
     * Fetch all Rekortman feature types.
     * @returns A promise that resolves to the list of Rekortman feature types.
     */
    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>(
            "rekortman/types"
        );
        return response.data;
    }
}