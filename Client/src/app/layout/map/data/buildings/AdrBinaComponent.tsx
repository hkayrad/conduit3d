import { useEffect } from "react";
import type { AdrBina, Extent } from "../../../../../lib/types"
import { AdrBinaApi } from "../../../../../lib/api/buildings";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

export default function AdrBinaComponent(props: Props) {
    const { setData, extent } = props;

    const handleAdrBinaFetch = async () => {
        const response = await AdrBinaApi.fetchAll(extent);

        if (response.isSuccess) {
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
        }

    }

    useEffect(() => {
        handleAdrBinaFetch();
    }, [extent])

    return null;
} 