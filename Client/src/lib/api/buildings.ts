import instance from "../instance";
import type { AdrBina, ApiResponse, TrafoBina } from "../types";

export class AdrBinaApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina");
        return response.data;
    }
}

export class TrafoBinaApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina");
        return response.data;
    }
}