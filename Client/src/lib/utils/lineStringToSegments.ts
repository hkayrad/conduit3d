import findClosestPoleHeight from "./findClosestPoleHeight";

export function lineStringToSegments(feature: any, featureType: string, poles: any[], offset: number = 0): any[] {
    if (!feature) return [];
    const coords = feature.geometry.coordinates;
    var segments = [];
    for (let i = 0; i < coords.length - 1; i++) {
        segments.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [...coords[i], featureType === "HAVAİ"
                        ? findClosestPoleHeight(coords[i], poles) + offset
                        : 0],
                    [...coords[i + 1], featureType === "HAVAİ"
                        ? findClosestPoleHeight(coords[i + 1], poles) + offset
                        : 0],
                ]
            },
            properties: feature.properties
        });
    }
    return segments;
}