import { useCallback, useEffect } from "react";
import { TrafoBinaApi } from "../../../../../lib/api";
import type { Extent, TrafoBina } from "../../../../../lib/types";
import { DataType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

export default function TrafoBinaComponent(props: Props) {
    const { setData, extent } = props;

    const handleTrafoBinaFetch = useCallback(async () => {
        const response = await TrafoBinaApi.fetchAll(extent);

        if (response.isSuccess) {
            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: TrafoBina) => {
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        dataType: DataType.TRAFO,
                        name: rawData.name,
                        kodu: rawData.kodu,
                        height: 2
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        }
    }, [extent]);

    useEffect(() => {
        handleTrafoBinaFetch();
    }, [extent])

    return null;
} 