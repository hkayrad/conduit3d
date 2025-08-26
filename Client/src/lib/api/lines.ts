import instance from "../instance";
import type { ApiResponse, Hat } from "../types";

export class AgHatApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Hat[]>>("agHat");
        return response.data;
    }
}

export class OgHatApi {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Hat[]>>("ogHat");
        return response.data;
    }
}

export class Rekortman {
    static async fetchAll() {
        const response = await instance.get<ApiResponse<Rekortman[]>>("rekortman");
        return response.data;
    }
}