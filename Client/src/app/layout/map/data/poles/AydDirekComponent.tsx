import { useEffect } from "react";
import { AydDirekApi } from "../../../../../lib/api/poles";
import type { Direk, Extent } from "../../../../../lib/types";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

export default function AydDirekComponent(props: Props) {
    const { setData, extent } = props;

    const handleAydDirekFetch = async () => {
        const response = await AydDirekApi.fetchAll(extent);

        if (response.isSuccess) {
            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Direk) => {
                const height = Number(rawData.boyOzellik.split("/")[1]);
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        direkNo: rawData.direkNo,
                        height: Number.isNaN(height) ? 10 : height,
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        }

    }

    useEffect(() => {
        handleAydDirekFetch();
    }, [extent])

    return null;
}