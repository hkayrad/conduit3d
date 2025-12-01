import { useCallback, useEffect, useRef } from "react";
import { TrafoBinaApi } from "../../../../../../lib/api";
import type { Extent } from "../../../../../../lib/types";
import { C3D_MapViewType, FeatureType } from "../../../../../../lib/enums";
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
  refreshTrigger?: number;
};

/**
 * TrafoBinaComponent is responsible for fetching and rendering the TRAFO BINA data.
 * @component
 * @param props - The props for the component
 */
export default function TrafoBinaComponent(props: Readonly<Props>): null {
  const { setData, extent, zoom, selectedViewType, refreshTrigger } = props;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  const fetchNextChunk = useCallback(
    async (
      page: number,
      signal?: AbortSignal,
    ): Promise<GeoJSON.FeatureCollection> => {
      try {
        const response = await TrafoBinaApi.fetchAllProto(
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
          Logger.error("Error fetching Building data");
          return { type: "FeatureCollection", features: [] };
        }

        const formattedData: GeoJSON.Feature[] = response.data.map(
          (rawData) => ({
            type: "Feature",
            geometry: wkbToGeometry(rawData.wkb),
            properties: {
              id: rawData.id,
              dataType: FeatureType.TRAFO,
              entityType: "TrafoBina",
              adi: rawData.adi,
              kodu: rawData.kodu,
              yukseklik: 2,
            },
          }),
        );

        return {
          type: "FeatureCollection",
          features: formattedData,
        };
      } catch (error) {
        if (error === "Request cancelled")
          Logger.warn("Request was cancelled by axios");
        Logger.error("Error fetching TrafoBina data:", error);
        throw error;
      }
    },
    [extent],
  );

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
  }, [extent, zoom, selectedViewType, fetchNextChunk, setData, refreshTrigger]);

  return null;
}
