import instance from "../instance";
import type { ApiResponse, Direk } from "../types";

export class AgDirekApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Direk[]>>("agDirek");
        return response.data;
    }
}

export class OgMusDirekApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Direk[]>>("ogMusDirek");
        return response.data;
    }
}

export class AydDirekApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Direk[]>>("aydDirek");
        return response.data;
    }
}