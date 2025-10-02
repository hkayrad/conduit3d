export const DEBOUNCE_TIME_MS = 200;

export const MAX_ZOOM_LEVEL = 25;

export const MAX_POPUP_COUNT = 10;

export const MAX_SEARCH_RESULTS = 10;

export const EXTENT_PADDING = 0.001; // degrees
export const LON_EXTENT_PADDING = EXTENT_PADDING * 2; // degrees
export const LAT_EXTENT_PADDING = EXTENT_PADDING; // degrees

export const CHUNK_SIZE = 20000; // Number of records to load into a state at once
export const MAX_CHUNK_AMOUNT = 15; // Maximum number of chunks to load into a state
export const DATA_FETCH_DELAY_MS = 10; // Delay between chunk fetches to prevent overwhelming the server

export const MIN_ZOOM_THRESHOLD = 12; // Minimum zoom level to start loading detailed data

export const DEFAULT_FLOOR_HEIGHT = 2.5; // meters
export const DEFAULT_FLOOR_COUNT = 5; // floors

export const EMPTY_GEOMETRY_COLLECTION: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: []
};

export const COLORS: { [name: string]: [number, number, number, number] } = {
    HOVER: [222, 98, 27, 128],
    ADR_BINA: [200, 200, 200, 255],
    TRAFO_BINA: [0, 128, 128, 180],    // Teal, semi-transparent
    AG_DIREK: [30, 144, 255, 255],     // Dodger blue, opaque
    AYD_DIREK: [50, 205, 50, 255],     // Lime green, opaque
    OG_MUS_DIREK: [220, 20, 60, 255],  // Crimson, opaque
    AG_HAT: [255, 140, 0, 255],        // Dark orange, opaque
    OG_HAT: [138, 43, 226, 255],       // Blue violet, opaque
    REKORTMAN: [255, 0, 255, 255],
};

// export const MAP_STYLE = [
//     "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
//     "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
//     "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
//     "https://tiles.openfreemap.org/styles/positron",
//     "https://tiles.openfreemap.org/styles/bright",
//     "https://tiles.openfreemap.org/styles/liberty"
// ];