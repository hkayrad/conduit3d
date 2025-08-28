import { useCallback, useEffect } from "react";
import { OgMusDirekApi } from "../../../../../lib/api/poles";
import type { Direk, Extent } from "../../../../../lib/types";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

export default function OgMusDirekComponent(props: Props) {
    const { setData, extent } = props;

    const dispatch = useDispatch();

    const handleOgMusDirekFetch = useCallback(async () => {
        const response = await OgMusDirekApi.fetchAll(extent);

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
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        direkNo: rawData.direkNo,
                        height: Number.isNaN(height) ? 10 : height,
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        }
    }, [extent]);

    const handleOgMusDirekTypesFetch = useCallback(async () => {
        const response = await OgMusDirekApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "ogMusDirek", types: response.data }));
        }
    }, []);

    useEffect(() => {
        handleOgMusDirekFetch();
    }, [extent]);

    useEffect(() => {
        handleOgMusDirekTypesFetch();
    }, []);

    return null;
}