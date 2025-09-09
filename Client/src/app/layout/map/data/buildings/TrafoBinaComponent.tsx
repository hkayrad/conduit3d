import { useCallback, useEffect } from "react";
import { TrafoBinaApi } from "../../../../../lib/api";
import type { Extent, TrafoBina } from "../../../../../lib/types";
import { FeatureType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * TrafoBinaComponent is responsible for fetching and rendering the TRAFO BINA data.
 * @component
 * @param props - The props for the component
 */
export default function TrafoBinaComponent(props: Props): null {
    const { setData, extent } = props;

    const handleTrafoBinaFetch = useCallback(async () => {
        const response = await TrafoBinaApi.fetchAll(200000, 1, 'id', true, null!, extent);

        if (!response.isSuccess)
            return;

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
                    dataType: FeatureType.TRAFO,
                    name: rawData.name,
                    kodu: rawData.kodu,
                    height: 2
                }
            } as GeoJSON.Feature;
            dataList.features.push(feature);
        });

        setData(dataList);
    }, [extent]);

    useEffect(() => {
        handleTrafoBinaFetch();
    }, [extent]);

    return null;
} 