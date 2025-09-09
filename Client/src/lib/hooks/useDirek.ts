import { useMemo } from "react"
import type { MapState } from "../../app/layout/map/mapSlice"
import { filterFeature } from "../utils/geometry/filterFeature";
import { COLORS } from "../constants";

/**
 * Format the AG Direk feature collection.
 * @param agDirek The AG Direk feature collection.
 * @param ogMusDirek The OG Mus Direk feature collection.
 * @param aydDirek The Ayd Direk feature collection.
 * @param types The map state types.
 * @param filters The map state filters.
 * @param visibility The map state visibility.
 * @returns The formatted AG Direk feature collection.
*/
export function useDirek(
    agDirek: GeoJSON.FeatureCollection,
    ogMusDirek: GeoJSON.FeatureCollection,
    aydDirek: GeoJSON.FeatureCollection,
    types: MapState["types"],
    filters: MapState["filters"],
    visibility: MapState["visibility"]
) {
    /**
     * Formatted AG Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const agDirekFormatted = useMemo(() => {
        if (!agDirek)
            return [];

        return types.agDirek.map(type => {
            return {
                id: `ag-direk-${type}`,
                data: filterFeature(agDirek, "tipi", type),
                color: COLORS.AG_DIREK,
                visibility:
                    visibility.agDirek &&
                    (filters.agDirek.tipi.includes(type) || filters.agDirek.tipi.length === 0),
            }
        });
    }, [agDirek, visibility.agDirek, filters.agDirek.tipi]);

    /**
     * Formatted OG Mus Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const ogMusDirekFormatted = useMemo(() => {
        if (!ogMusDirek)
            return [];

        return types.ogMusDirek.map(type => {
            return {
                id: `og-mus-direk-${type}`,
                data: filterFeature(ogMusDirek, "tipi", type),
                color: COLORS.OG_MUS_DIREK,
                visibility:
                    visibility.ogMusDirek &&
                    (filters.ogMusDirek.tipi.includes(type) || filters.ogMusDirek.tipi.length === 0),
            }
        });
    }, [ogMusDirek, visibility.ogMusDirek, filters.ogMusDirek.tipi]);

    /**
     * Formatted AYD Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const aydDirekFormatted = useMemo(() => {
        if (!aydDirek)
            return [];

        return types.aydDirek.map(type => {
            return {
                id: `ayd-direk-${type}`,
                data: filterFeature(aydDirek, "tipi", type),
                color: COLORS.AYD_DIREK,
                visibility:
                    visibility.aydDirek &&
                    (filters.aydDirek.tipi.includes(type) || filters.aydDirek.tipi.length === 0),
            }
        });
    }, [aydDirek, visibility.aydDirek, filters.aydDirek.tipi]);

    /**
     * All poles combined into a single array for easy access.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const allPoles: GeoJSON.Feature[] = useMemo(() => {
        if (!agDirek || !ogMusDirek || !aydDirek)
            return [];

        return [...agDirek.features, ...ogMusDirek.features, ...aydDirek.features]
    }, [agDirek, ogMusDirek, aydDirek])

    return {
        direkLayerData: [agDirekFormatted, ogMusDirekFormatted, aydDirekFormatted],
        allPoles
    };
}