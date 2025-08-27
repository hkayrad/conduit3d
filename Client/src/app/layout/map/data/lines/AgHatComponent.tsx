import { useEffect } from "react";
import { AgHatApi } from "../../../../../lib/api/lines";
import type { Extent, Hat } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils/lineStringToSegments";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

export default function AgHatComponent(props: Props) {
    const { setData, allPoles, extent } = props;

    const handleAgHatFetch = async () => {
        const response = await AgHatApi.fetchAll(extent);

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
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -1);
                dataList.features.push(...segments);
            })

            setData(dataList);
        }
    }

    useEffect(() => {
        if (allPoles.length > 0)
            handleAgHatFetch();
    }, [allPoles, extent]);

    return null;
}