import { useMemo, useState } from "react";
import { useAppSelector } from "./reduxHooks";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { selectConfig } from "../../app/configSlice";
import { filterFeature, hexToRgba } from "../utils";
import { COLORS } from "../constants";

export function useYol() {
    const { visibility, filters, types } = useAppSelector(selectMapState);
    const config = useAppSelector(selectConfig);

    const [adrYol, setAdrYol] = useState<GeoJSON.FeatureCollection[]>([]);

     const adrYolFormatted = useMemo(() => {
            if (!adrYol || adrYol.length === 0)
                return [];
    
            const combinedFeatures = adrYol.flatMap(chunk => chunk?.features ?? []);
            const combinedCollection: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: combinedFeatures
            };
    
            return types.adrYol.map(type => {
                return {
                    id: `adr-yol-${type}`,
                    color: hexToRgba(config[`ADR_YOL_${type}_COLOR`]) || COLORS.ADR_YOL,
                    visibility:
                        visibility.adrYol &&
                        (filters.adrYol.tipi.includes(type) || filters.adrYol.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(combinedCollection, "tipi", type)
                }
            })
        }, [adrYol, visibility.adrYol, filters.adrYol.tipi, config]);


    return { yolLayerData: [adrYolFormatted], setAdrYol };
}