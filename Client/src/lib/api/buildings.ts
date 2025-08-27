import instance from "../instance";
import type { AdrBina, ApiResponse, Extent, TrafoBina } from "../types";

export class AdrBinaApi {
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
            params: {
                ...extent
            }
        });
        return response.data;
    }
}

export class TrafoBinaApi {
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina", {
            params: {
                ...extent
            }
        });
        return response.data;
    }
}