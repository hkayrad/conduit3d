import { useMemo, useState } from "react";
import { filterFeature } from "../utils/geometry/filterFeature";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { COLORS } from "../constants";
import { useAppSelector } from "./reduxHooks";
import { selectConfig } from "../../app/configSlice";
import { hexToRgba } from "../utils";

/**
 * Format the AG Hat feature collection.
 * @returns The formatted AG Hat feature collection.
 */
export function useHat() {
    const { visibility, filters, types } = useAppSelector(selectMapState)
    const config = useAppSelector(selectConfig);

    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection[]>([]);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection[]>([]);
    const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection[]>([]);

    const [overgroundLineWidth, setOvergroundLineWidth] = useState<number>(1);
    const [undergroundLineWidth, setUndergroundLineWidth] = useState<number>(1);

    /**
     * Formatted AG Hat data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const agHatFormatted = useMemo(() => {
        if (!agHat)
            return [];

        const combinedFeatures = agHat.flatMap(chunk => chunk?.features ?? []);
        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.agHat.map(type => {
            return {
                id: `ag-hat-${type}`,
                color: hexToRgba(config[`AG_HAT_${type}_COLOR`]) || COLORS.AG_HAT,
                visibility:
                    visibility.agHat &&
                    (filters.agHat.tipi.includes(type) || filters.agHat.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "cinsi", type)
            }
        })
    }, [agHat, visibility.agHat, filters.agHat.tipi, config]);

    /**
     * Formatted OG Hat data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const ogHatFormatted = useMemo(() => {
        if (!ogHat)
            return [];

        const combinedFeatures = ogHat.flatMap(chunk => chunk?.features ?? []);
        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.ogHat.map(type => {
            return {
                id: `og-hat-${type}`,
                color: hexToRgba(config[`OG_HAT_${type}_COLOR`]) || COLORS.OG_HAT,
                visibility:
                    visibility.ogHat &&
                    (filters.ogHat.tipi.includes(type) || filters.ogHat.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "cinsi", type)
            }
        })
    }, [ogHat, visibility.ogHat, filters.ogHat.tipi, config]);

    /**
     * Formatted Rekortman data for rendering on the map.
     * @memoized to optimize performance and avoid unnecessary recalculations.
     */
    const rekortmanFormatted = useMemo(() => {
        if (!rekortman)
            return [];

        const combinedFeatures = rekortman.flatMap(chunk => chunk?.features ?? []);
        const combinedCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: combinedFeatures
        };

        return types.rekortman.map(type => {
            return {
                id: `rekortman-${type}`,
                color: hexToRgba(config[`REKORTMAN_${type}_COLOR`]) || COLORS.REKORTMAN,
                visibility:
                    visibility.rekortman &&
                    (filters.rekortman.tipi.includes(type) || filters.rekortman.tipi.length === 0),
                cinsi: type,
                data: filterFeature(combinedCollection, "tipi", type)
            }
        })
    }, [rekortman, visibility.rekortman, filters.rekortman.tipi, config]);

    return {
        agHat,
        setAgHat,
        ogHat,
        setOgHat,
        rekortman,
        setRekortman,
        hatLayerData: [agHatFormatted, ogHatFormatted, rekortmanFormatted],
        overgroundLineWidth,
        setOvergroundLineWidth,
        undergroundLineWidth,
        setUndergroundLineWidth
    };
}