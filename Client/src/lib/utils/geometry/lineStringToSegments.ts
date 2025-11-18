import { HatCinsi, HatTipi } from "../../enums";
import { findClosestPoleHeight } from "..";

/**
 * Convert a GeoJSON LineString feature into an array of segments.
 * @param feature The GeoJSON feature to convert.
 * @param featureType The type of the feature (HatCinsi).
 * @param poles An array of pole features to use for height calculations.
 * @param offset An optional height offset to apply to the segments.
 * @returns An array of segment features.
 */

const classHeight = {
	[HatTipi.AG]: -2.5,
	[HatTipi.OG]: -5,
	[HatTipi.AYD]: -7.5,
	[HatTipi.BARA]: 0.1,
	[HatTipi.YERALTI]: -1,
	[HatTipi.HAVAI]: 0,
};

export function lineStringToSegments(
	feature: any,
	featureType: HatCinsi,
	featureClass: HatTipi,
	poles: GeoJSON.Feature[],
	offset: number = 0,
): any[] {
	if (!feature) return [];
	const coords = feature.geometry.coordinates;
	const segments = [];
	for (let i = 0; i < coords.length - 1; i++) {
		segments.push({
			type: "Feature",
			geometry: {
				type: "LineString",
				coordinates: [
					[
						...coords[i],
						featureType === HatCinsi.HAVAI
							? findClosestPoleHeight(coords[i], poles) + offset
							: classHeight[featureClass],
					],
					[
						...coords[i + 1],
						featureType === HatCinsi.HAVAI
							? findClosestPoleHeight(coords[i + 1], poles) + offset
							: classHeight[featureClass],
					],
				],
			},
			properties: feature.properties,
		});
	}
	return segments;
}
