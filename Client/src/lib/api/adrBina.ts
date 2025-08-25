import instance from "../instance";
import type { AdrBina, ApiResponse, Extent } from "../types";

export default class AdrBinaApi {
    static async fetchAll(extent?: Extent): Promise<ApiResponse<AdrBina[]>> {
        const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
            params: { extent }
        });

        return response.data;
    }
}