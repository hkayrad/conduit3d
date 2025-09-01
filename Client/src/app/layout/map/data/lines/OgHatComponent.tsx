import { useCallback, useEffect } from "react";
import { OgHatApi } from "../../../../../lib/api";
import type { Extent, Hat } from "../../../../../lib/types";
import { lineStringToSegments } from "../../../../../lib/utils";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";
import { DataType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    allPoles: GeoJSON.Feature[],
    extent: Extent
}

export default function OgHatComponent(props: Props) {
    const { setData, allPoles, extent } = props;

    const dispatch = useDispatch();

    const handleOgHatFetch = useCallback(async () => {
        const response = await OgHatApi.fetchAll(extent);

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
                        dataType: DataType.LINE,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        kesit: rawData.kesit
                    }
                } as GeoJSON.Feature;
                const segments = lineStringToSegments(feature, rawData.cinsi, allPoles, -.25);
                dataList.features.push(...segments);
            })

            setData(dataList);
        }
    }, [extent]);

    const handleOgHatTypesFetch = useCallback(async () => {
        const response = await OgHatApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "ogHat", types: response.data }));
            // dispatch(setFilter({ filter: "ogHat", tipi: response.data }));
        }
    }, []);

    useEffect(() => {
        if (allPoles.length > 0)
            handleOgHatFetch();
    }, [allPoles, extent]);

    useEffect(() => {
        handleOgHatTypesFetch();
    }, []);

    return null;
}