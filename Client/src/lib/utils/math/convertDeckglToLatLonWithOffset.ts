export function convertDeckGLToLatLonWithOffset(
    x: number,
    y: number,
    baseLatitude: number,
    baseLongitude: number
) {
    const METERS_TO_DEGREES_LAT = 1 / 111320;
    const METERS_TO_DEGREES_LON = 1 / (111320 * Math.cos(baseLatitude * Math.PI / 180));

    const latitudeOffset = y * METERS_TO_DEGREES_LAT;
    const longitudeOffset = x * METERS_TO_DEGREES_LON;

    const newLatitude = baseLatitude + latitudeOffset;
    const newLongitude = baseLongitude + longitudeOffset;

    return {
        latitude: newLatitude,
        longitude: newLongitude,
    };
}