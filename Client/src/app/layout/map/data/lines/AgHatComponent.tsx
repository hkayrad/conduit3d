import { useCallback, useEffect } from "react";
import type { Extent, Hat } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils";
import { setType } from "../../mapSlice";
import { useDispatch } from "react-redux";
import { AgHatApi } from "../../../../../lib/api";
import { FeatureType } from "../../../../../lib/enums";

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

    const dispatch = useDispatch();

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
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.LINE,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        kesit: rawData.kesit
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -1);
                dataList.features.push(...segments);
            })

            setData(dataList);
        } catch (error) {
            console.error("Error fetching AgHat data:", error);
        }
    }, [extent]);

    const handleAgHatTypesFetch = useCallback(async () => {
        try {
            const response = await AgHatApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: "agHat", types: response.data }));
        } catch (error) {
            console.error("Error fetching AgHat types:", error);
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