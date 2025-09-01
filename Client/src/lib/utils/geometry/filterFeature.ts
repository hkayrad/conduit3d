/**
 * Filter a GeoJSON FeatureCollection by a specific property value.
 * @param collection The GeoJSON FeatureCollection to filter.
 * @param property The property to filter by.
 * @param value The value to match.
 * @returns An array of matching features.
 */
export function filterFeature(
    collection: GeoJSON.FeatureCollection | null,
    property: string,
    value: string
) {
    return collection?.features.filter(f => f.properties?.[property] === value) ?? [];
}