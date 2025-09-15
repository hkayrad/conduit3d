import { useCallback, useEffect } from "react";
import type { AdrBina, Extent } from "../../../../../lib/types"
import { BuildingsApi } from "../../../../../lib/api";
import { FeatureType } from "../../../../../lib/enums";
import { Logger } from "../../../../../lib/utils/logger";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * BuildingComponent is responsible for fetching and rendering the ADR BINA data.
 * @component
 * @param props - The props for the component
 */
export default function BuildingComponent(props: Props): null {
    const { setData, extent } = props;

    const handleBuildingFetch = useCallback(async () => {
        try {
            const response = await BuildingsApi.fetchAll(200000, 1, 'id', true, null!, extent);

            if (!response.isSuccess)
                return;

            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: AdrBina) => {
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
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
                        yukseklik: rawData.yukseklik || ((rawData.binaKatSayisi || 5) * 2.5),
                    }
                } as GeoJSON.Feature;

                // Exclude "SANAL_BINA" from the dataset because they show trafo or poles
                if (rawData.adi !== "SANAL_BINA") {
                    dataList.features.push(feature);
                }
            });

            setData(dataList);
        } catch (error) {
            Logger.error("Error fetching AdrBina data:", error);
        }
    }, [extent]);

    useEffect(() => {
        handleBuildingFetch()
    }, [extent])

    return null;
} 