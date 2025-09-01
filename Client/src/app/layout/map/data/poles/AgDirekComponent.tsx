import { useCallback, useEffect } from "react";
import { AgDirekApi } from "../../../../../lib/api";
import type { Direk, Extent } from "../../../../../lib/types";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";
import { DataType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

export default function AgDirekComponent(props: Props) {
    const { setData, extent } = props;

    const dispatch = useDispatch();

    const handleAgDirekFetch = useCallback(async () => {
        const response = await AgDirekApi.fetchAll(extent);

        if (response.isSuccess) {
            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Direk) => {
                const height = Number(rawData.boyOzellik.split("/")[1]);
                const feature = {
                    type: "Feature",
                    geometry: JSON.parse(rawData.geoJson),
                    properties: {
                        id: rawData.id,
                        dataType: DataType.POLE,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        direkNo: rawData.direkNo,
                        boyOzellik: rawData.boyOzellik,
                        height: Number.isNaN(height) ? 10 : height,
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        }
    }, [extent]);

    const handleAgDirekTypesFetch = useCallback(async () => {
        const response = await AgDirekApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "agDirek", types: response.data }));
            // dispatch(setFilter({ filter: "agDirek", tipi: response.data }));
        }
    }, []);

    useEffect(() => {
        handleAgDirekFetch();
    }, [extent]);

    useEffect(() => {
        handleAgDirekTypesFetch();
    }, []);

    return null;
}