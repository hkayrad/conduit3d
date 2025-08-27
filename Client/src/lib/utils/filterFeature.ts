import type { HatCinsi } from "../enums";

export function filterHat(
    collection: GeoJSON.FeatureCollection | null,
    property: string,
    value: HatCinsi
) {
    return collection?.features.filter(f => f.properties?.[property] === value) ?? [];
}