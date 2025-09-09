import { useCallback, useEffect } from "react";
import type { AdrBina, Extent } from "../../../../../lib/types"
import { AdrBinaApi } from "../../../../../lib/api";
import { FeatureType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * AdrBinaComponent is responsible for fetching and rendering the ADR BINA data.
 * @component
 * @param props - The props for the component
 */
export default function AdrBinaComponent(props: Props): null {
    const { setData, extent } = props;

    const handleAdrBinaFetch = useCallback(async () => {
        try {
            const response = await AdrBinaApi.fetchAll(200000, 1, 'id', true, null!, extent);

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
                        name: rawData.name,
                        type: rawData.type,
                        floorCount: rawData.floorCount,
                        height: rawData.floorCount * 3,
                    }
                } as GeoJSON.Feature;
                if (rawData.name !== "SANAL_BINA") {
                    dataList.features.push(feature);
                }
            });

            setData(dataList);
        } catch (error) {
            console.error("Error fetching AdrBina data:", error);
        }
    }, [extent]);

    useEffect(() => {
        handleAdrBinaFetch()
    }, [extent])

    return null;
} 