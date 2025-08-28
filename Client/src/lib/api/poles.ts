import instance from "../instance";
import type { ApiResponse, Direk, Extent } from "../types";

export class AgDirekApi {
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("agDirek", {
            params: {
                ...extent
            }
        });
        return response.data;
    }

    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("agDirek/types");
        return response.data;
    }
}

export class OgMusDirekApi {
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("ogMusDirek", {
            params: {
                ...extent
            }
        });
        return response.data;
    }

    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("ogMusDirek/types");
        return response.data;
    }
}

export class AydDirekApi {
    static async fetchAll(extent: Extent) {
        const response = await instance.get<ApiResponse<Direk[]>>("aydDirek", {
            params: {
                ...extent
            }
        });
        return response.data;
    }

    static async fetchTypes() {
        const response = await instance.get<ApiResponse<string[]>>("aydDirek/types");
        return response.data;
    }
}