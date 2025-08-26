import { useEffect } from "react";
import { AgDirekApi } from "../../../../../lib/api/poles";
import type { Direk } from "../../../../../lib/types";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>
}

export default function AgDirekComponent(props: Props) {
    const { setData } = props;

    const handleAgDirekFetch = async () => {
        const response = await AgDirekApi.fetchAll();

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
        handleAgDirekFetch();
    }, [])

    return null;
}