import { useCallback, useEffect } from "react";
import { AydDirekApi } from "../../../../../lib/api";
import type { Direk, Extent } from "../../../../../lib/types";
import { setType } from "../../mapSlice";
import { FeatureType } from "../../../../../lib/enums";
import { useAppDispatch } from "../../../../../lib/hooks";
import { Logger, wkbToGeometry } from "../../../../../lib/utils";

type Props = {
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>,
    extent: Extent
}

/**
 * AydDirekComponent is responsible for fetching and rendering the AYD direk data.
 * @component
 * @param props - The props for the component
 */
export default function AydDirekComponent(props: Props): null {
    const { setData, extent } = props;

    const dispatch = useAppDispatch();

    const handleAydDirekFetch = useCallback(async () => {
        try {
            const response = await AydDirekApi.fetchAll(200000, 1, 'id', true, null!, extent);

            if (!response.isSuccess)
                return;

            var dataList: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: []
            };

            response.data.forEach((rawData: Direk) => {
                const height = Number(rawData.boyOzellik.split("/")[1]);
                const feature = {
                    type: "Feature",
                    geometry: wkbToGeometry(rawData.wkb),
                    properties: {
                        id: rawData.id,
                        dataType: FeatureType.POLE,
                        kodu: rawData.kodu,
                        adi: rawData.adi,
                        cinsi: rawData.cinsi,
                        tipi: rawData.tipi,
                        direkNo: rawData.direkNo,
                        boyOzellik: rawData.boyOzellik,
                        direkBoyId: rawData.direkBoyId,
                        yukseklik: Number.isNaN(height) ? 10 : height,
                    }
                } as GeoJSON.Feature;
                dataList.features.push(feature);
            });

            setData(dataList);
        } catch (error) {
            Logger.error("Error fetching AydDirek data:", error);
        }
    }, [extent]);

    const handleAydDirekTypesFetch = useCallback(async () => {
        try {
            const response = await AydDirekApi.fetchTypes();

            if (!response.isSuccess)
                return;

            dispatch(setType({ key: "aydDirek", types: response.data }));
        } catch (error) {
            Logger.error("Error fetching AydDirek types:", error);
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