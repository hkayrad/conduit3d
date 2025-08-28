import { useCallback, useEffect } from "react";
import { RekortmanApi } from "../../../../../lib/api/lines";
import type { Extent, Rekortman } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils/lineStringToSegments";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

export default function RekortmanComponent(props: Props) {
    const { setData, allPoles, extent } = props;

    const dispatch = useDispatch();

    const handleRekortmanFetch = useCallback(async () => {
        const response = await RekortmanApi.fetchAll(extent);

        if (response.isSuccess) {
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
                        tipi: rawData.tipi,
                        kesit: rawData.kesit
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.tipi, allPoles, -.1);
                dataList.features.push(...segments);
            })

            setData(dataList);
        }
    }, [extent]);

    const handleRekortmanTypesFetch = useCallback(async () => {
        const response = await RekortmanApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "rekortman", types: response.data }));
            // dispatch(setFilter({ filter: "rekortman", tipi: response.data }));
        }
    }, []);

    useEffect(() => {
        if (allPoles.length > 0)
            handleRekortmanFetch();
    }, [allPoles, extent]);

    useEffect(() => {
        handleRekortmanTypesFetch();
    }, []);

    return null;
}