import instance from "../instance";
import type { ApiResponse, Extent, Hat, Rekortman } from "../types";

export class AgHatApi {
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
}

export class OgHatApi {
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
}

export class RekortmanApi {
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
}