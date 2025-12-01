// import type { CancelTokenSource } from "axios";
import instance from "../instance";
import type { ApiResponse, Armatur, Extent } from "../types";
import { Logger, capitalizeFirstLetter } from "../utils";
import { DEFAULT_EXTENT } from "../constants";

/**
 * Class representing the Armatur API
 */
export class ArmaturApi {
    /**
     * Fetch all Armatur features within the specified extent.
     * @param pageSize Number of features per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter features.
     * @param extent The geographical extent to filter the features.
     * @returns A promise that resolves to the list of Armatur features.
     */

    // private static _cancelTokens: { [key: string]: CancelTokenSource } = {};

    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = "id",
        ascending: boolean = true,
        query: string = null!,
        extent: Extent = DEFAULT_EXTENT,
    ) {
        try {
            const response = await instance.get<ApiResponse<Armatur[]>>("armatur", {
                params: {
                    pageSize,
                    pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending,
                    query,
                    ...extent,
                },
            });

            return response.data;
        } catch (error) {
            Logger.error("Fetch Armatur error:", error);
            throw error;
        }
    }

    /**
     * Create a new Armatur.
     * @param armatur The armatur data to create.
     * @returns A promise that resolves to the created Armatur.
     */
    static async create(armatur: Partial<Armatur>) {
        try {
            const response = await instance.post<ApiResponse<Armatur>>("armatur", armatur);
            return response.data;
        } catch (error) {
            Logger.error("Create Armatur error:", error);
            throw error;
        }
    }

    /**
     * Delete an Armatur by ID.
     * @param id The ID of the armatur to delete.
     * @returns A promise that resolves to true if deleted, false otherwise.
     */
    static async delete(id: number): Promise<boolean> {
        try {
            const response = await instance.delete(`armatur/${id}`);
            return response.data.isSuccess;
        } catch (error) {
            Logger.error("Delete Armatur error:", error);
            throw error;
        }
    }

    /**
     * Fetch all Armatur feature types.
     * @returns A promise that resolves to the list of Armatur feature types.
     */
    static async fetchTypes() {
        try {
            const response = await instance.get<ApiResponse<string[]>>("armatur/types");
            return response.data;
        } catch (error) {
            Logger.error("Fetch Armatur types error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of Armatur features.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of Armatur features.
     */
    static async fetchCount(query: string = null!, extent: Extent = DEFAULT_EXTENT) {
        try {
            const response = await instance.get<ApiResponse<number>>("armatur/count", {
                params: {
                    query,
                    ...extent,
                },
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch Armatur count error:", error);
            throw error;
        }
    }
}
