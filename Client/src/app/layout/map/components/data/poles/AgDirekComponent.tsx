import { useCallback, useEffect, useRef } from "react";
import { AgDirekApi } from "../../../../../../lib/api";
import type { Extent } from "../../../../../../lib/types";
import { setType } from "../../../mapSlice";
import {
  FeatureType,
  C3D_MapLayers,
  C3D_MapViewType,
} from "../../../../../../lib/enums";
import { useAppDispatch } from "../../../../../../lib/hooks";
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
 * AgDirekComponent is responsible for fetching and rendering the AG direk data.
 * @component
 * @param props - The props for the component
 */
export default function AgDirekComponent(props: Readonly<Props>): null {
  const { setData, extent, zoom, selectedViewType } = props;

  const dispatch = useAppDispatch();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  const fetchNextChunk = useCallback(async (
    page: number,
    signal?: AbortSignal,
  ): Promise<GeoJSON.FeatureCollection> => {
    try {
      const response = await AgDirekApi.fetchAllProto(
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
          Logger.debug("No AgDirek data found in the specified extent.");
          return { type: "FeatureCollection", features: [] };
        }
        Logger.error("Error fetching AgDirek data");
        return { type: "FeatureCollection", features: [] };
      }

      const formattedData: GeoJSON.Feature[] = response.data.map((rawData) => {
        const height = Number.parseFloat(
          rawData.boyOzellik.split("/")[0].replace(",", "."),
        );
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
            yukseklik: height ? height : 10,
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
      Logger.error("Error fetching AgDirek data:", error);
      throw error;
    }
  }, [extent])

  const handleAgDirekTypesFetch = useCallback(async () => {
    try {
      const response = await AgDirekApi.fetchTypes();

      if (!response.isSuccess) return;

      dispatch(setType({ key: C3D_MapLayers.AgDirek, types: response.data }));
    } catch (error) {
      Logger.error("Error fetching AgDirek types:", error);
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
  }, [extent, zoom, selectedViewType, fetchNextChunk, setData]);

  useEffect(() => {
    handleAgDirekTypesFetch();
  }, [handleAgDirekTypesFetch]);

  return null;
}
