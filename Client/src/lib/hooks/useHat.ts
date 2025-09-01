import { useMemo } from "react";
import { filterFeature } from "../utils/geometry/filterFeature";
import type { MapState } from "../../app/layout/map/mapSlice";
import { COLORS } from "../constants";

/**
 * Format the AG Hat feature collection.
 * @param agHat The AG Hat feature collection.
 * @param ogHat The OG Hat feature collection.
 * @param rekortman The Rekortman feature collection.
 * @param types The map state types.
 * @param filters The map state filters.
 * @param visibility The map state visibility.
 * @returns The formatted AG Hat feature collection.
 */
export function useHat(
    agHat: GeoJSON.FeatureCollection,
    ogHat: GeoJSON.FeatureCollection,
    rekortman: GeoJSON.FeatureCollection,
    types: MapState["types"],
    filters: MapState["filters"],
    visibility: MapState["visibility"]) {
    const agHatFormatted = useMemo(() => {
        if (agHat)
            return types.agHat.map(type => {
                return {
                    id: `ag-hat-${type}`,
                    color: COLORS.AG_HAT,
                    visibility:
                        visibility.agHat &&
                        (filters.agHat.tipi.includes(type) || filters.agHat.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(agHat, "cinsi", type)
                }
            })
        else
            return [];
    }, [agHat, visibility.agHat, filters.agHat.tipi]);

    const ogHatFormatted = useMemo(() => {
        if (ogHat)
            return types.ogHat.map(type => {
                return {
                    id: `og-hat-${type}`,
                    color: COLORS.OG_HAT,
                    visibility:
                        visibility.ogHat &&
                        (filters.ogHat.tipi.includes(type) || filters.ogHat.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(ogHat, "cinsi", type)
                }
            })
        else
            return [];
    }, [ogHat, visibility.ogHat, filters.ogHat.tipi]);

    const rekortmanFormatted = useMemo(() => {
        if (rekortman)
            return types.rekortman.map(type => {
                return {
                    id: `rekortman-${type}`,
                    color: COLORS.REKORTMAN,
                    visibility:
                        visibility.rekortman &&
                        (filters.rekortman.tipi.includes(type) || filters.rekortman.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(rekortman, "tipi", type)
                }
            })
        else
            return [];
    }, [rekortman, visibility.rekortman, filters.rekortman.tipi]);

    return { hatLayerData: [agHatFormatted, ogHatFormatted, rekortmanFormatted] };
}