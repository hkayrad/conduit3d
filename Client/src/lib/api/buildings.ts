import type { CancelTokenSource } from "axios";
import instance from "../instance";
import type { AdrBina, ApiResponse, Building, Extent, TrafoBina } from "../types";
import { Logger, capitalizeFirstLetter } from "../utils";
import { AdrBinaResponse } from "../utils/protos/adrBinaProto";
import { BuildingsResponse } from "../utils/protos/buildingsProto";
import { TrafoBinaResponse } from "../utils/protos/trafoBinaProto";
import axios from "axios";

/**
 * Class representing the ADR Bina API
 */
export class AdrBinaApi {
    /**
     * Fetch all ADR buildings within the specified extent.
     * @param pageSize Number of buildings per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter buildings.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of ADR buildings.
     */
    private static _cancelTokens: { [key: string]: CancelTokenSource } = {};

    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ) {
        if (this._cancelTokens["fetchAll"])
            this._cancelTokens["fetchAll"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAll"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<AdrBina[]>>("adrBina", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAll"].token,
            });

            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of AdrBina.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of AdrBina.
     */
    static async fetchCount(
        query: string = null!
    ) {
        if (this._cancelTokens["fetchCount"])
            this._cancelTokens["fetchCount"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchCount"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<number>>("adrBina/count", {
                params: {
                    query,
                },
                cancelToken: this._cancelTokens["fetchCount"].token,
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina count error:", error);
            throw error;
        }
    }

    static async fetchAllProto(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ): Promise<AdrBinaResponse> {
        if (this._cancelTokens["fetchAllProto"])
            this._cancelTokens["fetchAllProto"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAllProto"] = axios.CancelToken.source();

        try {
            const protoResponse = await instance.get<ArrayBuffer>("adrBina/pbf", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAllProto"].token,
                headers: {
                    'Accept': 'application/x-protobuf'
                },
                responseType: 'arraybuffer',
            });

            const decodedData = AdrBinaResponse.decode(new Uint8Array(protoResponse.data));

            return decodedData;
        } catch (error) {
            Logger.error("Fetch AdrBina Proto error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the Trafo Bina API
 */
export class TrafoBinaApi {
    /**
     * Fetch all transformer stations within the specified extent.
     * @param pageSize Number of buildings per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter buildings.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of transformer stations.
     */
    private static _cancelTokens: { [key: string]: CancelTokenSource } = {};

    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ) {
        if (this._cancelTokens["fetchAll"])
            this._cancelTokens["fetchAll"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAll"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<TrafoBina[]>>("trafoBina", {
                params: {
                    pageSize,
                    pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending,
                    query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAll"].token,
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch TrafoBina error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of transformer stations.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of transformer stations.
     */
    static async fetchCount(
        query: string = null!
    ) {
        if (this._cancelTokens["fetchCount"])
            this._cancelTokens["fetchCount"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchCount"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<number>>("trafoBina/count", {
                params: {
                    query,
                },
                cancelToken: this._cancelTokens["fetchCount"].token,
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch TrafoBina count error:", error);
            throw error;
        }
    }

    static async fetchAllProto(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ): Promise<TrafoBinaResponse> {
        if (this._cancelTokens["fetchAllProto"])
            this._cancelTokens["fetchAllProto"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAllProto"] = axios.CancelToken.source();

        try {
            const protoResponse = await instance.get<ArrayBuffer>("trafoBina/pbf", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAllProto"].token,
                headers: {
                    'Accept': 'application/x-protobuf'
                },
                responseType: 'arraybuffer'
            });

            const decodedData = TrafoBinaResponse.decode(new Uint8Array(protoResponse.data));

            return decodedData;
        } catch (error) {
            Logger.error("Fetch TrafoBina Proto error:", error);
            throw error;
        }
    }
}

/**
 * Class representing the Buildings API
 */
export class BuildingsApi {
    /**
     * Fetch all ADR buildings within the specified extent.
     * @param pageSize Number of buildings per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter buildings.
     * @param extent The geographical extent to filter the buildings.
     * @returns A promise that resolves to the list of ADR buildings.
     */
    private static _cancelTokens: { [key: string]: CancelTokenSource } = {};

    static async fetchAll(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ) {
        if (this._cancelTokens["fetchAll"])
            this._cancelTokens["fetchAll"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAll"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<Building[]>>("buildings", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAll"].token,
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina error:", error);
            throw error;
        }
    }

    /**
     * Fetch the count of AdrBina.
     * @param query Optional search query to filter features.
     * @returns A promise that resolves to the count of AdrBina.
     */
    static async fetchCount(
        extent: Extent = null!,
        query: string = null!
    ) {
        if (this._cancelTokens["fetchCount"])
            this._cancelTokens["fetchCount"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchCount"] = axios.CancelToken.source();

        try {
            const response = await instance.get<ApiResponse<number>>("buildings/count", {
                params: {
                    ...extent,
                    query,
                },
                cancelToken: this._cancelTokens["fetchCount"].token,
            });
            return response.data;
        } catch (error) {
            Logger.error("Fetch AdrBina count error:", error);
            throw error;
        }
    }

    static async fetchAllProto(
        pageSize: number = 200000,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!,
        extent?: Extent
    ): Promise<BuildingsResponse> {
        if (this._cancelTokens["fetchAllProto"])
            this._cancelTokens["fetchAllProto"].cancel("Operation canceled due to new request.");

        this._cancelTokens["fetchAllProto"] = axios.CancelToken.source();

        try {
            const protoResponse = await instance.get<ArrayBuffer>("buildings/pbf", {
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    sortBy: capitalizeFirstLetter(sortBy),
                    ascending: ascending,
                    query: query,
                    ...extent,
                },
                cancelToken: this._cancelTokens["fetchAllProto"].token,
                headers: {
                    'Accept': 'application/x-protobuf'
                },
                responseType: 'arraybuffer'
            });
            Logger.debug("Fetched Buildings Proto:", protoResponse);
            const decodedData = BuildingsResponse.decode(new Uint8Array(protoResponse.data));
            Logger.debug("Decoded Buildings Proto:", decodedData);
            return decodedData;

        } catch (error) {
            Logger.error("Fetch Buildings Proto error:", error);
            throw error;
        }
    }
}