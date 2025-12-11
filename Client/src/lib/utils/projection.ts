import proj4 from "proj4";

/**
 * Common EPSG definitions for proj4
 * Add more as needed for your use case
 */

// WGS84 - standard GPS coordinates
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs +type=crs");

// Web Mercator - used by most web maps
proj4.defs(
	"EPSG:3857",
	"+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs",
);

// UTM Zone definitions (common zones for Turkey and surrounding regions)
// UTM Zone 35N (covers parts of Turkey)
proj4.defs("EPSG:32635", "+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs +type=crs");
// UTM Zone 36N (covers central Turkey)
proj4.defs("EPSG:32636", "+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs +type=crs");
// UTM Zone 37N (covers eastern Turkey)
proj4.defs("EPSG:32637", "+proj=utm +zone=37 +datum=WGS84 +units=m +no_defs +type=crs");
// UTM Zone 38N (covers far eastern Turkey)
proj4.defs("EPSG:32638", "+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs +type=crs");

// Additional common UTM zones
proj4.defs("EPSG:32632", "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs"); // Central Europe
proj4.defs("EPSG:32633", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs +type=crs"); // Central Europe
proj4.defs("EPSG:32634", "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs +type=crs"); // Eastern Europe

// Turkish National Grid (TUREF / TM30)
proj4.defs(
	"EPSG:5254",
	"+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);

// ED50 / UTM zones (older European datum, still used in some data)
proj4.defs(
	"EPSG:23035",
	"+proj=utm +zone=35 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs",
);
proj4.defs(
	"EPSG:23036",
	"+proj=utm +zone=36 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs",
);
proj4.defs(
	"EPSG:23037",
	"+proj=utm +zone=37 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs",
);

/**
 * List of supported CRS options for the UI dropdown
 */
export const SUPPORTED_CRS_OPTIONS = [
	{ code: "EPSG:4326", name: "WGS84 (GPS Coordinates)" },
	{ code: "EPSG:3857", name: "Web Mercator" },
	{ code: "EPSG:32635", name: "UTM Zone 35N" },
	{ code: "EPSG:32636", name: "UTM Zone 36N" },
	{ code: "EPSG:32637", name: "UTM Zone 37N" },
	{ code: "EPSG:32638", name: "UTM Zone 38N" },
	{ code: "EPSG:32632", name: "UTM Zone 32N" },
	{ code: "EPSG:32633", name: "UTM Zone 33N" },
	{ code: "EPSG:32634", name: "UTM Zone 34N" },
	{ code: "EPSG:5254", name: "TUREF / TM30 (Turkey)" },
	{ code: "EPSG:23035", name: "ED50 / UTM Zone 35N" },
	{ code: "EPSG:23036", name: "ED50 / UTM Zone 36N" },
	{ code: "EPSG:23037", name: "ED50 / UTM Zone 37N" },
] as const;

export type SupportedCRS = (typeof SUPPORTED_CRS_OPTIONS)[number]["code"];

/**
 * Reproject a single point from source CRS to target CRS
 * @param point [x, y] coordinates in source CRS
 * @param sourceCRS EPSG code of source coordinate system
 * @param targetCRS EPSG code of target coordinate system (default: EPSG:4326)
 * @returns [x, y] coordinates in target CRS
 */
export function reprojectPoint(
	point: [number, number],
	sourceCRS: string,
	targetCRS: string = "EPSG:4326",
): [number, number] {
	try {
		return proj4(sourceCRS, targetCRS, point) as [number, number];
	} catch (error) {
		console.error(`Failed to reproject point from ${sourceCRS} to ${targetCRS}:`, error);
		throw new Error(`Unsupported coordinate system: ${sourceCRS}`);
	}
}

/**
 * Reproject bounds from source CRS to target CRS (WGS84 by default)
 * @param bounds [west, south, east, north] or [minX, minY, maxX, maxY] in source CRS
 * @param sourceCRS EPSG code of source coordinate system
 * @param targetCRS EPSG code of target coordinate system (default: EPSG:4326)
 * @returns [west, south, east, north] bounds in target CRS
 */
export function reprojectBounds(
	bounds: [number, number, number, number],
	sourceCRS: string,
	targetCRS: string = "EPSG:4326",
): [number, number, number, number] {
	const [minX, minY, maxX, maxY] = bounds;

	// Reproject all four corners to handle rotation/skew in projections
	const corners: [number, number][] = [
		[minX, minY], // SW
		[minX, maxY], // NW
		[maxX, minY], // SE
		[maxX, maxY], // NE
	];

	const reprojectedCorners = corners.map((corner) => reprojectPoint(corner, sourceCRS, targetCRS));

	// Find the bounding box of all reprojected corners
	const xs = reprojectedCorners.map((c) => c[0]);
	const ys = reprojectedCorners.map((c) => c[1]);

	return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/**
 * Check if a CRS code is supported
 * @param crsCode EPSG code to check
 * @returns true if the CRS is defined in proj4
 */
export function isCRSSupported(crsCode: string): boolean {
	try {
		return proj4.defs(crsCode) !== undefined;
	} catch {
		return false;
	}
}

/**
 * Try to normalize a CRS string to EPSG format
 * @param crs CRS string (e.g., "32636", "EPSG:32636", "urn:ogc:def:crs:EPSG::32636")
 * @returns Normalized EPSG code or null if not recognized
 */
export function normalizeCRS(crs: string | number | null | undefined): string | null {
	if (!crs) return null;

	const crsStr = String(crs);

	// Already in EPSG:XXXX format
	if (crsStr.startsWith("EPSG:")) {
		return crsStr;
	}

	// OGC URN format
	const urnMatch = crsStr.match(/urn:ogc:def:crs:EPSG::?(\d+)/i);
	if (urnMatch) {
		return `EPSG:${urnMatch[1]}`;
	}

	// Just a number
	if (/^\d+$/.test(crsStr)) {
		return `EPSG:${crsStr}`;
	}

	// WKT format - try to extract EPSG code
	const wktMatch = crsStr.match(/AUTHORITY\["EPSG","(\d+)"\]/i);
	if (wktMatch) {
		return `EPSG:${wktMatch[1]}`;
	}

	return null;
}

export { proj4 };
