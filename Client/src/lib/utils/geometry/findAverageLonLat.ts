/**
 * Find the average longitude and latitude of a GeoJSON geometry.
 * @param feature GeoJSON Geometry
 * @returns A tuple containing the average longitude and latitude.
 */
export function findAverageLonLat(feature: GeoJSON.Geometry, trimLength: number = 20): [number, number] {
    if (!feature) return [0, 0];

    const coords = feature.type === "Point" ? [feature.coordinates] :
        feature.type === "LineString" ? feature.coordinates :
            feature.type === "Polygon" ? feature.coordinates[0] :
                [];

    if (coords.length === 0) return [0, 0];

    const sum = coords.reduce((acc, coord) => {
        acc[0] += coord[0];
        acc[1] += coord[1];
        return acc;
    }, [0, 0]);

    return [Number((sum[0] / coords.length).toFixed(trimLength)), Number((sum[1] / coords.length).toFixed(trimLength))];
}