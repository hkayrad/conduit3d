import instance from "../instance";
import type { AdrBina, ApiResponse, Extent, TrafoBina } from "../types";
import { capitalizeFirstLetter } from "../utils";

/**
 * Class representing the ADR Bina API
 */
export class AdrBinaApi {
    /**
     * Fetch all ADR buildings within the specified extent.
     * @param {Extent} extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of ADR buildings.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        extent?: Extent
    ) {
        const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending: ascending,
                ...extent
            }
        });
        return response.data;
    }

    static async fetchCount() {
        const response = await instance.get<ApiResponse<number>>("adrBina/count");
        return response.data;
    }
}

/**
 * Class representing the Trafo Bina API
 */
export class TrafoBinaApi {
    /**
     * Fetch all transformer stations within the specified extent.
     * @param {Extent} extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of transformer stations.
     */
    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        extent?: Extent
    ) {
        const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina", {
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

    static async fetchCount() {
        const response = await instance.get<ApiResponse<number>>("trafoBina/count");
        return response.data;
    }
}