import instance from "../instance";
import type { AdrBina, ApiResponse, Extent, TrafoBina } from "../types";

/**
 * Class representing the ADR Bina API
 */
export class AdrBinaApi {
    /**
     * Fetch all ADR buildings within the specified extent.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of ADR buildings.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
            params: {
                ...extent
            }
        });
        return response.data;
    }
}

/**
 * Class representing the Trafo Bina API
 */
export class TrafoBinaApi {
    /**
     * Fetch all transformer stations within the specified extent.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of transformer stations.
     */
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina", {
            params: {
                ...extent
            }
        });
        return response.data;
    }
}