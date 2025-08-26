import { useEffect } from "react";
import { OgHatApi } from "../../../../../lib/api/lines";
import type { Hat } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils/lineStringToSegments";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>
    agDirek: GeoJSON.FeatureCollection,
    ogMusDirek: GeoJSON.FeatureCollection,
    aydDirek: GeoJSON.FeatureCollection,
}

export default function OgHatComponent(props: Props) {
    const { setData, agDirek, ogMusDirek, aydDirek } = props;

    const handleOgHatFetch = async () => {
        const response = await OgHatApi.fetchAll();
        const allPoles = [...agDirek.features, ...ogMusDirek.features, ...aydDirek.features];

        if (response.isSuccess) {
            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };


            response.data.forEach((rawData: Hat) => {
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        kesit: rawData.kesit
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -.25);
                dataList.features.push(...segments);
            })

            setData(dataList);
        }
    }

    useEffect(() => {
        if (agDirek && ogMusDirek && aydDirek) {
            handleOgHatFetch();
        }
    }, [agDirek, ogMusDirek, aydDirek]);

    return null;
}