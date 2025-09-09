import { useCallback, useEffect } from "react";
import { RekortmanApi } from "../../../../../lib/api";
import type { Extent, Rekortman } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";
import { FeatureType } from "../../../../../lib/enums";

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

    const dispatch = useDispatch();

    const handleRekortmanFetch = useCallback(async () => {
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
                    dataType: FeatureType.REKORTMAN,
                    tipi: rawData.tipi,
                    kesit: rawData.kesit
                }
            } as GeoJSON.Feature;
            const segments = lineStringToSegments(feature, rawData.tipi, allPoles, -.1);
            dataList.features.push(...segments);
        })

        setData(dataList);
    }, [extent]);

    const handleRekortmanTypesFetch = useCallback(async () => {
        const response = await RekortmanApi.fetchTypes();

        if (!response.isSuccess) {
            return;
        }

        dispatch(setType({ key: "rekortman", types: response.data }));
        // dispatch(setFilter({ filter: "rekortman", tipi: response.data }));
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