import { useCallback, useEffect } from "react";
import { OgHatApi } from "../../../../../lib/api";
import type { Extent, Hat } from "../../../../../lib/types";
import { lineStringToSegments, wkbToGeoJSON } from "../../../../../lib/utils";
import { setType } from "../../mapSlice";
import { FeatureType } from "../../../../../lib/enums";
import { useAppDispatch } from "../../../../../lib/hooks";
import { Logger } from "../../../../../lib/utils/logger";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

/**
 * OgHatComponent is responsible for fetching and rendering the OG HAT data.
 * @component
 * @param props - The props for the component
 */
export default function OgHatComponent(props: Props): null {
    const { setData, allPoles, extent } = props;

    const dispatch = useAppDispatch();

    const handleOgHatFetch = useCallback(async () => {
        try {
            const response = await OgHatApi.fetchAll(200000, 1, 'id', true, null!, extent);

            if (!response.isSuccess)
                return;

            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Hat) => {
                const feature = {
                    type: "Feature",
                    geometry: wkbToGeoJSON(rawData.wkb),
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
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -.25);
                dataList.features.push(...segments);
            })

            setData(dataList);
        } catch (error) {
            Logger.error("Error fetching OgHat data:", error);
        }
    }, [extent, allPoles]);

    const handleOgHatTypesFetch = useCallback(async () => {
        try {
            const response = await OgHatApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: "ogHat", types: response.data }));
        } catch (error) {
            Logger.error("Error fetching OgHat types:", error);
        }
    }, []);

    useEffect(() => {
        if (allPoles.length <= 0)
            return;

        handleOgHatFetch();
    }, [allPoles, extent]);

    useEffect(() => {
        handleOgHatTypesFetch();
    }, []);

    return null;
}