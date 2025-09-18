import { useEffect, useRef } from "react";
import type { Extent } from "../../../../../lib/types"
import { AdrBinaApi } from "../../../../../lib/api";
import { FeatureType } from "../../../../../lib/enums";
import { Logger, wkbToGeometry, handleDataFetch } from "../../../../../lib/utils";
import { CHUNK_SIZE, DEFAULT_FLOOR_COUNT, DEFAULT_FLOOR_HEIGHT } from "../../../../../lib/constants";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>,
    extent: Extent
}

/**
 * AdrBinaComponent is responsible for fetching and rendering the ADR BINA data.
 * @component
 * @param props - The props for the component
 */
export default function AdrBinaComponent(props: Props): null {
    const { setData, extent } = props;
    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const fetchNextChunk = async (page: number, signal?: AbortSignal): Promise<GeoJSON.FeatureCollection> => {
        try {
            const response = await AdrBinaApi.fetchAllProto(CHUNK_SIZE, page, 'Id', true, null!, extent);
            console.log(response);

            if (signal?.aborted) {
                Logger.debug("Request aborted");
                return { type: "FeatureCollection", features: [] };
            }

            if (!response.isSuccess) {
                Logger.error("Error fetching Building data");
                return { type: "FeatureCollection", features: [] };
            }

            const formattedData: GeoJSON.Feature[] = response.data.map((rawData) => (
                {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.BUILDING,
                        adi: rawData.adi,
                        kodu: rawData.kodu,
                        siteAdi: rawData.siteAdi,
                        binaKatSayisi: rawData.binaKatSayisi,
                        daireSayisi: rawData.daireSayisi,
                        isyeriSayisi: rawData.isyeriSayisi,
                        // Assumed average floor count as 5 and floor height as 2.5 meters if not provided
                        yukseklik: rawData.yukseklik || ((rawData.binaKatSayisi || DEFAULT_FLOOR_COUNT) * DEFAULT_FLOOR_HEIGHT),
                    }
                }
            ));

            return {
                type: "FeatureCollection",
                features: formattedData
            };
        } catch (error) {
            Logger.error("Error fetching AdrBina data:", error);
            throw error;
        }
    }

    useEffect(() => {
        handleDataFetch(isLoadingRef, abortControllerRef, extent, fetchNextChunk, setData);
    }, [extent])

    return null;
} 