import { useMemo, useState } from "react";
import { filterFeature } from "../utils/geometry/filterFeature";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { COLORS } from "../constants";
import { useAppSelector } from "./reduxHooks";

/**
 * Format the AG Hat feature collection.
 * @returns The formatted AG Hat feature collection.
 */
export function useHat() {
    const { visibility, filters, types } = useAppSelector(selectMapState)

    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection[]>([]);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection[]>([]);
    const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection[]>([]);

    /**
     * Formatted AG Hat data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const agHatFormatted = useMemo(() => {
        if (!agHat)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        agHat.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.agHat.map(type => {
            return {
                id: `ag-hat-${type}`,
                color: COLORS.AG_HAT,
                visibility:
                    visibility.agHat &&
                    (filters.agHat.tipi.includes(type) || filters.agHat.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "cinsi", type)
            }
        })
    }, [agHat, visibility.agHat, filters.agHat.tipi]);

    /**
     * Formatted OG Hat data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const ogHatFormatted = useMemo(() => {
        if (!ogHat)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        ogHat.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.ogHat.map(type => {
            return {
                id: `og-hat-${type}`,
                color: COLORS.OG_HAT,
                visibility:
                    visibility.ogHat &&
                    (filters.ogHat.tipi.includes(type) || filters.ogHat.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "cinsi", type)
            }
        })
    }, [ogHat, visibility.ogHat, filters.ogHat.tipi]);

    /**
     * Formatted Rekortman data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const rekortmanFormatted = useMemo(() => {
        if (!rekortman)
            return [];

        // Combine all chunks into a single FeatureCollection
        const combinedFeatures: GeoJSON.Feature[] = [];
        rekortman.forEach(chunk => {
            if (chunk && chunk.features) {
                combinedFeatures.push(...chunk.features);
            }
        });

        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.rekortman.map(type => {
            return {
                id: `rekortman-${type}`,
                color: COLORS.REKORTMAN,
                visibility:
                    visibility.rekortman &&
                    (filters.rekortman.tipi.includes(type) || filters.rekortman.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "tipi", type)
            }
        })
    }, [rekortman, visibility.rekortman, filters.rekortman.tipi]);

    return {
        agHat,
        setAgHat,
        ogHat,
        setOgHat,
        rekortman,
        setRekortman,
        hatLayerData: [agHatFormatted, ogHatFormatted, rekortmanFormatted]
    };
}