import { useCallback, useEffect } from "react";
import { RekortmanApi } from "../../../../../lib/api";
import type { Extent, Rekortman } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils";
import { setType } from "../../mapSlice";
import { FeatureType, HatCinsi } from "../../../../../lib/enums";
import { useAppDispatch } from "../../../../../lib/hooks";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

/**
 * RekortmanComponent is responsible for fetching and rendering the REKORTMAN data.
 * @component
 * @param props - The props for the component
 */
export default function RekortmanComponent(props: Props): null {
    const { setData, allPoles, extent } = props;

    const dispatch = useAppDispatch();

    const handleRekortmanFetch = useCallback(async () => {
        try {
            const response = await RekortmanApi.fetchAll(200000, 1, 'id', true, null!, extent);

            if (!response.isSuccess)
                return;

            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Rekortman) => {
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        kesit: rawData.kesit,
                        tipi: rawData.tipi,
                        dataType: FeatureType.REKORTMAN
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.tipi as HatCinsi, allPoles, -.1);
                dataList.features.push(...segments);
            })

            setData(dataList);
        } catch (error) {
            console.error("Error fetching Rekortman data:", error);
        }
    }, [extent]);

    const handleRekortmanTypesFetch = useCallback(async () => {
        try {
            const response = await RekortmanApi.fetchTypes();

            if (!response.isSuccess) {
                return;
            }

            dispatch(setType({ key: "rekortman", types: response.data }));
        } catch (error) {
            console.error("Error fetching Rekortman types:", error);
        }
    }, []);

    useEffect(() => {
        if (allPoles.length <= 0)
            return;

        handleRekortmanFetch();
    }, [allPoles, extent]);

    useEffect(() => {
        handleRekortmanTypesFetch();
    }, []);

    return null;
}