export const DEBOUNCE_TIME_MS = 500;

export const MAX_ZOOM = 25;

export const COLORS: { [name: string]: [number, number, number, number] } = {
    HOVER: [222, 98, 27, 128],
    ADR_BINA: [200, 200, 200, 255],
    TRAFO_BINA: [0, 128, 128, 180],    // Teal, semi-transparent
    AG_DIREK: [30, 144, 255, 230],     // Dodger blue, opaque
    AYD_DIREK: [50, 205, 50, 230],     // Lime green, opaque
    OG_MUS_DIREK: [220, 20, 60, 230],  // Crimson, opaque
    AG_HAT: [255, 140, 0, 230],        // Dark orange, opaque
    OG_HAT: [138, 43, 226, 230],       // Blue violet, opaque
    REKORTMAN: [255, 0, 255, 230],
};

export const MAP_STYLE = [
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    "https://tiles.openfreemap.org/styles/positron",
    "https://tiles.openfreemap.org/styles/bright",
    "https://tiles.openfreemap.org/styles/liberty"
];