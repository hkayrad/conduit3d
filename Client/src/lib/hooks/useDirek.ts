import { useMemo, useState } from "react"
import { filterFeature } from "../utils/geometry/filterFeature";
import { COLORS } from "../constants";
import { useAppSelector } from "./reduxHooks";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { hexToRgba } from "../utils";
import { selectConfig } from "../../app/configSlice";

/**
 * Format the AG Direk feature collection.
 * @returns The formatted AG Direk feature collection.
*/
export function useDirek() {
    const { visibility, filters, types } = useAppSelector(selectMapState);
    const config = useAppSelector(selectConfig);

    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection[]>([]);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection[]>([]);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection[]>([]);
    /**
     * Formatted AG Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const agDirekFormatted = useMemo(() => {
        if (!agDirek)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        agDirek.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.agDirek.map(type => {
            return {
                id: `ag-direk-${type}`,
                data: filterFeature(combinedCollection, "tipi", type),
                color: hexToRgba(config.AG_DIREK_COLOR) || COLORS.AG_DIREK,
                visibility:
                    visibility.agDirek &&
                    (filters.agDirek.tipi.includes(type) || filters.agDirek.tipi.length === 0),
            }
        });
    }, [agDirek, visibility.agDirek, filters.agDirek.tipi, config]);

    /**
     * Formatted OG Mus Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const ogMusDirekFormatted = useMemo(() => {
        if (!ogMusDirek)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        ogMusDirek.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.ogMusDirek.map(type => {
            return {
                id: `og-mus-direk-${type}`,
                data: filterFeature(combinedCollection, "tipi", type),
                color: hexToRgba(config.OG_MUS_DIREK_COLOR) || COLORS.OG_MUS_DIREK,
                visibility:
                    visibility.ogMusDirek &&
                    (filters.ogMusDirek.tipi.includes(type) || filters.ogMusDirek.tipi.length === 0),
            }
        });
    }, [ogMusDirek, visibility.ogMusDirek, filters.ogMusDirek.tipi, config]);

    /**
     * Formatted AYD Direk data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const aydDirekFormatted = useMemo(() => {
        if (!aydDirek)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        aydDirek.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.aydDirek.map(type => {
            return {
                id: `ayd-direk-${type}`,
                data: filterFeature(combinedCollection, "tipi", type),
                color: hexToRgba(config.AYD_DIREK_COLOR) || COLORS.AYD_DIREK,
                visibility:
                    visibility.aydDirek &&
                    (filters.aydDirek.tipi.includes(type) || filters.aydDirek.tipi.length === 0),
            }
        });
    }, [aydDirek, visibility.aydDirek, filters.aydDirek.tipi, config]);

    /**
     * All poles combined into a single array for easy access.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const allPoles: GeoJSON.Feature[] = useMemo(() => {
        if (!agDirek || !ogMusDirek || !aydDirek)
            return [];

        const agFeatures = agDirek.flatMap(fc => fc.features ?? []);
        const ogMusFeatures = ogMusDirek.flatMap(fc => fc.features ?? []);
        const aydFeatures = aydDirek.flatMap(fc => fc.features ?? []);
        return [...agFeatures, ...ogMusFeatures, ...aydFeatures];
    }, [agDirek, ogMusDirek, aydDirek])

    return {
        agDirek,
        setAgDirek,
        ogMusDirek,
        setOgMusDirek,
        aydDirek,
        setAydDirek,
        direkLayerData: [agDirekFormatted, ogMusDirekFormatted, aydDirekFormatted],
        allPoles
    };
}