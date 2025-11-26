import { useMemo, useState } from "react";
import { COLORS } from "../constants";
import { useAppSelector } from "./reduxHooks";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { hexToRgba } from "../utils";
import { selectConfig } from "../../app/configSlice";

/**
 * Format the Armatur feature collection.
 * @param allPoles - All pole features to link armaturs to.
 * @returns The formatted Armatur feature collection.
 */
export function useArmatur(allPoles: GeoJSON.Feature[]) {
    const { visibility } = useAppSelector(selectMapState);
    const config = useAppSelector(selectConfig);

    const [armatur, setArmatur] = useState<GeoJSON.FeatureCollection[]>([]);

    /**
     * Formatted Armatur data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const armaturLayerData = useMemo(() => {
        if (!armatur) return [];

        const combinedFeatures = armatur.flatMap((chunk) => chunk?.features ?? []);

        // Link Armaturs to Poles
        const linkedFeatures = combinedFeatures.map(feature => {
            const poleId = feature.properties?.bagli_tablo_kayit_id;
            if (poleId) {
                const pole = allPoles.find(p => p.properties?.id === poleId);
                if (pole) {
                    // Use pole's coordinates but keep armatur's properties
                    // Or update armatur's elevation based on pole's height
                    // For now, let's assume we want to place it at the pole's location with an offset or just ensure it has the pole's height info
                    const poleHeight = pole.properties?.yukseklik || 0;
                    // We can add a property to the feature to be used by the layer for elevation
                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            poleHeight: poleHeight,
                            // If we want to strictly snap to pole coordinates:
                            // ...pole.geometry
                        }
                    };
                }
            }
            return feature;
        });


        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: linkedFeatures,
        };

        return [{
            id: "armatur-layer",
            data: combinedCollection.features,
            color: hexToRgba(config.ARMATUR_COLOR || "#ffffff") || COLORS.ARMATUR,
            visibility: visibility.armatur,
        }];
    }, [armatur, visibility.armatur, config, allPoles]);

    return {
        armatur,
        setArmatur,
        armaturLayerData,
    };
}
