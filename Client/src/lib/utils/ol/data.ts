export const normalizeGeoJSONData = (data: any) => {
    if (!data) return null;

    // If data is an array, wrap it in a FeatureCollection
    if (Array.isArray(data)) {
        if (data.length === 0) return null;
        return {
            type: "FeatureCollection",
            features: data,
        };
    }

    // If data already has a features property, use it as-is
    if (data.features) {
        if (data.features.length === 0) return null;
        return data;
    }

    // Otherwise, assume it's already a valid GeoJSON object
    return data;
};
