import { useCallback, useEffect } from "react";
import { AydDirekApi } from "../../../../../lib/api";
import type { Direk, Extent } from "../../../../../lib/types";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";
import { DataType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * AydDirekComponent is responsible for fetching and rendering the AYD direk data.
 * @component
 * @param props - The props for the component
 */
export default function AydDirekComponent(props: Props) {
    const { setData, extent } = props;

    const dispatch = useDispatch();

    const handleAydDirekFetch = useCallback(async () => {
        const response = await AydDirekApi.fetchAll(extent);

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

    const handleAydDirekTypesFetch = useCallback(async () => {
        const response = await AydDirekApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "aydDirek", types: response.data }));
            // dispatch(setFilter({ filter: "aydDirek", tipi: response.data }));
        }
    }, []);

    useEffect(() => {
        handleAydDirekFetch();
    }, [extent]);

    useEffect(() => {
        handleAydDirekTypesFetch();
    }, []);

    return null;
}