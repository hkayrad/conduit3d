import { useCallback, useEffect } from "react";
import type { Extent, Hat } from "../../../../../lib/types";
import { Logger, lineStringToSegments, wkbToGeometry } from "../../../../../lib/utils";
import { setType } from "../../mapSlice";
import { AgHatApi } from "../../../../../lib/api";
import { FeatureType } from "../../../../../lib/enums";
import { useAppDispatch } from "../../../../../lib/hooks";


type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

/**
 * AgHatComponent is responsible for fetching and rendering the AG HAT data.
 * @component
 * @param props - The props for the component
 */
export default function AgHatComponent(props: Props): null {
    const { setData, allPoles, extent } = props;

    const dispatch = useAppDispatch();

    const handleAgHatFetch = useCallback(async () => {
        try {
            const response = await AgHatApi.fetchAll(200000, 1, 'id', true, null!, extent);

            if (!response.isSuccess)
                return;

            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Hat) => {
                const feature = {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        cinsi: rawData.cinsi,
                        kesit: rawData.kesit,
                        tipi: rawData.tipi,
                        dataType: FeatureType.LINE
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -1);
                dataList.features.push(...segments);
            })

            setData(dataList);
        } catch (error) {
            Logger.error("Error fetching AgHat data:", error);
        }
    }, [extent, allPoles]);

    const handleAgHatTypesFetch = useCallback(async () => {
        try {
            const response = await AgHatApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: "agHat", types: response.data }));
        } catch (error) {
            Logger.error("Error fetching AgHat types:", error);
        }
    }, []);

    useEffect(() => {
        if (allPoles.length <= 0)
            return;

        handleAgHatFetch();
    }, [allPoles, extent]);

    useEffect(() => {
        handleAgHatTypesFetch();
    }, []);

    return null;
}