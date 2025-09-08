import { useCallback, useEffect } from "react";
import { OgMusDirekApi } from "../../../../../lib/api";
import type { Direk, Extent } from "../../../../../lib/types";
import { useDispatch } from "react-redux";
import { setType } from "../../mapSlice";
import { FeatureType } from "../../../../../lib/enums";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * OgMusDirekComponent is responsible for fetching and rendering the OG MUS direk data.
 * @component
 * @param props - The props for the component
 */
export default function OgMusDirekComponent(props: Props): null {
    const { setData, extent } = props;

    const dispatch = useDispatch();

    const handleOgMusDirekFetch = useCallback(async () => {
        const response = await OgMusDirekApi.fetchAll(200000, 1, 'id', true, null!, extent);

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
                        dataType: FeatureType.POLE,
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

    const handleOgMusDirekTypesFetch = useCallback(async () => {
        const response = await OgMusDirekApi.fetchTypes();

        if (response.isSuccess) {
            dispatch(setType({ key: "ogMusDirek", types: response.data }));
            // dispatch(setFilter({ filter: "ogMusDirek", tipi: response.data }));
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