import { useCallback, useEffect, useRef } from "react";
import { AydDirekApi } from "../../../../../../lib/api";
import type { Extent } from "../../../../../../lib/types";
import { setType } from "../../../mapSlice";
import { FeatureType, C3D_MapLayers, C3D_MapViewType } from "../../../../../../lib/enums";
import { useAppDispatch } from "../../../../../../lib/hooks";
import { handleDataFetch, Logger, wkbToGeometry } from "../../../../../../lib/utils";
import { CHUNK_SIZE } from "../../../../../../lib/constants";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>,
    extent: Extent,
    zoom: number,
    selectedViewType: C3D_MapViewType
}

/**
 * AydDirekComponent is responsible for fetching and rendering the AYD direk data.
 * @component
 * @param props - The props for the component
 */
export default function AydDirekComponent(props: Props): null {
    const { setData, extent, zoom, selectedViewType } = props;

    const dispatch = useAppDispatch();

    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const fetchNextChunk = async (page: number, signal?: AbortSignal): Promise<GeoJSON.FeatureCollection> => {
        try {
            const response = await AydDirekApi.fetchAllProto(CHUNK_SIZE, page, 'id', true, null!, extent);

            if (signal?.aborted) {
                Logger.debug("Request aborted");
                return { type: "FeatureCollection", features: [] };
            }

            if (!response.isSuccess) {
                if (response.statusCode === 404) {
                    Logger.debug("No AydDirek data found in the specified extent.");
                    return { type: "FeatureCollection", features: [] };
                }
                Logger.error("Error fetching AydDirek data");
                return { type: "FeatureCollection", features: [] };
            }

            const formattedData: GeoJSON.Feature[] = response.data.map((rawData) => {
                const height = Number(rawData.boyOzellik.split("/")[1]);
                return {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.POLE,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        direkNo: rawData.direkNo,
                        boyOzellik: rawData.boyOzellik,
                        direkBoyId: rawData.direkBoyId,
                        yukseklik: Number.isNaN(height) ? 10 : height,
                    }
                }
            });

            return {
                type: "FeatureCollection",
                features: formattedData
            };
        } catch (error) {
            if (error === "Request cancelled") {
                Logger.warn("Request was cancelled by axios");
                return Promise.reject(error);
            }
            Logger.error("Error fetching AydDirek data:", error);
            throw error;
        }
    }

    const handleAydDirekTypesFetch = useCallback(async () => {
        try {
            const response = await AydDirekApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: C3D_MapLayers.AydDirek, types: response.data }));
        } catch (error) {
            Logger.error("Error fetching AydDirek types:", error);
        }
    }, []);

    useEffect(() => {
        handleDataFetch(isLoadingRef, abortControllerRef, extent, zoom, selectedViewType, fetchNextChunk, setData);
    }, [extent, zoom, selectedViewType]);

    useEffect(() => {
        handleAydDirekTypesFetch();
    }, []);

    return null;
}