import { useCallback, useEffect, useRef } from "react";
import type { Extent } from "../../../../../../lib/types";
import { Logger, handleDataFetch, lineStringToSegments, wkbToGeometry } from "../../../../../../lib/utils";
import { setType } from "../../../mapSlice";
import { AgHatApi } from "../../../../../../lib/api";
import { FeatureType, HatCinsi, C3D_MapLayers, C3D_MapViewType } from "../../../../../../lib/enums";
import { useAppDispatch } from "../../../../../../lib/hooks";
import { CHUNK_SIZE } from "../../../../../../lib/constants";


type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>
    allPoles: GeoJSON.Feature[],
    extent: Extent,
    zoom: number,
    selectedViewType: C3D_MapViewType
}

/**
 * AgHatComponent is responsible for fetching and rendering the AG HAT data.
 * @component
 * @param props - The props for the component
 */
export default function AgHatComponent(props: Readonly<Props>): null {
    const { setData, allPoles, extent, zoom, selectedViewType } = props;

    const dispatch = useAppDispatch();

    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const fetchNextChunk = async (page: number, signal?: AbortSignal): Promise<GeoJSON.FeatureCollection> => {
        try {
            const response = await AgHatApi.fetchAllProto(CHUNK_SIZE, page, 'id', true, null!, extent);

            if (signal?.aborted) {
                Logger.debug("Request aborted");
                return { type: "FeatureCollection", features: [] };
            }

            if (!response.isSuccess) {
                if (response.statusCode === 404) {
                    Logger.debug("No AgHat data found in the specified extent.");
                    return { type: "FeatureCollection", features: [] };
                }
                Logger.error("Error fetching AgHat data");
                return { type: "FeatureCollection", features: [] };
            }

            const allSegments: GeoJSON.Feature[] = [];

            for(const rawData of response.data) {
                const feature = {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.LINE,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        cinsi: rawData.cinsi,
                        kesit: rawData.kesit,
                        tipi: rawData.tipi
                    }
                }
                const segments: GeoJSON.Feature[] = lineStringToSegments(feature, rawData.cinsi as HatCinsi, allPoles, -1);
                allSegments.push(...segments);
            };

            return {
                type: "FeatureCollection",
                features: allSegments
            };
        } catch (error) {
            if (error === "Request cancelled")
                Logger.warn("Request was cancelled by axios");
            Logger.error("Error fetching AgHat data:", error);
            throw error;
        }
    }

    const handleAgHatTypesFetch = useCallback(async () => {
        try {
            const response = await AgHatApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: C3D_MapLayers.AgHat, types: response.data }));
        } catch (error) {
            Logger.error("Error fetching AgHat types:", error);
        }
    }, []);

    useEffect(() => {
        if (allPoles.length <= 0)
            return;

        handleDataFetch(isLoadingRef, abortControllerRef, extent, zoom, selectedViewType, fetchNextChunk, setData);
    }, [allPoles, extent]);

    useEffect(() => {
        handleAgHatTypesFetch();
    }, []);

    return null;
}