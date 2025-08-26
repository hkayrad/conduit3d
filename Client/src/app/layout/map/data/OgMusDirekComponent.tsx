import { useEffect } from "react";
import { OgMusDirekApi } from "../../../../lib/api/poles";
import type { Direk } from "../../../../lib/types";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>
}

export default function OgMusDirekComponent(props: Props) {
    const { setData } = props;

    const handleOgMusDirekFetch = async () => {
        const response = await OgMusDirekApi.fetchAll();

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
        handleOgMusDirekFetch();
    }, [])

    return null;
}