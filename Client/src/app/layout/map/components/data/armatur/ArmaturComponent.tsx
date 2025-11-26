import { useCallback, useEffect, useRef } from "react";
import { ArmaturApi } from "../../../../../../lib/api";
import type { Extent } from "../../../../../../lib/types";
import {
    FeatureType,
    C3D_MapViewType,
} from "../../../../../../lib/enums";
import {
    handleDataFetch,
    Logger,
    wkbToGeometry,
} from "../../../../../../lib/utils";
import { CHUNK_SIZE } from "../../../../../../lib/constants";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    extent: Extent;
    zoom: number;
    selectedViewType: C3D_MapViewType;
};

/**
 * ArmaturComponent is responsible for fetching and rendering the Armatur data.
 * @component
 * @param props - The props for the component
 */
export default function ArmaturComponent(props: Readonly<Props>): null {
    const { setData, extent, zoom, selectedViewType } = props;

    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const fetchNextChunk = useCallback(async (
        page: number,
        signal?: AbortSignal,
    ): Promise<GeoJSON.FeatureCollection> => {
        try {
            const response = await ArmaturApi.fetchAll(
                CHUNK_SIZE,
                page,
                "id",
                true,
                null!,
                extent,
            );

            if (signal?.aborted) {
                Logger.debug("Request aborted");
                return { type: "FeatureCollection", features: [] };
            }

            if (!response.isSuccess) {
                if (response.statusCode === 404) {
                    Logger.debug("No Armatur data found in the specified extent.");
                    return { type: "FeatureCollection", features: [] };
                }
                Logger.error("Error fetching Armatur data");
                return { type: "FeatureCollection", features: [] };
            }

            const formattedData: GeoJSON.Feature[] = response.data.map((rawData) => {
                return {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.ARMATUR,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        marka: rawData.marka,
                        model: rawData.model,
                        guc: rawData.guc,
                        bagli_tablo_kayit_id: rawData.bagli_tablo_kayit_id,
                    },
                };
            });

            return {
                type: "FeatureCollection",
                features: formattedData,
            };
        } catch (error) {
            if (error === "Request cancelled")
                Logger.warn("Request was cancelled by axios");
            Logger.error("Error fetching Armatur data:", error);
            throw error;
        }
    }, [extent])

    useEffect(() => {
        handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            zoom,
            selectedViewType,
            fetchNextChunk,
            setData,
        );
    }, [extent, zoom, selectedViewType, fetchNextChunk, setData]);

    return null;
}
