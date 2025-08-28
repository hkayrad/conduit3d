export function filterFeature(
    collection: GeoJSON.FeatureCollection | null,
    property: string,
    value: string
) {
    return collection?.features.filter(f => f.properties?.[property] === value) ?? [];
}