import { useCallback, useEffect, useRef } from "react";
import { RekortmanApi } from "../../../../../lib/api";
import type { Extent } from "../../../../../lib/types";
import { Logger, handleDataFetch, lineStringToSegments, wkbToGeometry } from "../../../../../lib/utils";
import { setType } from "../../mapSlice";
import { FeatureType, HatCinsi, C3D_MapLayers } from "../../../../../lib/enums";
import { useAppDispatch } from "../../../../../lib/hooks";
import { CHUNK_SIZE } from "../../../../../lib/constants";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>,
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

/**
 * RekortmanComponent is responsible for fetching and rendering the REKORTMAN data.
 * @component
 * @param props - The props for the component
 */
export default function RekortmanComponent(props: Props): null {
    const { setData, allPoles, extent } = props;

    const dispatch = useAppDispatch();

    const abortControllerRef = useRef<AbortController | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const fetchNextChunk = async (page: number, signal?: AbortSignal): Promise<GeoJSON.FeatureCollection> => {
        try {
            const response = await RekortmanApi.fetchAllProto(CHUNK_SIZE, page, 'id', true, null!, extent);

            if (signal?.aborted) {
                Logger.debug("Request aborted");
                return { type: "FeatureCollection", features: [] };
            }

            if (!response.isSuccess) {
                if (response.statusCode === 404) {
                    Logger.debug("No Rekortman data found in the specified extent.");
                    return { type: "FeatureCollection", features: [] };
                }
                Logger.error("Error fetching Rekortman data");
                return { type: "FeatureCollection", features: [] };
            }

            const allSegments: GeoJSON.Feature[] = [];

            response.data.map((rawData) => {
                const feature = {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.LINE,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        kesit: rawData.kesit,
                        tipi: rawData.tipi
                    }
                }
                const segments: GeoJSON.Feature[] = lineStringToSegments(feature, rawData.tipi as HatCinsi, allPoles, -.1);
                allSegments.push(...segments);
            });

            return {
                type: "FeatureCollection",
                features: allSegments
            };
        } catch (error) {
            if (error === "Request cancelled") {
                Logger.warn("Request was cancelled by axios");
                return Promise.reject(error);
            }
            Logger.error("Error fetching AgHat data:", error);
            throw error;
        }
    }

    const handleRekortmanTypesFetch = useCallback(async () => {
        try {
            const response = await RekortmanApi.fetchTypes();

            if (!response.isSuccess) {
                return;
            }

            dispatch(setType({ key: C3D_MapLayers.Rekortman, types: response.data }));
        } catch (error) {
            Logger.error("Error fetching Rekortman types:", error);
        }
    }, []);

    useEffect(() => {
        if (allPoles.length <= 0)
            return;

        handleDataFetch(isLoadingRef, abortControllerRef, extent, fetchNextChunk, setData);
    }, [allPoles, extent]);

    useEffect(() => {
        handleRekortmanTypesFetch();
    }, []);

    return null;
}