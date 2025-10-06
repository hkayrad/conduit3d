import { HatCinsi } from "../../enums";
import { findClosestPoleHeight } from "..";

/**
 * Convert a GeoJSON LineString feature into an array of segments.
 * @param feature The GeoJSON feature to convert.
 * @param featureType The type of the feature (HatCinsi).
 * @param poles An array of pole features to use for height calculations.
 * @param offset An optional height offset to apply to the segments.
 * @returns An array of segment features.
 */
export function lineStringToSegments(feature: any, featureType: HatCinsi, poles: GeoJSON.Feature[], offset: number = 0): any[] {
    if (!feature) return [];
    const coords = feature.geometry.coordinates;
    var segments = [];
    for (let i = 0; i < coords.length - 1; i++) {
        segments.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [...coords[i], featureType === HatCinsi.HAVAI
                        ? findClosestPoleHeight(coords[i], poles) + offset
                        : 0],
                    [...coords[i + 1], featureType === HatCinsi.HAVAI
                        ? findClosestPoleHeight(coords[i + 1], poles) + offset
                        : 0],
                ]
            },
            properties: feature.properties
        });
    }
    return segments;
}