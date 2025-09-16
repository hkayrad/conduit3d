import { useCallback, useEffect } from "react";
import { TrafoBinaApi } from "../../../../../lib/api";
import type { Extent, TrafoBina } from "../../../../../lib/types";
import { FeatureType } from "../../../../../lib/enums";
import { Logger } from "../../../../../lib/utils/logger";
import { wkbToGeoJSON } from "../../../../../lib/utils";

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
        try {
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
                    geometry: wkbToGeoJSON(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.TRAFO,
                        adi: rawData.adi,
                        kodu: rawData.kodu,
                        yukseklik: 2
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        } catch (error) {
            Logger.error("Error fetching TrafoBina data:", error);
        }
    }, [extent]);

    useEffect(() => {
        handleTrafoBinaFetch();
    }, [extent]);

    return null;
} 