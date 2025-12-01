import { useCallback, useEffect, useRef } from "react";
import { AdrYolApi } from "../../../../../../lib/api";
import {
  C3D_MapLayers,
  FeatureType,
  type C3D_MapViewType,
} from "../../../../../../lib/enums";
import type { Extent } from "../../../../../../lib/types";
import { CHUNK_SIZE } from "../../../../../../lib/constants";
import {
  handleDataFetch,
  Logger,
  wkbToGeometry,
} from "../../../../../../lib/utils";
import { setType } from "../../../mapSlice";
import { useAppDispatch } from "../../../../../../lib/hooks";

type Props = {
  setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  extent: Extent;
  zoom: number;
  selectedViewType: C3D_MapViewType;
  refreshTrigger?: number;
};

/**
 * AdrYolComponent is responsible for fetching and rendering the ADR YOL data.
 * @component
 * @param props - The props for the component
 */
export default function AdrYolComponent(props: Readonly<Props>): null {
  const { setData, extent, zoom, selectedViewType, refreshTrigger } = props;
  const dispatch = useAppDispatch();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  const fetchNextChunk = useCallback(
    async (
      page: number,
      signal?: AbortSignal,
    ): Promise<GeoJSON.FeatureCollection> => {
      try {
        const response = await AdrYolApi.fetchAllProto(
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
            Logger.debug("No AdrYol data found in the specified extent.");
            return { type: "FeatureCollection", features: [] };
          }
          Logger.error("Error fetching AdrYol data");
          return { type: "FeatureCollection", features: [] };
        }

        const formattedData: GeoJSON.Feature[] = response.data.map(
          (rawData) => ({
            type: "Feature",
            geometry: wkbToGeometry(rawData.wkb),
            properties: {
              id: rawData.id,
              dataType: FeatureType.YOL,
              entityType: "AdrYol",
              genislik: rawData.genislik,
              seritSayisi: rawData.seritSayisi,
              yapisi: rawData.yapisi,
              tipi: rawData.tipi,
              kodu: rawData.kodu,
              adi: rawData.adi,
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
        Logger.error("Error fetching AdrYol data:", error);
        throw error;
      }
    },
    [extent],
  );

  const handleAdrYolTypesFetch = useCallback(async () => {
    try {
      const response = await AdrYolApi.fetchTypes();

      if (!response.isSuccess) return;

      dispatch(setType({ key: C3D_MapLayers.AdrYol, types: response.data }));
    } catch (error) {
      Logger.error("Error fetching AgHat types:", error);
    }
  }, [dispatch]);

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

  useEffect(() => {
    handleAdrYolTypesFetch();
  }, [handleAdrYolTypesFetch]);

  return null;
}
