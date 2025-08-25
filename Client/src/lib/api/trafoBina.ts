import instance from "../instance";
import type { ApiResponse, Extent, Trafo } from "../types";

export default class TrafoBinaApi {
    static async fetchAll(extent?: Extent): Promise<ApiResponse<Trafo[]>> {
        const response = await instance.get<ApiResponse<Trafo[]>>("trafoBina", {
            params: { extent }
        });

        return response.data;
    }
}